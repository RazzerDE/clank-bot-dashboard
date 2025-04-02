import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
  selector: 'app-open-tickets',
    imports: [DashboardLayoutComponent],
  templateUrl: './open-tickets.component.html',
  styleUrl: './open-tickets.component.scss'
})
export class OpenTicketsComponent {

  constructor(private dataService: DataHolderService) {
    document.title = 'Open Tickets ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

}
