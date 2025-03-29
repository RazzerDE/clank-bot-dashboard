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
  protected moduleStatus: 0 | 1 | 2 = 2;
  protected currentStep: 1 | 2 | 3 = 1; // TODO
  protected channelItems: { id: number, name: string }[] = [
    { id: 123456789, name: 'test' },
    { id: 456789901, name: 'test' },
    { id: 454565465, name: 'test' },
    { id: 122432345, name: 'test' },
    { id: 656745464, name: 'test' },
    { id: 876856756, name: 'test' },
    { id: 576784567, name: 'test' },
    { id: 435546456, name: 'test' },
    { id: 324435567, name: 'test' },
    { id: 324436658, name: 'test' },
    { id: 435767967, name: 'test' },
    { id: 859465564, name: 'test' },
    { id: 406587546, name: 'test' },
  ]; // TODO: Real data; sort by id and alphabetically
  protected selectedChannelId: number | null = null;

  constructor(private dataService: DataHolderService) {
    document.title = 'Support Setup ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

  protected selectChannel(id: number): void {
    this.selectedChannelId = this.selectedChannelId === id ? null : id;
  }

}
