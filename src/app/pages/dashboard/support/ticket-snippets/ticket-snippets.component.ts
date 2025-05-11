import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";

@Component({
  selector: 'app-ticket-snippets',
    imports: [
        DashboardLayoutComponent,
    ],
  templateUrl: './ticket-snippets.component.html',
  styleUrl: './ticket-snippets.component.scss'
})
export class TicketSnippetsComponent {

  constructor() {
    document.title = 'Ticket Snippets ~ Clank Discord-Bot';
  }

}
