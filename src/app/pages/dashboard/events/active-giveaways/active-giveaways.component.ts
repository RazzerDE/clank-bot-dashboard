import {Component, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {faPlay, faSearch, faStop, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {faGift} from "@fortawesome/free-solid-svg-icons/faGift";
import {TableConfig} from "../../../../services/types/Config";
import {faPencil} from "@fortawesome/free-solid-svg-icons/faPencil";
import {Giveaway} from "../../../../services/types/Events";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "../../../../services/api/api.service";
import {ModalComponent} from "../../../../structure/util/modal/modal.component";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {ComService} from "../../../../services/discord-com/com.service";
import {DatePipe} from "../../../../pipes/date/date.pipe";
import {MarkdownPipe} from "../../../../pipes/markdown/markdown.pipe";

@Component({
  selector: 'app-active-giveaways',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    DataTableComponent,
    ModalComponent,
    AlertBoxComponent,
  ],
  templateUrl: './active-giveaways.component.html',
  styleUrl: './active-giveaways.component.scss'
})
export class ActiveGiveawaysComponent implements OnDestroy {
  private initGiveaway: Giveaway = { creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, prize: '',
    channel_id: null, end_date: new Date(Date.now() + 10 * 60 * 6000), winner_count: 1, participants: 0, start_date: null };
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faGift: IconDefinition = faGift;
  protected readonly faRefresh: IconDefinition = faRefresh;
  private readonly subscription: Subscription | null;

  public giveaway: Giveaway = { ...this.initGiveaway };
  protected events: Giveaway[] = [];
  protected filteredEvents: Giveaway[] = [...this.events]; // Initially, all events are shown
  protected modalType: string = 'EVENTS_CREATE';
  protected modalObj: Giveaway = this.giveaway;

  protected disableSendBtn: boolean = false;
  protected disabledCacheBtn: boolean = false;
  private dateCustomPipe: DatePipe = new DatePipe();
  private markdownPipe: MarkdownPipe = new MarkdownPipe();
  @ViewChild(ModalComponent) private modal!: ModalComponent;

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private comService: ComService,
              private translate: TranslateService) {
    document.title = 'Active Events - Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.getGuildEvents(); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.getGuildEvents(true);
      }
    });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /**
   * Fetches the active giveaways for the current guild (and scheduled ones).
   *
   * If cached data is available and valid (within 30 seconds), it loads the giveaways from localStorage.
   * Otherwise, it fetches the data from the API, updates the local cache, and handles loading states.
   * Handles various HTTP errors by redirecting to appropriate error pages.
   *
   * @param {boolean} [no_cache] - If true, ignores the cache and fetches fresh data from the API.
   */
  protected getGuildEvents(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }

    // check if guilds are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('active_events') && localStorage.getItem('active_events_timestamp') &&
      Date.now() - Number(localStorage.getItem('active_events_timestamp')) < 30000) && !no_cache) {
      this.events = JSON.parse(localStorage.getItem('active_events') as string);
      this.filteredEvents = this.events;
      this.dataService.getEventConfig(this.apiService, this.comService, no_cache);
      return;
    }

    const sub: Subscription = this.apiService.getGuildEvents(this.dataService.active_guild.id)
      .subscribe({
        next: (giveaways: Giveaway[]): void => {
          this.events = giveaways;
          this.filteredEvents = this.events;

          setTimeout((): void => { this.dataService.getEventConfig(this.apiService, this.comService, no_cache); }, 500);
          localStorage.setItem('active_events', JSON.stringify(this.events));
          localStorage.setItem('active_events_timestamp', Date.now().toString());
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;

          if (err.status === 403) {
            this.dataService.redirectLoginError('FORBIDDEN');
            return;
          } else if (err.status === 401) {
            this.dataService.redirectLoginError('NO_CLANK');
            return;
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (err.status === 0) {
            this.dataService.redirectLoginError('OFFLINE');
            return;
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }
          sub.unsubscribe();
        }
      })
  }

  /**
   * Adds a new scheduled giveaway event to the current guild.
   *
   * Sends the provided giveaway data to the backend API for creation. On success, updates the local event list,
   * resets the input fields, and displays a success alert. Handles and displays errors for known HTTP status codes.
   *
   * @param {Giveaway} giveaway - The giveaway object to be created and added.
   */
  protected addGuildEvent(giveaway: Giveaway): void {
    if (!this.dataService.active_guild || !this.dataService.profile) { return; }
    if (!giveaway.start_date) { giveaway.start_date = new Date(); } else { giveaway.start_date = new Date(giveaway.start_date).toISOString(); }
    giveaway.end_date = new Date(giveaway.end_date).toISOString();
    giveaway.creator_id = this.dataService.profile.id;
    giveaway.creator_name = this.dataService.profile.username;
    giveaway.creator_avatar = `https://cdn.discordapp.com/avatars/${giveaway.creator_id}/${this.dataService.profile.avatar}`;
    giveaway.guild_id = this.dataService.active_guild!.id;
    giveaway.channel_id = giveaway.channel_id![0];
    this.disableSendBtn = true;

    const { participants, ...giveawayToSend } = giveaway;
    const sent_gw: Subscription = this.apiService.createGuildEvent(giveawayToSend)
      .subscribe({
        next: (created_giveaway: Giveaway): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_GIVEAWAY_CREATION_TITLE'),
            this.translate.instant('SUCCESS_GIVEAWAY_CREATION_DESC', { name: this.markdownPipe.transform(created_giveaway.prize),
              start: this.dateCustomPipe.transform(created_giveaway.start_date, this.translate.currentLang)}));

          // update shown data
          this.events.push(created_giveaway);
          this.filteredEvents = this.sortEvents([...this.events]);
          localStorage.setItem('active_events', JSON.stringify(this.events));
          this.disableSendBtn = false;
          sent_gw.unsubscribe();
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';

          if (error.status === 406) { // sponsor not found
            this.dataService.showAlert(this.translate.instant('ERROR_GIVEAWAY_406'),
              this.translate.instant('ERROR_GIVEAWAY_406_DESC', { sponsor: giveaway.sponsor_id }));
          } else if (error.status === 409) { // already exist / invalid data
            this.dataService.showAlert(this.translate.instant('ERROR_GIVEAWAY_CREATION_CONFLICT'),
              this.translate.instant('ERROR_GIVEAWAY_CREATION_CONFLICT_DESC'));
          } else if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          this.disableSendBtn = false;
          sent_gw.unsubscribe();
        }
      });

    this.modal.hideModal();
  }

  /**
   * Updates an existing, running giveaway event for the current guild.
   *
   * Sends the modified giveaway object to the backend API. On success, updates the local event list,
   * restores the participants count, and displays a success alert. Handles and displays errors for known HTTP status codes.
   * If the giveaway is not found (404), removes it from the local list. Closes the modal after completion.
   *
   * @param {Giveaway} giveaway - The giveaway object to be updated.
   * @param {'END_' | ''} [action=''] - The action type for the giveaway (default is edit all).
   */
  protected editGuildEvent(giveaway: Giveaway, action: 'END_' | '' = ''): void {
    if (!this.dataService.active_guild) { return; }
    const index: number = this.events.findIndex((gw: Giveaway): boolean => (gw.message_id === giveaway.message_id
                                                                        && gw.channel_id === giveaway.channel_id));
    const participants: number = giveaway.participants || 0; // ensure participants is defined
    const org_price: string = this.markdownPipe.transform(giveaway.prize);

    if (action === 'END_') {
      giveaway.end_date = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // set end date to 5 minutes ago
    } else {
      giveaway.end_date = new Date(giveaway.end_date).toISOString();
    }

    const edited_gw: Subscription = this.apiService.updateGuildEvent(giveaway)
      .subscribe({
        next: (giveaway: Giveaway): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant(`SUCCESS_GIVEAWAY_EDITED_${action}TITLE`),
            this.translate.instant(`SUCCESS_GIVEAWAY_EDITED_${action}DESC`, { name: org_price }));

          // update shown data (find correct giveaway and replace it)
          giveaway.participants = participants; // restore participants count
          if (index !== -1) { this.events[index] = giveaway; }
          this.filteredEvents = this.sortEvents([...this.events]);
          localStorage.setItem('active_events', JSON.stringify(this.events));
          edited_gw.unsubscribe();
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';

          if (error.status === 404) { // already exist / invalid data
            this.dataService.showAlert(this.translate.instant('ERROR_GIVEAWAY_EDIT_404'),
              this.translate.instant('ERROR_GIVEAWAY_EDIT_404_DESC'));
            if (index !== -1) { this.events.splice(index, 1); this.filteredEvents = this.sortEvents([...this.events]); }
            localStorage.setItem('active_events', JSON.stringify(this.events));
          } else if (error.status === 406) { // sponsor not found
            this.dataService.showAlert(this.translate.instant('ERROR_GIVEAWAY_406'),
              this.translate.instant('ERROR_GIVEAWAY_406_DESC', { sponsor: giveaway.sponsor_id }));
          } else if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          edited_gw.unsubscribe();
        }
      });

    this.modal.hideModal();
  }

  /**
   * Deletes a (scheduled) giveaway event from the current guild.
   *
   * Sends a request to the backend API to remove the specified giveaway. On success, removes the giveaway
   * from the local event list and updates the cache. Handles and displays errors for known HTTP status codes.
   * Closes the modal after completion.
   *
   * @param {Giveaway} giveaway - The giveaway object to be deleted.
   */
  protected deleteGuildEvent(giveaway: Giveaway): void {
    if (!this.dataService.active_guild) { return; }
    const index: number = this.events.findIndex((gw: Giveaway): boolean => (gw.event_id === giveaway.event_id
      && gw.guild_id === giveaway.guild_id));

    const org_price: string = this.markdownPipe.transform(giveaway.prize);
    const removed_gw: Subscription = this.apiService.deleteGuildEvent(giveaway)
      .subscribe({
        next: (_: Object): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_GIVEAWAY_REMOVED_TITLE'),
            this.translate.instant('SUCCESS_GIVEAWAY_REMOVED_DESC', { name: org_price }));

          // update shown data (find correct giveaway and remove it)
          if (index !== -1) { this.events.splice(index, 1); this.filteredEvents = this.sortEvents([...this.events]); }
          localStorage.setItem('active_events', JSON.stringify(this.events));
          removed_gw.unsubscribe();
        },
        error: (error: HttpErrorResponse): void => {
          this.handleScheduledError(error, index);
          removed_gw.unsubscribe();
        }
      });

    this.modal.hideModal();
  }

  /**
   * Starts a scheduled giveaway event for the current guild.
   *
   * Sends a request to the backend API to start the specified scheduled giveaway.
   * On success, updates the local event list and cache, and displays a success alert.
   * Handles and displays errors for known HTTP status codes (404: not found, 429: rate limit).
   * Closes the modal after completion.
   *
   * @param {Giveaway} giveaway - The scheduled giveaway object to be started.
   * @returns {void}
   */
  protected startScheduledEvent(giveaway: Giveaway): void {
    if (!this.dataService.active_guild) { return; }
    const index: number = this.events.findIndex((gw: Giveaway): boolean => (gw.event_id === giveaway.event_id
      && gw.guild_id === giveaway.guild_id));

    const org_price: string = this.markdownPipe.transform(giveaway.prize);
    const started_gw: Subscription = this.apiService.startScheduledEvent(giveaway)
      .subscribe({
        next: (giveaway: Giveaway): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_GIVEAWAY_EDITED_START_TITLE'),
            this.translate.instant('SUCCESS_GIVEAWAY_EDITED_START_DESC', { name: org_price }));

          // update shown data (find correct giveaway and replace it)
          if (index !== -1) { this.events[index] = giveaway; }
          this.filteredEvents = this.sortEvents([...this.events]);
          localStorage.setItem('active_events', JSON.stringify(this.events));
          started_gw.unsubscribe();
        },
        error: (error: HttpErrorResponse): void => {
          this.handleScheduledError(error, index);
          started_gw.unsubscribe();
        }
      });

    this.modal.hideModal();
  }

  /**
   * Handles errors that occur during scheduled giveaway operations.
   *
   * Displays appropriate alerts based on the HTTP error status:
   * - 404: Shows a not found alert and removes the event from the local list.
   * - 429: Triggers a rate limit error redirect.
   * - Other: Shows a generic unknown error alert.
   *
   * @param {HttpErrorResponse} error - The HTTP error response object.
   * @param {number} index - The index of the affected event in the local events array.
   * @returns {void}
   */
  private handleScheduledError(error: HttpErrorResponse, index: number): void {
    this.dataService.error_color = 'red';

    if (error.status === 404) { // doesnt exist
      this.dataService.showAlert(this.translate.instant('ERROR_GIVEAWAY_EDIT_404'),
        this.translate.instant('ERROR_GIVEAWAY_REMOVED_404_DESC'));
      if (index !== -1) { this.events.splice(index, 1); this.filteredEvents = this.sortEvents([...this.events]); }
      localStorage.setItem('active_events', JSON.stringify(this.events));
    } else if (error.status == 429) {
      this.dataService.redirectLoginError('REQUESTS');
      return;
    } else {
      this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
    }
  }

  /**
   * Opens a modal dialog of the specified type (and optionally pre-fills it with snippet data).
   *
   * @param {string} type - The type of modal to open (e.g., 'EVENTS_CREATE', 'EVENTS_EDIT').
   * @param {Giveaway} [giveaway] - Optional giveaway data to pre-fill the modal
   */
  protected openModal(type: 'EVENTS_CREATE' | 'EVENTS_EDIT', giveaway?: Giveaway): void {
    this.dataService.getGuildChannels(this.comService);  // fetch guild channels for the select dropdown
    if (giveaway && type != 'EVENTS_CREATE') {
      const event: Giveaway = { ...giveaway };
      event.prize = event.prize.replace(/<a?:\w+:\d+>/g, '').trim();
      this.modalObj = event;
    } else {
      this.modalObj = { ...this.initGiveaway };
    }

    this.modalType = type;
    this.modal.showModal();
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 15 seconds.
   */
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.getGuildEvents(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
  }

  /**
   * Filters the active giveaways based on the search term entered by the user.
   *
   * This method updates the `filteredEvents` array to include only the active giveaways
   * whose names contain the search term. The search is case-insensitive.
   *
   * @param {Event} event - The input event triggered by the search field.
   */
  protected searchGiveaways(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredEvents = this.events.filter(giveaway =>
      giveaway.creator_id.toString().toLowerCase().includes(searchTerm) ||
      giveaway.creator_name.toString().toLowerCase().includes(searchTerm) ||
      giveaway.sponsor_id?.toString().toLowerCase().includes(searchTerm) ||
      giveaway.sponsor_name?.toString().toLowerCase().includes(searchTerm) ||
      giveaway.prize.toLowerCase().includes(searchTerm) || giveaway.gw_req?.toLowerCase().includes(searchTerm));
  }

  /**
   * Sorts events based on specific criteria:
   * 1. Events with start_date === null come first, sorted by end_date (closest first)
   * 2. Events with start_date !== null come last, sorted by start_date, then end_date
   * 3. Alphabetical sorting by prize as final criterion
   *
   * @param {Giveaway[]} events - The events to sort
   * @returns {Giveaway[]} The sorted events array
   */
  private sortEvents(events: Giveaway[]): Giveaway[] {
    return events.sort((a: Giveaway, b: Giveaway): number => {
      const aHasStartDate: boolean = a.start_date !== null;
      const bHasStartDate: boolean = b.start_date !== null;

      // Group by start_date presence: null start_date first
      if (!aHasStartDate && bHasStartDate) return -1;
      if (aHasStartDate && !bHasStartDate) return 1;

      if (!aHasStartDate && !bHasStartDate) {
        // Both have null start_date - sort by end_date (closest first)
        const aEndTime: number = new Date(a.end_date).getTime();
        const bEndTime: number = new Date(b.end_date).getTime();
        if (aEndTime !== bEndTime) return aEndTime - bEndTime;
      } else {
        // Both have start_date - sort by start_date, then end_date
        const aStartTime: number = new Date(a.start_date!).getTime();
        const bStartTime: number = new Date(b.start_date!).getTime();
        if (aStartTime !== bStartTime) return aStartTime - bStartTime;

        const aEndTime: number = new Date(a.end_date).getTime();
        const bEndTime: number = new Date(b.end_date).getTime();
        if (aEndTime !== bEndTime) return aEndTime - bEndTime;
      }

      // Final criterion: alphabetical by prize
      return a.prize.localeCompare(b.prize);
    });
  }

  /**
   * Handles document click events to close modals if the user clicks outside of them.
   *
   * @param {MouseEvent} event - The click event triggered on the document.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // two modals are visible; hide if clicked outside of the modal
    if ((event.target as HTMLElement).id.includes('roleModalContent') || (event.target as HTMLElement).id.includes('modal_container')) {
      this.modal.hideModal();
      return;
    }
  }

  /**
   * Getter for the table configuration used in the Active giveaways component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "EVENTS_VIEW",
      list_empty: 'PLACEHOLDER_EVENT_EMPTY',
      dataLoading: this.dataService.isFetching,
      rows: this.filteredEvents,
      columns: [
        { width: 25, name: 'PAGE_EVENTS_TABLE_PRICE' },
        { width: 21, name: 'PAGE_EVENTS_TABLE_END_DATE' },
        { width: 21, name: 'PAGE_EVENTS_TABLE_REQUIREMENT' },
        { width: 15, name: 'PAGE_EVENTS_TABLE_CREATOR' },
        { width: 13, name: 'PAGE_EVENTS_TABLE_SPONSOR' },
        { width: 5, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'blue',
          icon: faPencil,
          size: 'lg',
          action: (event: Giveaway): void => this.openModal('EVENTS_EDIT', event)
        },
        {
          color: 'green',
          icon: faPlay,
          size: 'lg',
          action: (event: Giveaway): void => this.startScheduledEvent(event)
        },
        {
          color: 'red',
          icon: faStop,
          size: 'lg',
          action: (event: Giveaway): void => this.editGuildEvent(event, 'END_')
        },
        {
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (event: Giveaway): void => this.deleteGuildEvent(event)
        },
      ],
      actions: []
    };
  };
}
