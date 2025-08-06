import {Component, OnDestroy} from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FormsModule} from "@angular/forms";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {TableConfig} from "../../../../services/types/Config";
import {UnbanRequest} from "../../../../services/types/Security";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {ApiService} from "../../../../services/api/api.service";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {MarkdownPipe} from "../../../../pipes/markdown/markdown.pipe";

@Component({
  selector: 'app-moderation-requests',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    FormsModule,
    PageThumbComponent,
    TranslatePipe,
    DataTableComponent,
    FaIconComponent
  ],
  templateUrl: './moderation-requests.component.html',
  styleUrl: './moderation-requests.component.scss'
})
export class ModerationRequestsComponent implements OnDestroy {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faRefresh: IconDefinition = faRefresh;

  private readonly subscription: Subscription | null = null;
  protected disabledCacheBtn: boolean = false;
  private markdownPipe: MarkdownPipe = new MarkdownPipe();

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private translate: TranslateService) {
    document.title = 'Unban-Requests ~ Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.dataService.getSecurityLogs(this.apiService, true); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataService.getSecurityLogs(this.apiService, true, true);
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
   * Updates the status of an unban request (approve or deny) for a given user.
   *
   * Calls the API to update the unban request status, updates the UI and local data accordingly,
   * and handles success and error responses. On success, the request is removed from the local list
   * and a success alert is shown. On error, appropriate error handling and user feedback are provided.
   *
   * @param {UnbanRequest} request - The unban request to update.
   * @param {1 | 2} status - The new status for the request (1 = approve, 2 = deny).
   */
  protected updateUnbanRequest(request: UnbanRequest, status: 1 | 2): void {
    if (!this.dataService.active_guild) { return; }

    const updated_request: Subscription = this.apiService.updateUnbanRequest(this.dataService.active_guild.id, request.user_id, status)
      .subscribe({
        next: (_: Object): void => {
          this.dataService.error_color = status === 1 ? 'green' : 'red';
          this.dataService.showAlert(this.translate.instant(`SUCCESS_SECURITY_UNBAN_${status === 1 ? 'APPROVE' : 'DENY'}_TITLE`),
            this.translate.instant(`SUCCESS_SECURITY_UNBAN_${status === 1 ? 'APPROVE' : 'DENY'}_DESC`,
              { user: this.markdownPipe.transform(request.user_name), user_id: request.user_id }));

          // update shown data
          const idx: number = this.dataService.unban_requests.findIndex(
            r => r.guild_id === this.dataService.active_guild!.id && r.user_id === request.user_id);
          if (idx !== -1) {
            this.dataService.unban_requests.splice(idx, 1);
          }

          localStorage.setItem('unban_requests', JSON.stringify(this.dataService.unban_requests));
          updated_request.unsubscribe();
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';
          updated_request.unsubscribe();

          if (error.status == 404) {
            this.dataService.showAlert(this.translate.instant('ERROR_SECURITY_UNBAN_NOT_FOUND_TITLE'),
              this.translate.instant('ERROR_SECURITY_UNBAN_NOT_FOUND_DESC'));
          } else if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }
        }
      });
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 15 seconds.
   */
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.dataService.getSecurityLogs(this.apiService, true, true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
  }

  /**
   * Filters the list of unban requests based on the search term entered by the user.
   *
   * This method updates the `filteredRequests` array to include only the correct unban requests
   * whose names contain the search term. The search is case-insensitive.
   *
   * @param {Event} event - The input event triggered by the search field.
   */
  protected searchUnbanRequest(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataService.filteredRequests = this.dataService.unban_requests.filter(request =>
      request.user_name.toLowerCase().includes(searchTerm) || request.user_id.toLowerCase().includes(searchTerm) ||
      request.staff_id.toLowerCase().includes(searchTerm) || request.staff_name.toLowerCase().includes(searchTerm) ||
      request.ban_reason.toLowerCase().includes(searchTerm) || request.excuse.toLowerCase().includes(searchTerm)
    );
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
      type: "UNBAN_REQUESTS",
      list_empty: 'PLACEHOLDER_REQUESTS_EMPTY',
      dataLoading: this.dataService.isFetching,
      rows: this.dataService.filteredRequests,
      columns: [
        { width: 15, name: '👤 ~ Discord-User' },
        { width: 15, name: 'PLACEHOLDER_PUNISHED_BY' },
        { width: 15, name: 'PLACEHOLDER_REASON' },
        { width: 25, name: 'PLACEHOLDER_EXCUSE' },
        { width: 12, name: 'PLACEHOLDER_END_DATE' },
        { width: 10, name: 'PLACEHOLDER_LAST_UPDATE' },
        { width: 8,  name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'green',
          icon: faCheck,
          size: 'lg',
          action: (entry: UnbanRequest): void => this.updateUnbanRequest(entry, 1) // approve
        },
        {
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (entry: UnbanRequest): void => this.updateUnbanRequest(entry, 2) // deny
        }
      ],
      actions: []
    };
  };
}
