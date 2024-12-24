import { Component } from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {LangSwitchButtonComponent} from "../util/lang-switch-button/lang-switch-button.component";
import {ThemeSwitchButtonComponent} from "../util/theme-switch-button/theme-switch-button.component";
import {DataHolderService} from "../../services/data/data-holder.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgOptimizedImage,
    LangSwitchButtonComponent,
    ThemeSwitchButtonComponent,
    NgClass
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private server_picker_width: number = 0;
  protected showSearchInput: boolean = false;

  constructor(private dataService: DataHolderService) {}

  /**
   * Toggles the visibility of the server picker sidebar.
   * If the sidebar is currently hidden (width is 0), it will be shown.
   * If the sidebar is currently visible, it will be hidden (width set to 0).
   */
  toggleServers(): void {
    const element: HTMLDivElement | null = document.getElementById('discord-server-picker') as HTMLDivElement;
    if (element) {
      if (this.server_picker_width === 0) {
        this.server_picker_width = element.clientWidth;
      }

      // show it again
      if (element.style.width === '0px') {
        element.style.width = this.server_picker_width + 'px';
      } else {
        // hide it
        element.style.width = '0';
      }

      this.dataService.showSidebarLogo = !this.dataService.showSidebarLogo;
    }
  }

}
