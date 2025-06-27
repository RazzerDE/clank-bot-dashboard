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
  private startLoading: boolean = false;
  protected modalType: string = 'EVENTS_CREATE';
  protected disableSendBtn: boolean = false;
  protected events: Giveaway[] = [];
  public giveaway: Giveaway = this.initGiveaway;
  protected filteredEvents: Giveaway[] = [...this.events]; // Initially, all events are shown
  protected disabledCacheBtn: boolean = false;
  private dateCustomPipe: DatePipe = new DatePipe();
  @ViewChild(ModalComponent) private modal!: ModalComponent;

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private comService: ComService,
              private translate: TranslateService) {
    document.title = 'Active Events - Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.getGuildEvents(); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataService.selectedSnippet = null;
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
   * Fetches the active giveaways for the current guild.
   *
   * If cached data is available and valid (within 30 seconds), it loads the giveaways from localStorage.
   * Otherwise, it fetches the data from the API, updates the local cache, and handles loading states.
   * Handles various HTTP errors by redirecting to appropriate error pages.
   *
   * @param {boolean} [no_cache] - If true, ignores the cache and fetches fresh data from the API.
   */
  protected getGuildEvents(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.startLoading = true;

    // check if guilds are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('active_events') && localStorage.getItem('active_events_timestamp') &&
      Date.now() - Number(localStorage.getItem('active_events_timestamp')) < 30000) && !no_cache) {
      this.events = JSON.parse(localStorage.getItem('active_events') as string);
      this.filteredEvents = this.events;
      this.dataService.isLoading = false;
      this.startLoading = false;
      return;
    }

    const sub: Subscription = this.apiService.getGuildEvents(this.dataService.active_guild.id)
      .subscribe({
        next: (giveaways: Giveaway[]): void => {
          this.events = giveaways;
          this.filteredEvents = this.events;

          this.dataService.isLoading = false;
          this.startLoading = false;

          localStorage.setItem('active_events', JSON.stringify(this.events));
          localStorage.setItem('active_events_timestamp', Date.now().toString());
          sub.unsubscribe();
        },
        error: (err: HttpErrorResponse): void => {
          this.dataService.isLoading = false;
          this.startLoading = false;

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
   * Adds a new giveaway event to the current guild.
   *
   * Sends the provided giveaway data to the backend API for creation. On success, updates the local event list,
   * resets the input fields, and displays a success alert. Handles and displays errors for known HTTP status codes.
   *
   * @param {Giveaway} giveaway - The giveaway object to be created and added.
   */
  protected addGuildEvent(giveaway: Giveaway): void {
    if (!this.dataService.active_guild || !this.dataService.profile) { return; }
    if (!giveaway.start_date) { giveaway.start_date = new Date(); }
    giveaway.guild_id = this.dataService.active_guild!.id;
    giveaway.creator_id = this.dataService.profile.id;
    giveaway.channel_id = giveaway.channel_id![0];
    this.disableSendBtn = true;

    const { participants, ...giveawayToSend } = giveaway;
    const sent_gw: Subscription = this.apiService.createGuildEvent(giveawayToSend, this.translate.currentLang)
      .subscribe({
        next: (created_giveaway: Giveaway): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_GIVEAWAY_CREATION_TITLE'),
            this.translate.instant('SUCCESS_GIVEAWAY_CREATION_DESC', { name: created_giveaway.prize,
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

          if (error.status === 409) { // already exist / invalid data
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
   * Opens a modal dialog of the specified type (and optionally pre-fills it with snippet data).
   *
   * @param {string} type - The type of modal to open (e.g., 'EVENTS_CREATE', 'EVENTS_EDIT').
   * @param {Giveaway} [giveaway] - Optional giveaway data to pre-fill the modal
   */
  protected openModal(type: 'EVENTS_CREATE' | 'EVENTS_EDIT', giveaway?: Giveaway): void {
    this.dataService.getGuildChannels(this.comService);  // fetch guild channels for the select dropdown
    this.giveaway = this.initGiveaway; // reset input fields

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
      dataLoading: this.startLoading,
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
          action: (event: Giveaway): void => {} // TODO
        },
        {
          color: 'green',
          icon: faPlay,
          size: 'lg',
          action: (event: Giveaway): void => {} // TODO
        },
        {
          color: 'red',
          icon: faStop,
          size: 'lg',
          action: (event: Giveaway): void => {} // TODO
        },
        {
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (event: Giveaway): void => {} // TODO
        },
      ],
      actions: []
    };
  };
}
