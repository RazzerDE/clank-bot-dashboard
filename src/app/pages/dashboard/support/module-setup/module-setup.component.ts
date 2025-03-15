import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";

@Component({
  selector: 'app-module-setup',
    imports: [
        DashboardLayoutComponent
    ],
  templateUrl: './module-setup.component.html',
  styleUrl: './module-setup.component.scss'
})
export class ModuleSetupComponent {

  constructor(private dataService: DataHolderService) {
    document.title = 'Support Setup ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

}
