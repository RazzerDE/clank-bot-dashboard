import {AfterViewChecked, Component, OnDestroy, ViewChild} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {
  faBullhorn,
  faExclamationCircle, faExclamationTriangle,
  faInfoCircle,
  faPencil,
  faSearch,
  faXmark,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {TableConfig} from "../../../../services/types/Config";
import {TicketAnnouncement, TicketSnippet} from "../../../../services/types/Tickets";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "../../../../services/api/api.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {ModalComponent} from "../../../../structure/util/modal/modal.component";
import {
  DiscordMarkdownComponent
} from "../../../../structure/util/modal/templates/discord-markdown/discord-markdown.component";

@Component({
  selector: 'app-ticket-snippets',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    DataTableComponent,
    FaIconComponent,
    NgOptimizedImage,
    NgClass,
    AlertBoxComponent,
    ModalComponent,
    DiscordMarkdownComponent,
  ],
  templateUrl: './ticket-snippets.component.html',
  styleUrl: './ticket-snippets.component.scss'
})
export class TicketSnippetsComponent implements OnDestroy, AfterViewChecked {
  private subscriptions: Subscription[] = [];
  protected disabledCacheBtn: boolean = false;
  protected dataLoading: { snippets: boolean, announcement: boolean } = { snippets: true, announcement: true };
  private startLoading: boolean = false;
  protected modalType: string = 'SUPPORT_SNIPPET_ADD';

  protected newSnippet: TicketSnippet = { name: '', desc: '' };
  protected snippets: TicketSnippet[] = [];
  protected filteredSnippets: TicketSnippet[] = this.snippets;
  protected currentAnnouncement: TicketAnnouncement | null = null;

  @ViewChild(ModalComponent) protected modal!: ModalComponent;
  protected readonly faBullhorn: IconDefinition = faBullhorn;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faPencil: IconDefinition = faPencil;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faInfoCircle: IconDefinition = faInfoCircle;
  protected readonly faExclamationCircle: IconDefinition = faExclamationCircle;
  protected readonly faExclamationTriangle: IconDefinition = faExclamationTriangle;

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private translate: TranslateService) {
    document.title = 'Ticket Snippets ~ Clank Discord-Bot';
    this.dataService.isLoading = true;
    this.getSnippetDetails(); // first call to get the server data
    const sub: Subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataService.isLoading = true;
        this.dataLoading = { snippets: true, announcement: true };
        this.dataService.selectedSnippet = null;
        this.currentAnnouncement = null;
        this.getSnippetDetails(true);
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
   * This method ensures that the data-loading indicators for snippets and announcements
   * are properly updated. If the data is not ready yet, it sets a timeout to update
   * the loading state asynchronously, allowing the UI to display a data-loader.
   */
  ngAfterViewChecked(): void {
    if (!this.dataService.isLoading && !this.startLoading) {
      if (this.dataLoading.snippets) {
        setTimeout((): boolean => this.dataLoading.snippets = false, 0);
      }

      if (this.dataLoading.announcement) {
        setTimeout((): boolean => this.dataLoading.announcement = false, 0);
      }
    }
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 15 seconds.
   */
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.getSnippetDetails(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 15000);
  }

  /**
   * Opens a modal dialog of the specified type (and optionally pre-fills it with snippet data).
   *
   * @param {string} type - The type of modal to open (e.g., 'SUPPORT_SNIPPET_ADD').
   * @param {TicketSnippet} [snippet] - Optional snippet data to pre-fill the modal
   */
  protected openModal(type: string, snippet?: TicketSnippet): void {
    if (snippet) {
      this.newSnippet = snippet;
      this.newSnippet.old_name = snippet.name;
    } else {
      this.newSnippet = { name: '', desc: '' };
    }

    this.modalType = type;
    this.modal.showModal();
  }

  /**
   * Fetches ticket snippet details from the server or local storage.
   *
   * This method first checks if the ticket snippets and announcements are cached
   * in the local storage and if the cache is still valid (less than 30 seconds old).
   * If valid, it loads the data from the cache. Otherwise, it fetches the data
   * from the server using the `ApiService`.
   *
   * @param {boolean} [no_cache] - If true, bypasses the cache and fetches data
   *                               directly from the server.
   */
  protected getSnippetDetails(no_cache?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    this.startLoading = true;

    // check if guilds are already stored in local storage (30 seconds cache)
    if ((localStorage.getItem('ticket_snippets') && localStorage.getItem('ticket_announcement') &&
      localStorage.getItem('ticket_snippets_timestamp') &&
      Date.now() - Number(localStorage.getItem('ticket_snippets_timestamp')) < 30000) && !no_cache) {
      this.snippets = JSON.parse(localStorage.getItem('ticket_snippets') as string);
      if (this.snippets.length > 0) { this.dataService.selectedSnippet = this.snippets[0]; }
      this.filteredSnippets = this.snippets;
      this.currentAnnouncement = JSON.parse(localStorage.getItem('ticket_announcement') as string);
      this.dataService.isLoading = false;
      this.startLoading = false;
      return;
    }

    const sub: Subscription = this.apiService.getSnippets(this.dataService.active_guild.id)
      .subscribe({
        next: (snippetData: TicketSnippet[]): void => {
          if (snippetData.length > 0) { this.dataService.selectedSnippet = snippetData[0]; }
          this.snippets = snippetData;
          this.filteredSnippets = this.snippets;

          localStorage.setItem('ticket_snippets', JSON.stringify(this.snippets));
          localStorage.setItem('ticket_snippets_timestamp', Date.now().toString());

          // fetch announcement details after snippets are fetched (avoid ratelimits)
          setTimeout(() => { this.getAnnouncementDetails(); }, 1000);
        },
        error: (err: HttpErrorResponse): void => {
          this.handleError(err);
          this.dataService.isLoading = false;
          this.startLoading = false;
        }
      });

    this.subscriptions.push(sub);
  }

  /**
   * Fetches the current ticket announcement details from the server.
   *
   * This method is only called after the first API call (`getSnippetDetails`)
   * has successfully retrieved the ticket snippets. It fetches the announcement
   * details for the active guild and updates the local storage with the fetched data.
   */
  private getAnnouncementDetails(): void {
    const sub: Subscription = this.apiService.getTicketAnnouncement(this.dataService.active_guild!.id)
      .subscribe({
        next: (announcementStatus: TicketAnnouncement): void => {
          this.currentAnnouncement = announcementStatus;

          this.dataService.isLoading = false;
          this.startLoading = false;
          localStorage.setItem('ticket_announcement', JSON.stringify(this.currentAnnouncement));
        },
        error: (err: HttpErrorResponse): void => {
          this.handleError(err);
          this.dataService.isLoading = false;
          this.startLoading = false;
        }
      });

    this.subscriptions.push(sub);
  }

  /**
   * Adds a new text snippet to the server and updates the local data.
   *
   * This method sends a request to the server to create a new text snippet
   * for the currently active guild. If the request is successful, the snippet
   * is added to the local list of snippets, and the local storage is updated.
   * If an error occurs, an appropriate error message is displayed to the user.
   *
   * @param {TicketSnippet} snippet - The snippet object to be added. It must include a name, a guild_id and description.
   */
  protected addTextSnippet(snippet: TicketSnippet): void {
    if (!this.dataService.active_guild) { return; }
    snippet.guild_id = this.dataService.active_guild!.id;

    const sent_snippet: Subscription = this.apiService.createSnippet(snippet)
      .subscribe({
        next: (_data: any): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_SNIPPET_CREATION_TITLE'),
            this.translate.instant('SUCCESS_SNIPPET_CREATION_DESC', { name: snippet.name }));

          // update shown data
          this.snippets.push(snippet);
          // order snippets by name
          this.snippets.sort((a: TicketSnippet, b: TicketSnippet): number => { return a.name.localeCompare(b.name); });
          this.filteredSnippets.sort((a: TicketSnippet, b: TicketSnippet): number => { return a.name.localeCompare(b.name); });
          this.dataService.selectedSnippet = snippet;
          localStorage.setItem('ticket_snippets', JSON.stringify(this.snippets));
          this.newSnippet = { name: '', desc: '' }; // reset input fields
          this.modal.hideModal();
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';

          if (error.status === 409) { // already exist
            this.dataService.showAlert(this.translate.instant('ERROR_SNIPPET_CREATION_CONFLICT'),
              this.translate.instant('ERROR_SNIPPET_CREATION_CONFLICT_DESC', { name: snippet.name }));
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          this.modal.hideModal();
        }
      });

    this.subscriptions.push(sent_snippet);
  }

  /**
   * Edits an existing text snippet on the server and updates the local data.
   *
   * This method sends a request to the server to update a text snippet
   * for the currently active guild. If the request is successful, the snippet
   * is updated in the local list of snippets, and the local storage is refreshed.
   * If an error occurs, an appropriate error message is displayed to the user.
   *
   * @param {TicketSnippet} snippet - The snippet object to be edited. It must include
   *                                  the updated name, description, and the old name.
   */
  protected editTextSnippet(snippet: TicketSnippet): void {
    if (!this.dataService.active_guild) { return; }
    snippet.guild_id = this.dataService.active_guild!.id;

    const sent_snippet: Subscription = this.apiService.editSnippet(snippet)
      .subscribe({
        next: (_data: any): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_SNIPPET_EDIT_TITLE'),
            this.translate.instant('SUCCESS_SNIPPET_EDIT_DESC', { name: snippet.name }));

          // update shown data (edit snippet)
          const index: number = this.snippets.findIndex((s: TicketSnippet) => s.name === snippet.old_name);
          if (index !== -1) { this.snippets[index] = snippet; }
          // order snippets by name
          this.snippets.sort((a: TicketSnippet, b: TicketSnippet): number => { return a.name.localeCompare(b.name); });
          this.filteredSnippets.sort((a: TicketSnippet, b: TicketSnippet): number => { return a.name.localeCompare(b.name); });
          localStorage.setItem('ticket_snippets', JSON.stringify(this.snippets));
          this.dataService.selectedSnippet = snippet;
          this.newSnippet = { name: '', desc: '' }; // reset input fields
          this.modal.hideModal();
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';

          if (error.status === 409) { // already exist
            this.dataService.showAlert(this.translate.instant('ERROR_SNIPPET_CREATION_CONFLICT'),
              this.translate.instant('ERROR_SNIPPET_CREATION_CONFLICT_DESC', { name: snippet.name }));

            snippet.name = snippet.old_name!;
          } else if (error.status === 404) {
            this.dataService.showAlert(this.translate.instant('ERROR_SNIPPET_EDIT_404'),
              this.translate.instant('ERROR_SNIPPET_EDIT_404_DESC', { name: snippet.name }));

            const index: number = this.snippets.findIndex((s: TicketSnippet) => s.name === snippet.old_name);
            if (index !== -1) { this.snippets.splice(index, 1); }
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          this.modal.hideModal();
        }
      });

    this.subscriptions.push(sent_snippet);
  }

  /**
   * Deletes a ticket snippet from the server and updates the local data.
   *
   * This method sends a request to the server to delete a ticket snippet
   * for the currently active guild. If the request is successful, the snippet
   * is removed from the local list of snippets, and the local storage is updated.
   * If an error occurs, an appropriate error message is displayed to the user.
   *
   * @param {TicketSnippet} snippet - The snippet object to be deleted. It must include
   *                                  the name and guild_id of the snippet.
   */
  protected deleteTicketSnippet(snippet: TicketSnippet): void {
    if (!this.dataService.active_guild) { return; }
    snippet.guild_id = this.dataService.active_guild!.id;

    const delete_snippet: Subscription = this.apiService.deleteSnippet(snippet)
      .subscribe({
        next: (_data: any): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_SNIPPET_DELETE_TITLE'),
            this.translate.instant('SUCCESS_SNIPPET_DELETE_DESC', { name: snippet.name }));

          // update shown data (remove snippet)
          const index: number = this.snippets.findIndex((s: TicketSnippet) => s.name === snippet.name);
          if (index !== -1) {
            this.snippets.splice(index, 1);
            this.filteredSnippets = [...this.snippets];

            if (this.snippets.length > 0) {
              this.dataService.selectedSnippet = this.snippets[0]; // pick the first snippet if available
            } else {
              this.dataService.selectedSnippet = null;
            }
          }

          localStorage.setItem('ticket_snippets', JSON.stringify(this.snippets));
          this.newSnippet = { name: '', desc: '' }; // reset input fields
          this.modal.hideModal();
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';

          if (error.status === 404) {
            this.dataService.showAlert(this.translate.instant('ERROR_SNIPPET_EDIT_404'),
              this.translate.instant('ERROR_SNIPPET_EDIT_404_DESC', { name: snippet.name }));

            const index: number = this.snippets.findIndex((s: TicketSnippet) => s.name === snippet.name);
            if (index !== -1) { this.snippets.splice(index, 1); this.filteredSnippets = [...this.snippets]; }
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
          }

          this.modal.hideModal();
        }
      });

    this.subscriptions.push(delete_snippet);
  }

  /**
   * Filters the text-snippets based on the search term entered by the user.
   *
   * This method updates the `filteredThemes` array to include only the snippets
   * whose names contain the search term. The search is case-insensitive.
   *
   * @param {Event} event - The input event triggered by the search field.
   */
  protected searchSnippet(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredSnippets = this.snippets.filter(theme =>
      theme.name.toLowerCase().includes(searchTerm) || theme.desc.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Handles errors that occur during HTTP requests.
   *
   * This method checks the status code of the error and redirects the user
   * to the appropriate login error page based on the status code.
   *
   * @param {HttpErrorResponse} error - The error response from the HTTP request.
   */
  private handleError(error: HttpErrorResponse): void {
    if (error.status === 403) {
      this.dataService.redirectLoginError('FORBIDDEN');
      return;
    } else if (error.status === 401) {
      this.dataService.redirectLoginError('NO_CLANK');
      return;
    } else if (error.status === 429) {
      this.dataService.redirectLoginError('REQUESTS');
      return;
    } else if (error.status === 0) {
      this.dataService.redirectLoginError('OFFLINE');
      return;
    }
  }

  /**
   * Getter for the table configuration used in the Ticket Snippets component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "SUPPORT_SNIPPETS",
      list_empty: 'PLACEHOLDER_SNIPPET_EMPTY',
      dataLoading: this.startLoading,
      rows: this.filteredSnippets,
      columns: [
        { width: 80, name: '📜 ~ Snippet-Name' },
        { width: 20, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'blue',
          icon: this.faPencil,
          size: 'lg',
          action: (snippet: TicketSnippet): void => this.openModal('SUPPORT_SNIPPET_EDIT', snippet)
        },
        {
          color: 'red',
          icon: this.faXmark,
          size: 'xl',
          action: (snippet: TicketSnippet): void => this.deleteTicketSnippet(snippet)
        }
      ],
      actions: []
    };
  };
}
