import {AfterViewChecked, Component, OnDestroy} from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {SupportTheme} from "../../../../services/types/Tickets";
import {faPencil} from "@fortawesome/free-solid-svg-icons/faPencil";
import {TableConfig} from "../../../../services/types/Config";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {ComService} from "../../../../services/discord-com/com.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-support-themes',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    DataTableComponent
  ],
  templateUrl: './support-themes.component.html',
  styleUrl: './support-themes.component.scss'
})
export class SupportThemesComponent implements OnDestroy, AfterViewChecked {
  protected supportThemes: SupportTheme[] = [];
  protected filteredThemes: SupportTheme[] = this.supportThemes;
  protected dataLoading: boolean = true;
  protected subscriptions: Subscription[] = [];

  constructor(public dataService: DataHolderService, private router: Router, private discordService: ComService) {
    this.dataService.isLoading = true;

    this.getSupportThemes(); // first call to get the server data
    const dataFetchSubscription: Subscription = this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.dataLoading = true;
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

  getSupportThemes(no_cache?: boolean): void {
    // redirect to dashboard if no active guild is set
    if (!this.dataService.active_guild) {
      this.router.navigateByUrl("/dashboard").then();
      return;
    }

    // check if guilds are already stored in local storage (one minute cache)
    if ((localStorage.getItem('support_themes') && localStorage.getItem('support_themes_timestamp') &&
      Date.now() - Number(localStorage.getItem('support_themes_timestamp')) < 60000) && !no_cache) {
      this.supportThemes = JSON.parse(localStorage.getItem('support_themes') as string);
      this.filteredThemes = this.supportThemes;
      this.dataService.isLoading = false;
      return;
    }

    this.discordService.getSupportThemes(this.dataService.active_guild!.id).then((observable) => {
      const subscription: Subscription = observable.subscribe({
        next: (support_themes: SupportTheme[]): void => {
          this.supportThemes = support_themes;
          this.filteredThemes = this.supportThemes;
          this.dataService.isLoading = false;

          localStorage.setItem('support_themes', JSON.stringify(this.supportThemes));
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
  searchTheme(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredThemes = this.supportThemes.filter(theme =>
      theme.name.toLowerCase().includes(searchTerm) || theme.roles.some(role => role.name.toLowerCase().includes(searchTerm))
    );
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
      actions: []
    };
  };

  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faXmark: IconDefinition = faXmark;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faPencil: IconDefinition = faPencil;
}
