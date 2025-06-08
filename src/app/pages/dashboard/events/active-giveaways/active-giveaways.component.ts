import { Component } from '@angular/core';
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
export class ActiveGiveawaysComponent {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faGift: IconDefinition = faGift;
  protected readonly faRefresh: IconDefinition = faRefresh;

  protected events: Giveaway[] = [];
  protected filteredEvents: Giveaway[] = [];

  constructor(private dataService: DataHolderService) {
    document.title = 'Active Events - Clank Discord-Bot';
    this.dataService.isLoading = false;
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
      dataLoading: this.dataService.isLoading, // TODO: Implement loading state
      rows: this.filteredEvents,
      columns: [
        { width: 22, name: 'PAGE_EVENTS_TABLE_PRICE' },
        { width: 22, name: 'PAGE_EVENTS_TABLE_END_DATE' },
        { width: 23, name: 'PAGE_EVENTS_TABLE_REQUIREMENT' },
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
