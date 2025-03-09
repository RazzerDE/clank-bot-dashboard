import { Component } from '@angular/core';
import {HeaderComponent} from "../header/header.component";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {NgClass} from "@angular/common";
import {DataHolderService} from "../../services/data/data-holder.service";

@Component({
  selector: 'dashboard-layout',
  imports: [
    HeaderComponent,
    SidebarComponent,
    NgClass
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent {

  constructor(protected dataService: DataHolderService) {}

}
