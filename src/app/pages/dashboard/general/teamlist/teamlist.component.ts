import {AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {HttpErrorResponse} from "@angular/common/http";
import {ComService} from "../../../../services/discord-com/com.service";
import {Role, TeamList} from "../../../../services/types/discord/Guilds";
import {Router} from "@angular/router";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {Subscription} from "rxjs";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {TableConfig} from "../../../../services/types/Config";
import {ModalComponent} from "../../../../structure/util/modal/modal.component";

@Component({
  selector: 'app-teamlist',
  imports: [
    TranslatePipe,
    PageThumbComponent,
    DashboardLayoutComponent,
    FaIconComponent,
    AlertBoxComponent,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './teamlist.component.html',
  styleUrl: './teamlist.component.scss'
})
export class TeamlistComponent implements OnDestroy, AfterViewChecked {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faChevronDown: IconDefinition = faChevronDown;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faRefresh: IconDefinition = faRefresh;

  protected roles: Role[] = [];
  protected filteredRoles: Role[] = [];
  protected discordRoles: Role[] = [];

  protected dataLoading: boolean = true;
  protected selectedSupportLevels: number[] = [0, 1, 2];
  private readonly subscription: Subscription | null = null;
  protected disabledCacheBtn: boolean = false;

  @ViewChild(ModalComponent) protected modalComponent!: ModalComponent;
  @ViewChild('filterDropdown') protected filterDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('dropdownButton') protected dropdownButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('roleButton') protected roleButton!: ElementRef<HTMLButtonElement>;

  constructor(protected dataService: DataHolderService, private discordService: ComService, private router: Router,
              private translate: TranslateService) {
    document.title = "Teamlist ~ Clank Discord-Bot";
    this.dataService.isLoading = true;

    this.getTeamRoles(); // first call to get the server data
    this.subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataLoading = true;
        this.getTeamRoles();
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
   * setTimeout is used to ensure that the loading state is updated after the view has been rendered.
   *
   * It's used to show a loading state for some data related things.
   */
  ngAfterViewChecked(): void {
    if (this.discordRoles && this.discordRoles.length > 0 && !this.dataService.isLoading && this.dataLoading) {
      setTimeout((): boolean => this.dataLoading = false, 0);
    }
  }

  /**
   * Refreshes the cache by fetching the team roles again.
   *
   * This method disables the cache button, sets the loading state, and calls the `getTeamRoles` method
   * with the `no_cache` parameter set to `true` to fetch fresh data. The cache button is re-enabled
   * after 30 seconds.
   */
  refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.getTeamRoles(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 30000); // 30 seconds
  }

  /**
   * Retrieves the team roles for the active guild.
   *
   * This method first checks if the team roles are already stored in the local storage and if the stored data is still valid.
   * If valid data is found, it uses the stored data. Otherwise, it makes an API call to fetch the team roles from the backend.
   * The fetched data is then stored in the local storage for future use.
   *
   * @param {boolean} no_cache - Whether to ignore the cached data and fetch fresh data from the backend.
   */
  getTeamRoles(no_cache?: boolean): void {
    // redirect to dashboard if no active guild is set
    if (!this.dataService.active_guild) {
      this.router.navigateByUrl("/dashboard").then();
      return;
    }

    // check if guilds are already stored in local storage (one minute cache)
    if ((localStorage.getItem('guild_team') && localStorage.getItem('guild_team_timestamp') &&
      Date.now() - Number(localStorage.getItem('guild_team_timestamp')) < 60000) && !no_cache) {
      this.roles = JSON.parse(localStorage.getItem('guild_team') as string);
      this.discordRoles = JSON.parse(localStorage.getItem('guild_roles') as string);
      this.filteredRoles = this.roles;
      this.dataService.isLoading = false;
      return;
    }

    let subscription: Subscription | null = null;
    this.discordService.getTeamRoles(this.dataService.active_guild!.id).then((observable) => {
      subscription = observable.subscribe({
        next: (roles: TeamList): void => {
          this.roles = roles.team_roles;
          this.filteredRoles = roles.team_roles;
          this.discordRoles = roles.other_roles;
          this.dataService.isLoading = false;
          if (subscription) { subscription.unsubscribe(); }

          localStorage.setItem('guild_team', JSON.stringify(this.roles));
          localStorage.setItem('guild_roles', JSON.stringify(this.discordRoles));
          localStorage.setItem('guild_team_timestamp', Date.now().toString());
        },
        error: (err: HttpErrorResponse): void => {
          if (subscription) { subscription.unsubscribe(); }
          if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
          } else if (err.status === 401) {
            this.dataService.redirectLoginError('NO_CLANK');
          } else {
            this.dataService.redirectLoginError('EXPIRED');
          }
        }
      });
    });
  }

  /**
   * Filters the roles based on the selected support levels.
   *
   * This method updates the `filteredRoles` array to include only the roles
   * that have a `support_level` property and whose support level is included
   * in the `selectedSupportLevels` array.
   */
  applyFilters(): void {
    this.filteredRoles = this.roles.filter(role =>
      role.support_level !== undefined &&
      this.selectedSupportLevels.includes(role.support_level)
    );
  }

  /**
   * Filters the roles based on the search term entered by the user.
   *
   * This method updates the `filteredRoles` array to include only the roles
   * whose names contain the search term. The search is case-insensitive.
   *
   * @param {Event} event - The input event triggered by the search field.
   */
  searchRole(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRoles = this.roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Removes a role from the team.
   *
   * This method sends a request to the backend to remove the specified role from the team.
   * If the role is successfully removed, it updates the local roles and filteredRoles arrays
   * and removes the cached roles from local storage. It also displays a success alert.
   * If an error occurs, it handles different error statuses by showing appropriate alerts
   * or redirecting the user.
   *
   * @param {Role} role - The role to be removed.
   */
  removeRole(role: Role): void {
    if (!this.dataService.active_guild) { return; }

    let subscription: Subscription | null = null;
    this.discordService.removeTeamRole(this.dataService.active_guild.id, role.id).then((observable) => {
      subscription = observable.subscribe({
        next: (_result: boolean): void => {
          // Successfully removed, update shown data
          this.roles = this.roles.filter(r => r.id !== role.id);
          this.filteredRoles = this.filteredRoles.filter(r => r.id !== role.id);
          // add back to role picker
          this.discordRoles.push(role);
          this.discordRoles.sort((a, b) => b.position - a.position);

          if (subscription) { subscription.unsubscribe(); }
          localStorage.removeItem('guild_team');
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_ROLE_DELETE'),
                                     this.translate.instant('SUCCESS_ROLE_DELETE_DESC', { role: role.name }));
        },
        error: (err: HttpErrorResponse): void => {
          if (subscription) { subscription.unsubscribe(); }
          if (err.status === 404) {
            this.dataService.error_color = 'red';
            this.dataService.showAlert(this.translate.instant('ERROR_ROLE_DELETE_TITLE'),
              this.translate.instant('ERROR_ROLE_DELETE_DESC', { role: role.name }));

            this.roles = this.roles.filter(r => r.id !== role.id);
            this.filteredRoles = this.filteredRoles.filter(r => r.id !== role.id);
          } else if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
          } else if (err.status === 401) {
            this.dataService.redirectLoginError('FORBIDDEN');
          } else {
            this.dataService.redirectLoginError('EXPIRED');
          }
        }
      });
    });
  }

  /**
   * Adds a role to the team.
   *
   * This method is responsible for adding a selected role to the team. It validates the active guild,
   * retrieves the selected role from the list of available Discord roles, and assigns it a support level
   * based on the currently active tab. The role is then sent to the backend for addition.
   *
   * If the addition is successful, the role is added to the local team data, and the modal is closed.
   * In case of an error, appropriate error handling is performed, including showing alerts or redirecting
   * the user based on the error type.
   *
   * @param {HTMLCollectionOf<HTMLOptionElement>} options - The selected option element from the role picker.
   */
  addRole(options: HTMLCollectionOf<HTMLOptionElement>): void {
    if (!this.dataService.active_guild) { return; }
    const option: HTMLOptionElement = options.item(0)!
    const found_role: Role = this.discordRoles.find(r => r.id === option.value) as Role
    found_role.support_level = this.getActiveTab();

    let subscription: Subscription | null = null;
    this.discordService.addTeamRole(this.dataService.active_guild.id, found_role.id, (found_role.support_level + 1).toString())
      .then((observable) => {
        subscription = observable.subscribe({
          next: (_result: boolean): void => {
            // Successfully added, update shown data
            this.addRoleToTeam(found_role);
            localStorage.removeItem('guild_team');

            this.dataService.error_color = 'green';
            this.dataService.showAlert(this.translate.instant('SUCCESS_ROLE_ADD'),
              this.translate.instant('SUCCESS_ROLE_ADD_DESC',
                { role: option.innerText, level: this.getSupportLevel(found_role.support_level!) }));

            // close modal
            this.modalComponent.hideModal();
            if (subscription) { subscription.unsubscribe(); }
          },
          error: (err: HttpErrorResponse): void => {
            if (subscription) { subscription.unsubscribe(); }
            if (err.status === 409) {
              this.dataService.error_color = 'red';
              this.dataService.showAlert(this.translate.instant('ERROR_ROLE_ADD_TITLE'),
                this.translate.instant('ERROR_ROLE_ADD_DESC',
                  { role: option.innerText, level: this.getSupportLevel(found_role.support_level!) }));

              this.addRoleToTeam(found_role);
            } else if (err.status === 429) {
              this.dataService.redirectLoginError('REQUESTS');
            } else if (err.status === 401) {
              this.dataService.redirectLoginError('FORBIDDEN');
            } else {
              this.dataService.redirectLoginError('EXPIRED');
            }

            // close modal
            this.modalComponent.hideModal();
          }
        });
    });
  }

  /**
   * Toggles the support level selection based on the checkbox event.
   *
   * This method updates the `selectedSupportLevels` array by adding or removing
   * the specified support level based on the state of the checkbox. After updating
   * the selection, it applies the filters to update the `filteredRoles` array.
   *
   * @param {number} level - The support level to toggle.
   * @param {Event} event - The event triggered by the checkbox.
   */
  toggleSupportLevel(level: number, event: Event): void {
    const checkbox: HTMLInputElement = event.target as HTMLInputElement;

    if (checkbox.checked) {
      // Add the level if not already in the array
      if (!this.selectedSupportLevels.includes(level)) {
        this.selectedSupportLevels.push(level);
      }
    } else {
      // Remove the level
      this.selectedSupportLevels = this.selectedSupportLevels.filter(l => l !== level);
    }

    // Apply filters after selection change
    this.applyFilters();
  }

  /**
   * Returns a string representation of the support level based on the provided support level number.
   *
   * @param {number} supportLevel - The support level number (0, 1 or 2).
   * @returns {string} - The string representation of the support level.
   */
  getSupportLevel(supportLevel: number): string {
    switch (supportLevel) {
      case 1:
        return `🚔 - Second Level (${this.translate.instant('PLACEHOLDER_ROLE_SECOND')})`;
      case 2:
        return `🚨 - Third Level (${this.translate.instant('PLACEHOLDER_ROLE_THIRD')})`;
      default:
        return `🚑 - First Level (${this.translate.instant('PLACEHOLDER_ROLE_FIRST')})`;
    }
  }

  /**
   * Adds a role to the team.
   *
   * This method checks if the role already exists in the `roles` array to prevent duplicates.
   * If the role does not exist, it adds the role to the `roles` array and updates the `filteredRoles`
   * array based on the current filters. It also sorts the `filteredRoles` array by support level and position.
   * Finally, it removes the role from the `discordRoles` array, indicating that the role is now part of the team.
   *
   * @param {Role} role - The role to be added to the team.
   */
  private addRoleToTeam(role: Role): void {
    // Check if the role already exists in the roles array to prevent duplicates
    if (!this.roles.some(r => r.id === role.id)) {
      this.roles.push(role);

      // Update filtered roles based on current set filters
      if (role.support_level !== undefined && this.selectedSupportLevels.includes(role.support_level)) {
        this.filteredRoles = [...this.roles].filter(r =>
          r.support_level !== undefined &&
          this.selectedSupportLevels.includes(r.support_level)
        );

        // Sort the filtered roles
        this.filteredRoles.sort((a, b) => {
          if (a.support_level !== b.support_level) {
            return b.support_level! - a.support_level!;
          }
          return b.position - a.position;
        });
      }

      // Remove from discord roles; role is now in team
      this.discordRoles = this.discordRoles.filter(r => r.id !== role.id);
    }
  }

  /**
   * Determines the currently active support level tab by finding the last HTML element
   * with an ID that matches the pattern "level_active_X", where X is a number.
   *
   * @returns {number} The support level (0, 1, or 2) of the active tab, defaulting to 0 if no matching elements are found
   * or if the ID doesn't contain a valid numeric suffix
   */
  private getActiveTab(): number {
    const elements: NodeListOf<HTMLLIElement> = document.querySelectorAll('[id^="level_active_"]');
    if (elements.length === 0) return 0;

    const lastElement = elements[elements.length - 1];
    const id = lastElement.id;
    const match = id.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  }

  /**
   * Handles document click events to close some dropdown or modals if the user clicks outside of them.
   *
   * @param {MouseEvent} event - The click event triggered on the document.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // "support-level" filter dropdown
    let clickedInside: boolean = this.filterDropdown.nativeElement.contains(event.target as Node) ||
      this.dropdownButton.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      this.filterDropdown.nativeElement.classList.add('hidden');
    }

    // role modal
    clickedInside = this.modalComponent.modalContent.nativeElement.contains(event.target as Node);
    if ((!clickedInside && document.activeElement != this.roleButton.nativeElement)
        || (event.target as HTMLElement).id.includes('roleModalContent')) {
      this.modalComponent.hideModal();
    }
  }

  /**
   * Getter for the table configuration used in the Teamlist component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "TEAMLIST",
      list_empty: 'PLACEHOLDER_ROLE_EMPTY',
      dataLoading: this.dataLoading,
      rows: this.filteredRoles,
      columns: [
        { width: 45, name: '✏️ ~ Name' },
        { width: 45, name: '🦺 ~ Support Level' },
        { width: 10, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'red',
          icon: this.faXmark,
          size: 'xl',
          action: (role: Role): void => this.removeRole(role)
        }
      ],
      actions: [
        (support_level: number): string => this.getSupportLevel(support_level)
      ]
    };
  };
}
