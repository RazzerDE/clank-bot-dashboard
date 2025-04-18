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
import {TableConfig} from "../../../../services/types/Config";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";

@Component({
  selector: 'app-support-themes',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    DataTableComponent
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
        },
        {
          id: '103',
          name: 'Tech-Support Level 3',
          color: 0xe74c3c, // Rot
          hoist: true,
          icon: null,
          unicode_emoji: '🔧',
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
          support_level: 3
        },
        {
          id: '104',
          name: 'Tech-Support Level 4',
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
          support_level: 4
        },
        {
          id: '105',
          name: 'Tech-Support Level 5',
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
          support_level: 5
        },
        {
          id: '106',
          name: 'Tech-Support Level 6',
          color: 0x1abc9c, // Türkis
          hoist: true,
          icon: null,
          unicode_emoji: '📊',
          position: 6,
          permissions: '8',
          managed: false,
          mentionable: true,
          tags: {
            bot_id: null,
            integration_id: null,
            premium_subscriber: null
          },
          flags: 0,
          support_level: 6
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
    },
    {
      id: '4',
      name: 'Produktfragen',
      icon: '📦',
      roles: [
        {
          id: '401',
          name: 'Produktberater',
          color: 0x1abc9c, // Türkis
          hoist: true,
          icon: null,
          unicode_emoji: '📊',
          position: 6,
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
      id: '5',
      name: 'Zahlungen & Abonnements',
      icon: '💰',
      roles: [
        {
          id: '501',
          name: 'Finanz-Support',
          color: 0x27ae60, // Dunkelgrün
          hoist: true,
          icon: null,
          unicode_emoji: '💳',
          position: 7,
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
          id: '502',
          name: 'Rechnungswesen',
          color: 0x16a085, // Anderes Grün
          hoist: true,
          icon: null,
          unicode_emoji: '📝',
          position: 8,
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
    },
    {
      id: '6',
      name: 'Bug Reports',
      icon: '🐛',
      roles: [
        {
          id: '601',
          name: 'Bug Hunter',
          color: 0xe67e22, // Orange
          hoist: true,
          icon: null,
          unicode_emoji: '🔍',
          position: 9,
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
      id: '7',
      name: 'Feedback & Feature-Requests',
      icon: '💡',
      roles: [
        {
          id: '701',
          name: 'Produktmanager',
          color: 0xd35400, // Dunkles Orange
          hoist: true,
          icon: null,
          unicode_emoji: '📈',
          position: 10,
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
          id: '702',
          name: 'UX Designer',
          color: 0x8e44ad, // Violett
          hoist: true,
          icon: null,
          unicode_emoji: '🎨',
          position: 11,
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
      id: '8',
      name: 'Community Management',
      icon: '👥',
      roles: [
        {
          id: '801',
          name: 'Community Manager',
          color: 0x34495e, // Dunkelblau
          hoist: true,
          icon: null,
          unicode_emoji: '👋',
          position: 12,
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
        }
      ]
    }
  ];
  protected dataLoading: boolean = false;

  constructor(public dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

  /**
   * Getter for the table configuration used in the Support Themes component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "SUPPORT_THEMES",
      list_empty: 'PLACEHOLDER_ROLE_EMPTY',
      dataLoading: this.dataLoading,
      rows: this.filteredThemes,
      columns: [
        { width: 6, name: '🎨 ~ Icon' },
        { width: 26, name: '✏️ ~ Name' },
        { width: 60, name: 'PLACEHOLDER_DISCORD_PING' },
        { width: 10, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'blue',
          icon: this.faPencil,
          size: 'lg',
          action: (theme: SupportTheme): void => {} // TODO
        },
        {
          color: 'red',
          icon: this.faXmark,
          size: 'xl',
          action: (theme: SupportTheme): void => {} // TODO
        }
      ],
      actions: []
    };
  };

  protected readonly faPlus = faPlus;
  protected readonly faSearch = faSearch;
  protected readonly faXmark = faXmark;
  protected readonly faRefresh = faRefresh;
  protected readonly faPencil = faPencil;
}
