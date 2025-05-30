import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {faSearch, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
  selector: 'app-blocked-users',
  imports: [
    DashboardLayoutComponent,
    FaIconComponent,
    TranslatePipe,
    PageThumbComponent
  ],
  templateUrl: './blocked-users.component.html',
  styleUrl: './blocked-users.component.scss'
})
export class BlockedUsersComponent {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faRefresh: IconDefinition = faRefresh;

  constructor(private dataService: DataHolderService) {
    document.title = 'Blocked Users ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }
}
