import { Component } from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
  selector: 'app-logs',
    imports: [
        AlertBoxComponent,
        DashboardLayoutComponent,
        PageThumbComponent,
        TranslatePipe
    ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent {

  constructor(protected dataService: DataHolderService) {
    document.title = 'Security Logs ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

}
