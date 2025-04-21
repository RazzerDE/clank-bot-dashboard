import {AfterViewChecked, Component, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faBell, faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {SupportTheme, SupportThemeResponse} from "../../../../services/types/Tickets";
import {faPencil} from "@fortawesome/free-solid-svg-icons/faPencil";
import {TableConfig} from "../../../../services/types/Config";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {ComService} from "../../../../services/discord-com/com.service";
import {HttpErrorResponse} from "@angular/common/http";
import {ModalComponent} from "../../../../structure/util/modal/modal.component";
import {Role} from "../../../../services/types/discord/Guilds";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";

@Component({
  selector: 'app-support-themes',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    DataTableComponent,
    ModalComponent,
    AlertBoxComponent
  ],
  templateUrl: './support-themes.component.html',
  styleUrl: './support-themes.component.scss'
})
export class SupportThemesComponent implements OnDestroy, AfterViewChecked {
  protected supportThemes: SupportTheme[] = [];
  protected filteredThemes: SupportTheme[] = this.supportThemes;
  protected selectedOptions: string[] = [];
  protected modalExtra: Role[] = [];
  protected discordRoles: Role[] = [];
  protected dataLoading: boolean = true;
  protected disabledCacheBtn: boolean = false;
  protected subscriptions: Subscription[] = [];

  protected modalType: string = 'SUPPORT_THEME_ADD';
  protected modalTheme: SupportTheme = {} as SupportTheme;

  @ViewChild(ModalComponent) protected modal!: ModalComponent;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faPencil: IconDefinition = faPencil;
  protected readonly faBell: IconDefinition = faBell;

  constructor(public dataService: DataHolderService, private router: Router, private discordService: ComService,
              private translate: TranslateService) {
    this.dataService.isLoading = true;

    this.getSupportThemes(); // first call to get the server data
    const dataFetchSubscription: Subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataLoading = true;
        this.dataService.isLoading = true;
        this.getSupportThemes();
      }
    });

    this.subscriptions.push(dataFetchSubscription);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Lifecycle hook that is called after the view has been checked.
   * setTimeout is used to ensure that the loading state is updated after the view has been rendered.
   *
   * It's used to show a loading state for some data related things.
   */
  ngAfterViewChecked(): void {
    if (this.supportThemes && this.supportThemes.length > 0 && !this.dataService.isLoading && this.dataLoading) {
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
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.getSupportThemes(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 30000); // 30 seconds
  }

  /**
   * Fetches the support themes for the active guild.
   *
   * This method retrieves the support themes from the server or local storage, depending on the cache state.
   * If the `no_cache` parameter is set to `true`, the method bypasses the cache and fetches fresh data from the server.
   * The fetched data is stored in local storage for subsequent use.
   *
   * If no active guild is set, the user is redirected to the dashboard.
   *
   * @param {boolean} [no_cache] - Optional parameter to bypass the cache and fetch fresh data.
   */
  protected getSupportThemes(no_cache?: boolean): void {
    // redirect to dashboard if no active guild is set
    if (!this.dataService.active_guild) {
      this.router.navigateByUrl("/dashboard").then();
      return;
    }

    // check if guilds are already stored in local storage (one minute cache)
    if ((localStorage.getItem('support_themes') && localStorage.getItem('guild_roles') &&
      localStorage.getItem('support_themes_timestamp') &&
      Date.now() - Number(localStorage.getItem('support_themes_timestamp')) < 60000) && !no_cache) {
      this.supportThemes = JSON.parse(localStorage.getItem('support_themes') as string);
      this.discordRoles = JSON.parse(localStorage.getItem('guild_roles') as string);
      this.filteredThemes = this.supportThemes;
      this.dataService.isLoading = false;
      return;
    }

    this.discordService.getSupportThemes(this.dataService.active_guild!.id).then((observable) => {
      const subscription: Subscription = observable.subscribe({
        next: (response: SupportThemeResponse): void => {
          this.supportThemes = response.themes;
          this.filteredThemes = this.supportThemes;
          this.discordRoles = response.guild_roles;
          this.dataService.isLoading = false;

          localStorage.setItem('support_themes', JSON.stringify(this.supportThemes));
          localStorage.setItem('guild_roles', JSON.stringify(this.discordRoles));
          localStorage.setItem('support_themes_timestamp', Date.now().toString());
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 429) {
            this.dataService.redirectLoginError('REQUESTS');
          } else if (err.status === 401) {
            this.dataService.redirectLoginError('NO_CLANK');
          } else {
            this.dataService.redirectLoginError('EXPIRED');
          }
        }
      });

      this.subscriptions.push(subscription);
    });
  }

  /**
   * Filters the support-themes based on the search term entered by the user.
   *
   * This method updates the `filteredThemes` array to include only the support-themes
   * whose names contain the search term. The search is case-insensitive.
   *
   * @param {Event} event - The input event triggered by the search field.
   */
  protected searchTheme(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredThemes = this.supportThemes.filter(theme =>
      theme.name.toLowerCase().includes(searchTerm) ||
      theme.desc.toLowerCase().includes(searchTerm) ||
      theme.roles.some(role => role.name.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Opens the FAQ modal for a specific support theme.
   *
   * This method sets the modal type to 'SUPPORT_THEME_FAQ' and assigns the provided
   * support theme to the modal. It then displays the modal to the user.
   *
   * @param {SupportTheme} theme - The support theme for which the FAQ modal should be opened.
   */
  protected openFAQModal(theme: SupportTheme): void {
    this.modalType = 'SUPPORT_THEME_FAQ';
    this.modalTheme = theme;
    this.modal.showModal();
  }

  /**
   * Opens the Default Mention Changer for a specific support theme.
   *
   * This method sets the modal type to 'DEFAULT_MENTION' and assigns the provided
   * support theme to the modal. It then displays the modal to the user.
   */
  protected openDefaultMentionModal(): void {
    this.modalType = 'DEFAULT_MENTION';
    this.modalExtra = this.supportThemes[0].default_roles;
    this.modal.showModal();
  }

  /**
   * Changes the default mention roles for a support theme.
   *
   * This method updates the default mention roles for the active guild. It allows the user to select
   * or clear roles, sends the updated roles to the server, and updates the local data accordingly.
   * If the operation is successful, it displays a success message; otherwise, it handles errors
   * such as rate limits or authorization issues.
   *
   * @param {HTMLCollectionOf<HTMLOptionElement>} options - The collection of HTML option elements representing the roles.
   * @param {boolean} [useDelete] - Optional flag to clear all selected roles. If true, all roles are removed.
   */
  protected changeDefaultMention(options: HTMLCollectionOf<HTMLOptionElement>, useDelete?: boolean): void {
    if (!this.dataService.active_guild) { return; }
    let selectedOptions: string[] = Array.from(options).filter(option => option.selected)
                                                         .map(option => option.value);
    const foundRoles: Role[] = this.discordRoles.filter(role => selectedOptions.includes(role.id));
    if (useDelete) { selectedOptions = []; }

    this.discordService.changeDefaultMention(this.dataService.active_guild.id, selectedOptions)
      .then((observable): void => {
        const subscription: Subscription = observable.subscribe({
          next: (_result: boolean): void => {
            // Successfully changed, update shown data
            this.selectedOptions = selectedOptions;
            this.updatePingRoles(selectedOptions);
            localStorage.removeItem('support_themes');

            if (selectedOptions.length > 0) {
              this.dataService.error_color = 'green';
              this.dataService.showAlert(this.translate.instant('SUCCESS_MENTION_SET'),
                this.translate.instant('SUCCESS_MENTION_SET_DESC',
                  { roles: foundRoles.map(role => role.name).join(', ') }));
            } else {
              this.dataService.error_color = 'red';
              this.dataService.showAlert(this.translate.instant('SUCCESS_MENTION_RESET'),
                this.translate.instant('SUCCESS_MENTION_RESET_DESC'));
            }

            // close modal
            this.modal.hideModal();
          },
          error: (err: HttpErrorResponse): void => {
            if (err.status === 429) {
              this.dataService.redirectLoginError('REQUESTS');
            } else if (err.status === 401) {
              this.dataService.redirectLoginError('FORBIDDEN');
            } else {
              this.dataService.redirectLoginError('EXPIRED');
            }

            // close modal
            this.modal.hideModal();
          }
        });

        this.subscriptions.push(subscription);
      });
  }

  /**
   * Updates the roles associated with each support theme based on the selected options.
   *
   * This method modifies the `roles` array of each `SupportTheme` in the `supportThemes` list.
   * If no roles are selected, it removes all default roles. Otherwise, it replaces the old default roles
   * with the newly selected roles and ensures no duplicates are added. The roles are then sorted by their position.
   *
   * @param {string[]} selectedOptions - An array of role IDs selected by the user.
   */
  private updatePingRoles(selectedOptions: string[]): void {
    // Update the default roles for each support theme
    this.supportThemes.forEach((theme: SupportTheme): void => {
      if (selectedOptions.length === 0) {  // Remove all default roles
        const defaultRoleIds = this.modalExtra.map(role => role.id);
        theme.roles = theme.roles.filter(role => !defaultRoleIds.includes(role.id));
      } else {
        // Identify previous default roles stored in modalExtra
        const defaultRoleIds = new Set(this.modalExtra.map(role => role.id));
        // Remove all old default roles
        theme.roles = theme.roles.filter(role => !defaultRoleIds.has(role.id));

        // Add the newly selected roles
        const newRoles: Role[] = [];
        selectedOptions.forEach((roleId: string): void => {
          const selectedRole: Role | undefined = this.discordRoles.find(role => role.id === roleId);
          if (selectedRole) {
            newRoles.push(selectedRole);
          }
        });

        // Update theme roles with non-default roles plus newly selected roles
        theme.roles = [...theme.roles, ...newRoles];
      }

      // Update default_roles property for each theme to track the current default roles
      theme.default_roles = selectedOptions.length === 0 ? [] :
        this.discordRoles.filter(role => selectedOptions.includes(role.id));

      theme.roles.sort((a: Role, b: Role): number => b.position - a.position); // Sort roles by position
    });
  }

  /**
   * Checks if a given role ID is part of the default roles or selected options and returns a translated placeholder string if true.
   *
   * @param default_roles - An array of default `Role` objects to check against.
   * @param role_id - The ID of the role to check.
   * @returns A string containing the translated placeholder if the role ID is found in the default roles or selectedOptions, otherwise an empty string.
   */
  isDefaultMentioned(default_roles: Role[], role_id: string): string {
    const isDefault = default_roles.some(r => r.id === role_id);
    const isSelected = this.modalType === 'DEFAULT_MENTION' && this.selectedOptions.includes(role_id);

    return (isDefault || isSelected) ? '(' + this.translate.instant("PLACEHOLDER_DEFAULT") + ')' : '';
  }

  /**
   * Handles document click events to close modals if the user clicks outside of them.
   *
   * @param {MouseEvent} event - The click event triggered on the document.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside: boolean = this.modal.modalContent.nativeElement.contains(event.target as Node);
    if (!clickedInside && !(document.activeElement && document.activeElement.id.includes('Btn_'))) {
      this.modal.hideModal();
    }
  }

  /**
   * Getter for the table configuration used in the Support Themes component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "SUPPORT_THEMES",
      list_empty: 'PLACEHOLDER_THEME_EMPTY',
      dataLoading: this.dataLoading,
      rows: this.filteredThemes,
      columns: [
        { width: 7, name: '🎨 ~ Icon' },
        { width: 15, name: '✏️ ~ Name' },
        { width: 30, name: 'PLACEHOLDER_THEME_DESC' },
        { width: 40, name: 'PLACEHOLDER_DISCORD_PING' },
        { width: 8, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'blue',
          icon: this.faPencil,
          size: 'lg',
          action: (theme: SupportTheme): void => {} // TODO
        },
        {
          color: 'red',
          icon: this.faXmark,
          size: 'xl',
          action: (theme: SupportTheme): void => {} // TODO
        }
      ],
      actions: [
        (theme: SupportTheme): void => this.openFAQModal(theme),
        (default_roles: Role[], role_id: string): string => this.isDefaultMentioned(default_roles, role_id)
      ]
    };
  };
}
