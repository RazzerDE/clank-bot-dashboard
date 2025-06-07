import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
  selector: 'app-active-giveaways',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
  ],
  templateUrl: './active-giveaways.component.html',
  styleUrl: './active-giveaways.component.scss'
})
export class ActiveGiveawaysComponent {

  constructor(private dataService: DataHolderService) {
    document.title = 'Active Events - Clank Discord-Bot';
    this.dataService.isLoading = false;
  }
}
