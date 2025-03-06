import { Component } from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {TranslatePipe} from "@ngx-translate/core";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {NgClass} from "@angular/common";
import {HttpErrorResponse} from "@angular/common/http";
import {ComService} from "../../../../services/discord-com/com.service";
import {Role} from "../../../../services/types/discord/Guilds";

@Component({
  selector: 'app-teamlist',
  imports: [
    TranslatePipe,
    PageThumbComponent,
    DashboardLayoutComponent,
    FaIconComponent,
    NgClass
  ],
  templateUrl: './teamlist.component.html',
  styleUrl: './teamlist.component.scss'
})
export class TeamlistComponent {
  protected activeTab: number = 0;
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faChevronDown: IconDefinition = faChevronDown;
  protected readonly faXmark: IconDefinition = faXmark;

  protected roles: Role[] = [];

  constructor(protected dataService: DataHolderService, private discordService: ComService) {
    document.title = "Teamlist ~ Clank Discord-Bot";
    this.dataService.isLoading = true;
    this.getTeamRoles();
  }

  /**
   * Fetches the team roles for the active guild and updates the component state.
   * If there is no active guild, the function returns early.
   *
   * The function makes an HTTP request to fetch the team roles using the `discordService`.
   * On success, it updates the `roles` array and sets `isLoading` to false.
   * On error, it handles rate limiting (HTTP 429) and expired sessions by redirecting to the login error page.
   */
  getTeamRoles(): void {
    if (!this.dataService.active_guild) { return; }

    this.discordService.getTeamRoles(this.dataService.active_guild!.id).then((observable) => observable.subscribe({
      next: (roles: Role[]): void => {
        this.roles = roles;
        this.dataService.isLoading = false;
      },
      error: (err: HttpErrorResponse): void => {
        if (err.status === 429) {
          this.dataService.redirectLoginError('REQUESTS');
        } else {
          this.dataService.redirectLoginError('EXPIRED');
        }
      }
    }));
  }

  /**
   * Returns a string representation of the support level based on the provided support level number.
   *
   * @param {number} supportLevel - The support level number (0, 1, or 2).
   * @returns {string} - The string representation of the support level.
   */
  getSupportLevel(supportLevel: number): string {
    switch (supportLevel) {
      case 2:
        return '🚔 - Second Level (Mehr Rechte)';
      case 3:
        return '🚨 - Third Level (Admin-Rechte)';
      default:
        return '🚑 - First Level (Wenig Rechte)';
    }
  }
}
