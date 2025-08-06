import {AfterViewChecked, Component, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {TableConfig} from "../../../../services/types/Config";
import {BlockedUser} from "../../../../services/types/discord/User";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "../../../../services/api/api.service";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {ModalComponent} from "../../../../structure/util/modal/modal.component";
import {DatePipe} from "../../../../pipes/date/date.pipe";

@Component({
  selector: 'app-blocked-users',
  imports: [
    DashboardLayoutComponent,
    FaIconComponent,
    TranslatePipe,
    PageThumbComponent,
    AlertBoxComponent,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './blocked-users.component.html',
  styleUrl: './blocked-users.component.scss'
})
export class BlockedUsersComponent implements OnDestroy, AfterViewChecked {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected disabledCacheBtn: boolean = false;
  protected disabledAddBtn: boolean = false;
  protected dataLoading: boolean = true;
  protected modalType: string = 'BLOCKED_USER_ADD';

  protected user_list: BlockedUser[] = [];
  protected filteredUsers: BlockedUser[] = [...this.user_list];
  protected startLoading: boolean = false;
  private readonly subscription: Subscription | null = null;

  @ViewChild(ModalComponent) modal!: ModalComponent;
  protected newBlockedUser: BlockedUser = {} as BlockedUser;
  private datePipe: DatePipe = new DatePipe();

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private translate: TranslateService) {
    document.title = 'Blocked Users ~ Clank Discord-Bot';
    this.dataService.isLoading = true;

    this.getBlockedUsers(); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataLoading = true;
        this.user_list = [];
        this.getBlockedUsers(true);
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

    let sub: Subscription | null = null;
    sub = this.apiService.getBlockedUsers(this.dataService.active_guild.id)
      .subscribe({
        next: (userData: BlockedUser[]): void => {
          this.user_list = userData;
          this.filteredUsers = this.user_list;

          this.dataService.isLoading = false;
          this.startLoading = false;
          if (sub) { sub.unsubscribe(); }

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
          if (sub) { sub.unsubscribe(); }
        }
      });
  }

  /**
   * Deletes a blocked user from the active guild.
   *
   * This method sends a request to the server to remove the specified blocked user.
   * If the operation is successful, the user is removed from the local list and the cache is updated.
   * In case of an error, appropriate alerts are displayed based on the error type.
   *
   * @param {BlockedUser} blockedUser - The blocked user to be deleted.
   */
  protected deleteBlockedUser(blockedUser: BlockedUser): void {
    if (!this.dataService.active_guild) { return; }

    let delete_blocked: Subscription | null = null;
    delete_blocked = this.apiService.deleteBlockedUser(this.dataService.active_guild.id, blockedUser.user_id)
      .subscribe({
        next: (_data: any): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_USER_UNBLOCK_TITLE'),
            this.translate.instant('SUCCESS_USER_UNBLOCK_DESC', { user: blockedUser.user_name, user_id: blockedUser.user_id }));

          // update shown data (remove blocked user)
          const index: number = this.user_list.findIndex((bu: BlockedUser) => bu.user_id === blockedUser.user_id);
          if (index !== -1) {
            this.user_list.splice(index, 1);
            this.filteredUsers = [...this.user_list];
          }

          localStorage.setItem('blocked_users', JSON.stringify(this.user_list));
          if (delete_blocked) { delete_blocked.unsubscribe(); }
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';

          if (error.status === 404) {
            this.dataService.showAlert(this.translate.instant('ERROR_USER_UNBLOCK_NOT_FOUND_TITLE'),
              this.translate.instant('ERROR_USER_UNBLOCK_NOT_FOUND_DESC', { user: blockedUser.user_name, user_id: blockedUser.user_id }));

            const index: number = this.user_list.findIndex((bu: BlockedUser) => bu.user_id === blockedUser.user_id);
            if (index !== -1) { this.user_list.splice(index, 1); this.filteredUsers = [...this.user_list]; }
          } else if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          if (delete_blocked) { delete_blocked.unsubscribe(); }
        }
      });
  }

  /**
   * Adds a blocked user to the active guild.
   *
   * This method sends a request to the server to add the specified blocked user.
   * If the operation is successful, the user is added to the local list and the cache is updated.
   * In case of an error, appropriate alerts are displayed based on the error type.
   *
   * @param {BlockedUser} blockedUser - The blocked user to be added.
   */
  protected addBlockedUser(blockedUser: BlockedUser): void {
    if (!this.dataService.active_guild || !this.dataService.profile) { return; }
    blockedUser.guild_id = this.dataService.active_guild.id;
    blockedUser.staff_id = this.dataService.profile.id;
    blockedUser.staff_name = this.dataService.profile.username;
    blockedUser.staff_avatar = this.dataService.profile.avatar;

    let avatar_url: string = `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}`;
    if (blockedUser.staff_avatar) {
      avatar_url = `https://cdn.discordapp.com/avatars/${blockedUser.staff_id}/${this.dataService.profile.avatar}`;
    }

    blockedUser.staff_avatar = avatar_url + `.${blockedUser.staff_avatar?.startsWith('a_') ? 'gif' : 'png'}`;

    if (this.newBlockedUser.end_date) {
      this.newBlockedUser.end_date = new Date(this.newBlockedUser.end_date).toISOString();  // respect timezone
    }

    this.disabledAddBtn = true;
    let add_blocked: Subscription | null = null;
    add_blocked = this.apiService.addBlockedUser(this.dataService.active_guild.id, blockedUser)
      .subscribe({
        next: (result: BlockedUser): void => {
          blockedUser = result;
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_USER_BLOCK_TITLE'),
            this.translate.instant('SUCCESS_USER_BLOCK_DESC', { user: blockedUser.user_name,
              user_id: blockedUser.user_id,
              end_date: blockedUser.end_date ? this.datePipe.transform(blockedUser.end_date, this.translate.currentLang)
                : this.translate.instant('PLACEHOLDER_NEVER').toUpperCase() }));

          // update shown data (add/update blocked user)
          this.updateBlockedUserList(blockedUser);
          this.newBlockedUser = {} as BlockedUser; // reset new blocked user object
          this.disabledAddBtn = false;
          if (add_blocked) { add_blocked.unsubscribe(); }
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';
          if (add_blocked) { add_blocked.unsubscribe(); }

          if (error.status === 404) {
            this.dataService.showAlert(this.translate.instant('ERROR_USER_BLOCK_NOT_FOUND_TITLE'),
              this.translate.instant('ERROR_USER_BLOCK_NOT_FOUND_DESC', { user: blockedUser.user_name }));
            blockedUser = {} as BlockedUser; // reset blocked user object
          } else if (error.status === 400) {
            this.dataService.showAlert(this.translate.instant('ERROR_DATE_PAST_TITLE'),
              this.translate.instant('ERROR_DATE_PAST_DESC'));
          } else if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          this.disabledAddBtn = false;
        }
      });

    this.modal.hideModal();
  }

  /**
   * Updates the local list of blocked users.
   *
   * This method adds or updates a blocked user in the local list and sorts the list
   * by `end_date` and `user_name`. The updated list is stored in local storage.
   *
   * @param {BlockedUser} blockedUser - The blocked user to be added or updated.
   */
  private updateBlockedUserList(blockedUser: BlockedUser): void {
    const existingIndex = this.user_list.findIndex(user => user.user_id === blockedUser.user_id);
    if (existingIndex !== -1) {
      this.user_list[existingIndex] = blockedUser;
    } else {
      this.user_list.push(blockedUser);
    }

    // sort the list by end_date and user_name
    this.user_list.sort((a, b) => {
      if (a.end_date === null && b.end_date === null) return a.user_name.localeCompare(b.user_name);
      if (a.end_date === null) return 1;
      if (b.end_date === null) return -1;

      const dateCompare: number = new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      return dateCompare !== 0 ? dateCompare : a.user_name.localeCompare(b.user_name);
    });

    this.filteredUsers = [...this.user_list];
    localStorage.setItem('blocked_users', JSON.stringify(this.user_list));
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
          color: 'blue',
          icon: faPencil,
          size: 'lg',
          action: (user: BlockedUser): void => { this.newBlockedUser = user; this.modalType = 'BLOCKED_USER_EDIT'; this.modal.showModal(); }
        },
        {
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (user: BlockedUser): void => this.deleteBlockedUser(user)
        }
      ],
      actions: []
    };
  };
}
