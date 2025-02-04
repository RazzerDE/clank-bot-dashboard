import { Component } from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {TranslatePipe} from "@ngx-translate/core";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";

@Component({
  selector: 'app-teamlist',
  imports: [
    TranslatePipe,
    PageThumbComponent,
    DashboardLayoutComponent
  ],
  templateUrl: './teamlist.component.html',
  styleUrl: './teamlist.component.scss'
})
export class TeamlistComponent {

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

}
