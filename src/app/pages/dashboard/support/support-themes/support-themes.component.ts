import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
  selector: 'app-support-themes',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe
  ],
  templateUrl: './support-themes.component.html',
  styleUrl: './support-themes.component.scss'
})
export class SupportThemesComponent {

  constructor(public dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

}
