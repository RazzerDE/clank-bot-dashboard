import {AfterViewChecked, Component, OnDestroy} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {TableConfig} from "../../../../services/types/Config";
import {BlockedUser} from "../../../../services/types/discord/User";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "../../../../services/api/api.service";

@Component({
  selector: 'app-blocked-users',
  imports: [
    DashboardLayoutComponent,
    FaIconComponent,
    TranslatePipe,
    PageThumbComponent,
    AlertBoxComponent,
    DataTableComponent
  ],
  templateUrl: './blocked-users.component.html',
  styleUrl: './blocked-users.component.scss'
})
export class BlockedUsersComponent implements OnDestroy, AfterViewChecked {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected disabledCacheBtn: boolean = false;
  protected dataLoading: boolean = true;

  protected user_list: BlockedUser[] = [];
  protected filteredUsers: BlockedUser[] = [...this.user_list];
  protected startLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(protected dataService: DataHolderService, private apiService: ApiService) {
    document.title = 'Blocked Users ~ Clank Discord-Bot';
    this.dataService.isLoading = true;

    this.getBlockedUsers(); // first call to get the server data
    const sub: Subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataLoading = true;
        this.user_list = [];
        this.getBlockedUsers(true);
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
   * Lifecycle hook that is called after the view has been checked.
   *
   * This method ensures that the data-loading indicators for blocked users
   * are properly updated. If the data is not ready yet, it sets a timeout to update
   * the loading state asynchronously, allowing the UI to display a data-loader.
   */
  ngAfterViewChecked(): void {
    if (!this.dataService.isLoading && !this.startLoading && this.dataLoading) {
      setTimeout((): boolean => this.dataLoading = false, 0);
    }
  }

  /**
   * Fetches the list of blocked users for the active guild.
   *
   * This method retrieves the blocked users either from local storage (if cached and valid)
   * or by making an API call to the server. The data is cached in local storage for 30 seconds
   * to reduce unnecessary API calls. If the `no_cache` parameter is set to `true`, the cache
   * is bypassed, and fresh data is fetched from the server.
   *
   * @param {boolean} [no_cache] - Optional parameter to bypass the cache and fetch fresh data.
   *                                Defaults to `false`.
   */
  protected getBlockedUsers(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.startLoading = true;

    // check if users are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('blocked_users') && localStorage.getItem('blocked_users_timestamp') &&
      Date.now() - Number(localStorage.getItem('blocked_users_timestamp')) < 30000) && !no_cache) {
      this.user_list = JSON.parse(localStorage.getItem('blocked_users') as string);
      this.filteredUsers = this.user_list;
      this.dataService.isLoading = false;
      this.startLoading = false;
      return;
    }

    const sub: Subscription = this.apiService.getBlockedUsers(this.dataService.active_guild.id)
      .subscribe({
        next: (userData: BlockedUser[]): void => {
          this.user_list = userData;
          this.filteredUsers = this.user_list;

          this.dataService.isLoading = false;
          this.startLoading = false;

          localStorage.setItem('blocked_users', JSON.stringify(this.user_list));
          localStorage.setItem('blocked_users_timestamp', Date.now().toString());
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 401) {
            this.dataService.redirectLoginError('NO_CLANK');
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }

          this.dataService.isLoading = false;
          this.startLoading = false;
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
    this.getBlockedUsers(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
  }

  /**
   * Filters the blocked users based on the search term entered by the user.
   *
   * This method updates the `filteredUsers` array to include only the blocked users
   * whose names contain the search term. The search is case-insensitive.
   *
   * @param {Event} event - The input event triggered by the search field.
   */
  protected searchBlockedUser(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.user_list.filter(blocked_user =>
      blocked_user.user_id.toString().toLowerCase().includes(searchTerm) ||
      blocked_user.staff_id.toString().toLowerCase().includes(searchTerm) ||
      blocked_user.user_name.toLowerCase().includes(searchTerm) ||
      blocked_user.staff_name.toLowerCase().includes(searchTerm) ||
      blocked_user.reason.toLowerCase().includes(searchTerm));
  }

  /**
   * Getter for the table configuration used in the Blocked users component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "BLOCKED_USERS",
      list_empty: 'PLACEHOLDER_USER_EMPTY',
      dataLoading: this.dataLoading,
      rows: this.filteredUsers,
      columns: [
        { width: 20, name: '👤 ~ Discord-User' },
        { width: 25, name: 'PLACEHOLDER_REASON' },
        { width: 22, name: 'PLACEHOLDER_END_DATE' },
        { width: 25, name: 'PLACEHOLDER_PUNISHED_BY' },
        { width: 8, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (user: BlockedUser): void => { }  // TODO
        }
      ],
      actions: []
    };
  };
}
