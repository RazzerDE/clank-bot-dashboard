import {Component, OnDestroy} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
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

@Component({
  selector: 'app-active-giveaways',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    DataTableComponent,
  ],
  templateUrl: './active-giveaways.component.html',
  styleUrl: './active-giveaways.component.scss'
})
export class ActiveGiveawaysComponent implements OnDestroy {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faGift: IconDefinition = faGift;
  protected readonly faRefresh: IconDefinition = faRefresh;
  private subscriptions: Subscription[] = [];
  private startLoading: boolean = false;

  protected events: Giveaway[] = [];
  protected filteredEvents: Giveaway[] = [...this.events]; // Initially, all events are shown
  protected disabledCacheBtn: boolean = false;

  constructor(private dataService: DataHolderService, private apiService: ApiService) {
    document.title = 'Active Events - Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.getGuildEvents(); // first call to get the server data
    const sub: Subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataService.selectedSnippet = null;
        this.getGuildEvents(true);
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
        }
      });

    this.subscriptions.push(sub);
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
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (event: Giveaway): void => {} // TODO
        }
      ],
      actions: []
    };
  };
}
