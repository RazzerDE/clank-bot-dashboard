import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faSearch, faXmark} from "@fortawesome/free-solid-svg-icons";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {SupportTheme} from "../../../../services/types/Tickets";
import {faPencil} from "@fortawesome/free-solid-svg-icons/faPencil";

@Component({
  selector: 'app-support-themes',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent
  ],
  templateUrl: './support-themes.component.html',
  styleUrl: './support-themes.component.scss'
})
export class SupportThemesComponent {
  protected filteredThemes: SupportTheme[] = [
    {
      id: '1',
      name: 'Technischer Support',
      icon: '🔧',
      roles: [
        {
          id: '101',
          name: 'Tech-Support Level 1',
          color: 0x3498db, // Blau
          hoist: true,
          icon: null,
          unicode_emoji: '🛠️',
          position: 1,
          permissions: '8',
          managed: false,
          mentionable: true,
          tags: {
            bot_id: null,
            integration_id: null,
            premium_subscriber: null
          },
          flags: 0,
          support_level: 1
        },
        {
          id: '102',
          name: 'Tech-Support Level 2',
          color: 0x2ecc71, // Grün
          hoist: true,
          icon: null,
          unicode_emoji: '👨‍💻',
          position: 2,
          permissions: '8',
          managed: false,
          mentionable: true,
          tags: {
            bot_id: null,
            integration_id: null,
            premium_subscriber: null
          },
          flags: 0,
          support_level: 2
        }
      ]
    },
    {
      id: '2',
      name: 'Allgemeine Hilfe',
      icon: '❓',
      roles: [
        {
          id: '201',
          name: 'Helfer',
          color: 0xe74c3c, // Rot
          hoist: true,
          icon: null,
          unicode_emoji: '❓',
          position: 3,
          permissions: '8',
          managed: false,
          mentionable: true,
          tags: {
            bot_id: null,
            integration_id: null,
            premium_subscriber: null
          },
          flags: 0,
          support_level: 1
        }
      ]
    },
    {
      id: '3',
      name: 'Moderation',
      icon: '🚔',
      roles: [
        {
          id: '301',
          name: 'Moderator',
          color: 0x9b59b6, // Lila
          hoist: true,
          icon: null,
          unicode_emoji: '🛡️',
          position: 4,
          permissions: '8',
          managed: false,
          mentionable: true,
          tags: {
            bot_id: null,
            integration_id: null,
            premium_subscriber: null
          },
          flags: 0,
          support_level: 3
        },
        {
          id: '302',
          name: 'Admin',
          color: 0xf1c40f, // Gelb
          hoist: true,
          icon: null,
          unicode_emoji: '⚡',
          position: 5,
          permissions: '8',
          managed: false,
          mentionable: true,
          tags: {
            bot_id: null,
            integration_id: null,
            premium_subscriber: null
          },
          flags: 0,
          support_level: 4
        }
      ]
    }
  ];
  protected dataLoading: boolean = false;

  constructor(public dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

  protected readonly faPlus = faPlus;
  protected readonly faSearch = faSearch;
  protected readonly faXmark = faXmark;
  protected readonly faRefresh = faRefresh;
  protected readonly faPencil = faPencil;
}
