import { Component } from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FormsModule} from "@angular/forms";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-moderation-requests',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    FormsModule,
    PageThumbComponent,
    TranslatePipe
  ],
  templateUrl: './moderation-requests.component.html',
  styleUrl: './moderation-requests.component.scss'
})
export class ModerationRequestsComponent {

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

}
