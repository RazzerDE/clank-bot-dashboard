import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {faSearch, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {faGift} from "@fortawesome/free-solid-svg-icons/faGift";

@Component({
  selector: 'app-active-giveaways',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
  ],
  templateUrl: './active-giveaways.component.html',
  styleUrl: './active-giveaways.component.scss'
})
export class ActiveGiveawaysComponent {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faGift: IconDefinition = faGift;
  protected readonly faRefresh: IconDefinition = faRefresh;

  constructor(private dataService: DataHolderService) {
    document.title = 'Active Events - Clank Discord-Bot';
    this.dataService.isLoading = false;
  }
}
