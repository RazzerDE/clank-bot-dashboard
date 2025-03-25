import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {NgClass, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-module-setup',
  imports: [
    DashboardLayoutComponent,
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './module-setup.component.html',
  styleUrl: './module-setup.component.scss'
})
export class ModuleSetupComponent {
  // 0 = Not started, 1 = In progress, 2 = Completed (TODO: Real data)
  protected moduleStatus: 0 | 1 | 2 = 0;
  protected currentStep: 1 | 2 | 3 = 1; // TODO

  constructor(private dataService: DataHolderService) {
    document.title = 'Support Setup ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

}
