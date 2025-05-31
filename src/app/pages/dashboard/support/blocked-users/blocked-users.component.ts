import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";
import {TableConfig} from "../../../../services/types/Config";
import {BlockedUser, DiscordUser} from "../../../../services/types/discord/User";

@Component({
  selector: 'app-blocked-users',
  imports: [
    DashboardLayoutComponent,
    FaIconComponent,
    TranslatePipe,
    PageThumbComponent,
    AlertBoxComponent,
    DataTableComponent
  ],
  templateUrl: './blocked-users.component.html',
  styleUrl: './blocked-users.component.scss'
})
export class BlockedUsersComponent {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faPlus: IconDefinition = faPlus;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected dataLoading: boolean = false;

  protected user_list: BlockedUser[] = [
    {
      user: { id: '123456789012345678', username: 'Benutzer1', avatar: 'assets/img/placeholder-user.gif', discriminator: '1234' } as DiscordUser,
      staff: { id: '987654321098765432', username: 'Moderator1', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0001' } as DiscordUser,
      user_id: '123456789012345678',
      staff_id: '987654321098765432',
      reason: 'Spam in mehreren Kanälen',
      end_date: Date.now() + 86400000 // 1 Tag in der Zukunft
    },
    {
      user: { id: '234567890123456789', username: 'Benutzer2', avatar: 'assets/img/placeholder-user.gif', discriminator: '2345' } as DiscordUser,
      staff: { id: '876543210987654321', username: 'Admin1', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0002' } as DiscordUser,
      user_id: '234567890123456789',
      staff_id: '876543210987654321',
      reason: 'Beleidigung anderer Nutzer',
      end_date: Date.now() + 259200000 // 3 Tage in der Zukunft
    },
    {
      user: { id: '345678901234567890', username: 'Benutzer3', avatar: 'assets/img/placeholder-user.gif', discriminator: '3456' } as DiscordUser,
      staff: { id: '765432109876543210', username: 'Moderator2', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0003' } as DiscordUser,
      user_id: '345678901234567890',
      staff_id: '765432109876543210',
      reason: 'Regelverstoß: NSFW-Inhalte',
      end_date: Date.now() + 604800000 // 7 Tage in der Zukunft
    },
    {
      user: { id: '456789012345678901', username: 'Benutzer4', avatar: 'assets/img/placeholder-user.gif', discriminator: '4567' } as DiscordUser,
      staff: { id: '654321098765432109', username: 'Admin2', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0004' } as DiscordUser,
      user_id: '456789012345678901',
      staff_id: '654321098765432109',
      reason: 'Wiederholtes Spamming nach Warnung',
      end_date: Date.now() + 1209600000 // 14 Tage in der Zukunft
    },
    {
      user: { id: '567890123456789012', username: 'Benutzer5', avatar: 'assets/img/placeholder-user.gif', discriminator: '5678' } as DiscordUser,
      staff: { id: '543210987654321098', username: 'Moderator3', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0005' } as DiscordUser,
      user_id: '567890123456789012',
      staff_id: '543210987654321098',
      reason: 'Werbung für externe Dienste',
      end_date: Date.now() + 2592000000 // 30 Tage in der Zukunft
    },
    {
      user: { id: '678901234567890123', username: 'Benutzer6', avatar: 'assets/img/placeholder-user.gif', discriminator: '6789' } as DiscordUser,
      staff: { id: '432109876543210987', username: 'Admin3', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0006' } as DiscordUser,
      user_id: '678901234567890123',
      staff_id: '432109876543210987',
      reason: 'Verstoß gegen Community-Richtlinien',
      end_date: Date.now() + 5184000000 // 60 Tage in der Zukunft
    },
    {
      user: null, // Benutzer nicht mehr auf dem Server
      staff: { id: '321098765432109876', username: 'Moderator4', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0007' } as DiscordUser,
      user_id: '789012345678901234',
      staff_id: '321098765432109876',
      reason: 'Doxxing und Belästigung',
      end_date: Date.now() + 7776000000 // 90 Tage in der Zukunft
    },
    {
      user: { id: '890123456789012345', username: 'Benutzer8', avatar: 'assets/img/placeholder-user.gif', discriminator: '8901' } as DiscordUser,
      staff: null, // Mitarbeiter nicht mehr auf dem Server
      user_id: '890123456789012345',
      staff_id: '210987654321098765',
      reason: 'Bot-Missbrauch',
      end_date: Date.now() + 15552000000 // 180 Tage in der Zukunft
    },
    {
      user: { id: '901234567890123456', username: 'Benutzer9', avatar: 'assets/img/placeholder-user.gif', discriminator: '9012' } as DiscordUser,
      staff: { id: '109876543210987654', username: 'Admin4', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0009' } as DiscordUser,
      user_id: '901234567890123456',
      staff_id: '109876543210987654',
      reason: 'Umgehung früherer Sperren',
      end_date: Date.now() + 31536000000 // 365 Tage in der Zukunft
    },
    {
      user: { id: '012345678901234567', username: 'Benutzer10', avatar: 'assets/img/placeholder-user.gif', discriminator: '0123' } as DiscordUser,
      staff: { id: '098765432109876543', username: 'Moderator5', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0010' } as DiscordUser,
      user_id: '012345678901234567',
      staff_id: '098765432109876543',
      reason: 'Phishing-Links',
      end_date: -1 // Permanente Sperre
    },
    {
      user: { id: '112233445566778899', username: 'Benutzer11', avatar: 'assets/img/placeholder-user.gif', discriminator: '1122' } as DiscordUser,
      staff: { id: '998877665544332211', username: 'Admin5', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0011' } as DiscordUser,
      user_id: '112233445566778899',
      staff_id: '998877665544332211',
      reason: 'Verbreitung von Malware',
      end_date: -1 // Permanente Sperre
    },
    {
      user: null, // Benutzer nicht mehr auf dem Server
      staff: { id: '223344556677889900', username: 'Moderator6', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0012' } as DiscordUser,
      user_id: '223344556677889900',
      staff_id: '887766554433221100',
      reason: 'Hassrede',
      end_date: Date.now() + 43200000 // 12 Stunden in der Zukunft
    },
    {
      user: { id: '334455667788990011', username: 'Benutzer13', avatar: 'assets/img/placeholder-user.gif', discriminator: '3344' } as DiscordUser,
      staff: { id: '776655443322110099', username: 'Admin6', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0013' } as DiscordUser,
      user_id: '334455667788990011',
      staff_id: '776655443322110099',
      reason: 'Wiederholter Verstoß gegen Kanalrichtlinien',
      end_date: Date.now() + 172800000 // 2 Tage in der Zukunft
    },
    {
      user: { id: '445566778899001122', username: 'Benutzer14', avatar: 'assets/img/placeholder-user.gif', discriminator: '4455' } as DiscordUser,
      staff: null, // Mitarbeiter nicht mehr auf dem Server
      user_id: '445566778899001122',
      staff_id: '665544332211009988',
      reason: 'Angriffe auf Server-Mitglieder',
      end_date: Date.now() + 432000000 // 5 Tage in der Zukunft
    },
    {
      user: { id: '556677889900112233', username: 'Benutzer15', avatar: 'assets/img/placeholder-user.gif', discriminator: '5566' } as DiscordUser,
      staff: { id: '554433221100998877', username: 'Moderator7', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0015' } as DiscordUser,
      user_id: '556677889900112233',
      staff_id: '554433221100998877',
      reason: 'Ständige Störung von Diskussionen',
      end_date: Date.now() + 864000000 // 10 Tage in der Zukunft
    },
    {
      user: { id: '667788990011223344', username: 'Benutzer16', avatar: 'assets/img/placeholder-user.gif', discriminator: '6677' } as DiscordUser,
      staff: { id: '443322110099887766', username: 'Admin7', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0016'} as DiscordUser,
      user_id: '667788990011223344',
      staff_id: '443322110099887766',
      reason: 'Missbrauch von Befehlen',
      end_date: Date.now() + 1728000000 // 20 Tage in der Zukunft
    },
    {
      user: { id: '778899001122334455', username: 'Benutzer17', avatar: 'assets/img/placeholder-user.gif', discriminator: '7788' } as DiscordUser,
      staff: { id: '332211009988776655', username: 'Moderator8', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0017' } as DiscordUser,
      user_id: '778899001122334455',
      staff_id: '332211009988776655',
      reason: 'Betrug anderer Mitglieder',
      end_date: Date.now() + 3456000000 // 40 Tage in der Zukunft
    },
    {
      user: { id: '889900112233445566', username: 'Benutzer18', avatar: 'assets/img/icons/utility/wave.png', discriminator: '8899' } as DiscordUser,
      staff: { id: '221100998877665544', username: 'Admin8', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0018' } as DiscordUser,
      user_id: '889900112233445566',
      staff_id: '221100998877665544',
      reason: 'Manipulation von Abstimmungen',
      end_date: Date.now() + 10368000000 // 120 Tage in der Zukunft
    },
    {
      user: null, // Benutzer nicht mehr auf dem Server
      staff: { id: '110099887766554433', username: 'Moderator9', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0019' } as DiscordUser,
      user_id: '990011223344556677',
      staff_id: '110099887766554433',
      reason: 'Nicht autorisierte Werbung',
      end_date: Date.now() + 21600000 // 6 Stunden in der Zukunft
    },
    {
      user: { id: '001122334455667788', username: 'Benutzer20', avatar: 'assets/img/placeholder-user.gif', discriminator: '0011' } as DiscordUser,
      staff: { id: '009988776655443322', username: 'Admin9', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', discriminator: '0020' } as DiscordUser,
      user_id: '001122334455667788',
      staff_id: '009988776655443322',
      reason: 'Verstoß gegen Nutzungsbedingungen',
      end_date: null
    }
  ];
  protected filteredUsers: BlockedUser[] = [...this.user_list];

  constructor(protected dataService: DataHolderService) {
    document.title = 'Blocked Users ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

  /**
   * Getter for the table configuration used in the Blocked users component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "BLOCKED_USERS",
      list_empty: 'PLACEHOLDER_USER_EMPTY',
      dataLoading: this.dataLoading,
      rows: this.filteredUsers,
      columns: [
        { width: 20, name: '👤 ~ Discord-User' },
        { width: 25, name: 'PLACEHOLDER_REASON' },
        { width: 22, name: 'PLACEHOLDER_END_DATE' },
        { width: 25, name: 'PLACEHOLDER_PUNISHED_BY' },
        { width: 8, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (user: BlockedUser): void => { }  // TODO
        }
      ],
      actions: []
    };
  };
}
