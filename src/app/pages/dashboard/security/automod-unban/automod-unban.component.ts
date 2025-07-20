import { Component } from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
  selector: 'app-automod-unban',
    imports: [
        AlertBoxComponent,
        DashboardLayoutComponent,
        PageThumbComponent,
        TranslatePipe
    ],
  templateUrl: './automod-unban.component.html',
  styleUrl: './automod-unban.component.scss'
})
export class AutomodUnbanComponent {

  constructor(protected dataService: DataHolderService) {
    document.title = 'AutoMod-Settings - Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

}
