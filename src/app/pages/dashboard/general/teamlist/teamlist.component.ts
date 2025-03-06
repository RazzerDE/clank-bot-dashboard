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
import {Router} from "@angular/router";

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

  constructor(protected dataService: DataHolderService, private discordService: ComService, private router: Router) {
    document.title = "Teamlist ~ Clank Discord-Bot";
    this.dataService.isLoading = true;

    this.getTeamRoles(); // first call to get the server data
    this.dataService.allowDataFetch.subscribe((value: boolean): void => {
      if (value) { // only fetch data if allowed
        this.getTeamRoles();
      }
    });
  }


  /**
   * Retrieves the team roles for the active guild.
   *
   * This method first checks if the team roles are already stored in the local storage and if the stored data is still valid.
   * If valid data is found, it uses the stored data. Otherwise, it makes an API call to fetch the team roles from the backend.
   * The fetched data is then stored in the local storage for future use.
   */
  getTeamRoles(): void {
    // redirect to dashboard if no active guild is set
    if (!this.dataService.active_guild) {
      this.router.navigateByUrl("/dashboard").then();
      return;
    }

    // check if guilds are already stored in local storage (one minute cache)
    if (localStorage.getItem('guild_team') && localStorage.getItem('guild_team_timestamp') &&
      Date.now() - Number(localStorage.getItem('guild_team_timestamp')) < 60000) {
      this.roles = JSON.parse(localStorage.getItem('guild_team') as string);
      this.dataService.isLoading = false;
      return;
    }

    this.discordService.getTeamRoles(this.dataService.active_guild!.id).then((observable) => observable.subscribe({
      next: (roles: Role[]): void => {
        this.roles = roles;
        this.dataService.isLoading = false;

        localStorage.setItem('guild_team', JSON.stringify(this.roles));
        localStorage.setItem('guild_team_timestamp', Date.now().toString());
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
