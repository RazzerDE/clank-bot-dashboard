import { Component } from '@angular/core';
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {faSearch, faXmark, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {faGift} from "@fortawesome/free-solid-svg-icons/faGift";
import {TableConfig} from "../../../../services/types/Config";
import {faPencil} from "@fortawesome/free-solid-svg-icons/faPencil";
import {Giveaway} from "../../../../services/types/Events";
import {DataTableComponent} from "../../../../structure/util/data-table/data-table.component";

@Component({
  selector: 'app-active-giveaways',
  imports: [
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    FaIconComponent,
    DataTableComponent,
  ],
  templateUrl: './active-giveaways.component.html',
  styleUrl: './active-giveaways.component.scss'
})
export class ActiveGiveawaysComponent {
  protected readonly faSearch: IconDefinition = faSearch;
  protected readonly faGift: IconDefinition = faGift;
  protected readonly faRefresh: IconDefinition = faRefresh;

  protected events: Giveaway[] = this.createDummyGiveaways();
  protected filteredEvents: Giveaway[] = [...this.events]; // Initially, all events are shown

  constructor(private dataService: DataHolderService) {
    document.title = 'Active Events - Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

  /**
   * Filters the active giveaways based on the search term entered by the user.
   *
   * This method updates the `filteredEvents` array to include only the active giveaways
   * whose names contain the search term. The search is case-insensitive.
   *
   * @param {Event} event - The input event triggered by the search field.
   */
  protected searchGiveaways(event: Event): void {
    const searchTerm: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredEvents = this.events.filter(giveaway =>
      giveaway.creator_id.toString().toLowerCase().includes(searchTerm) ||
      giveaway.creator_name.toString().toLowerCase().includes(searchTerm) ||
      giveaway.sponsor_id?.toString().toLowerCase().includes(searchTerm) ||
      giveaway.sponsor_name?.toString().toLowerCase().includes(searchTerm) ||
      giveaway.prize.toLowerCase().includes(searchTerm) || giveaway.gw_req?.toLowerCase().includes(searchTerm));
  }

  /**
   * Getter for the table configuration used in the Active giveaways component.
   * This configuration defines the structure and behavior of the table displayed
   * in the component, including columns, rows, and action buttons.
   *
   * @returns {TableConfig} The configuration object for the table.
   */
  protected get tableConfig(): TableConfig {
    return {
      type: "EVENTS_VIEW",
      list_empty: 'PLACEHOLDER_EVENT_EMPTY',
      dataLoading: this.dataService.isLoading, // TODO: Implement loading state
      rows: this.filteredEvents,
      columns: [
        { width: 22, name: 'PAGE_EVENTS_TABLE_PRICE' },
        { width: 22, name: 'PAGE_EVENTS_TABLE_END_DATE' },
        { width: 23, name: 'PAGE_EVENTS_TABLE_REQUIREMENT' },
        { width: 15, name: 'PAGE_EVENTS_TABLE_CREATOR' },
        { width: 13, name: 'PAGE_EVENTS_TABLE_SPONSOR' },
        { width: 5, name: 'PLACEHOLDER_ACTION' }
      ],
      action_btn: [
        {
          color: 'blue',
          icon: faPencil,
          size: 'lg',
          action: (event: Giveaway): void => {} // TODO
        },
        {
          color: 'red',
          icon: faXmark,
          size: 'xl',
          action: (event: Giveaway): void => {} // TODO
        }
      ],
      actions: []
    };
  };

  // TODO: replace after implementing real data fetching
  private createDummyGiveaways(): Giveaway[] {
    const creators = ['Alex', 'Sophia', 'Liam', 'Emma', 'Noah', 'Charlotte', 'Max', 'Julia', 'Ben', 'Mia'];
    const sponsors = ['GameHub', 'TechWorld', 'StreamerParadise', 'GamingStore', 'DigitalDreams'];
    const prizes = [
      '<a:Nitro_Boost:812744849341153330> Discord Nitro (1 Jahr) <a:Nitro_Boost:812744849341153330>',
      '<a:Diamond_pink:868999547882455090> Gaming Headset <a:Diamond_pink:868999547882455090>',
      '<a:Diamond_pink:868999547882455090> Mechanische Tastatur <a:Diamond_pink:868999547882455090>',
      '<a:Diamond_pink:868999547882455090> Gaming-Maus <a:Diamond_pink:868999547882455090>',
      '<a:money:802721260466864192> Steam-Gutschein 50€ <a:money:802721260466864192>',
      '<a:Nitro_Boost:812744849341153330> 3 Monate Premium-Abo <a:Nitro_Boost:812744849341153330>',
      '<a:Diamond_pink:868999547882455090> Gaming-Stuhl <a:Diamond_pink:868999547882455090>',
      '<a:Diamond_pink:868999547882455090> Grafikkarte RTX 3060 <a:Diamond_pink:868999547882455090>',
      '<a:Nitro_Boost:812744849341153330> Twitch-Abonnement <a:Nitro_Boost:812744849341153330>',
      '<a:Diamond_pink:868999547882455090> Logitech G Pro X <a:Diamond_pink:868999547882455090>',
      '<a:money:802721260466864192> Amazon-Gutschein 20€ <a:money:802721260466864192>',
      '<a:Nitro_Boost:812744849341153330> Spotify Premium (6 Monate) <a:Nitro_Boost:812744849341153330>',
      '<a:Diamond_pink:868999547882455090> Gaming-Mauspad XL <a:Diamond_pink:868999547882455090>',
      '<a:Diamond_pink:868999547882455090> RGB LED-Strips <a:Diamond_pink:868999547882455090>',
      '<a:Diamond_pink:868999547882455090> Gaming-Monitor 144Hz <a:Diamond_pink:868999547882455090>',
      '<a:Diamond_pink:868999547882455090> Wireless Earbuds <a:Diamond_pink:868999547882455090>'
    ];
    const requirements = [
      'Server-Mitglied seit mind. 2 Wochen', 'Level 5+ im Server', 'Aktiv im Chat',
      'Mindestens 3 Freunde einladen', 'Rolle "Unterstützer" haben', 'Teilnahme am letzten Event',
      'Mitglied im Discord-Partner', 'Boost des Servers', 'Monatlicher Subscriber',
      'Teilnahme an mindestens 3 Events'
    ];

    return Array.from({ length: 20 }, (_, i) => {
      const creatorIndex = Math.floor(Math.random() * creators.length);
      const hasSponsor = Math.random() > 0.3;
      const sponsorIndex = Math.floor(Math.random() * sponsors.length);
      const hasRequirement = Math.random() > 0.3; // 30% Chance, dass keine Bedingung vorhanden ist
      const today = new Date();

      return {
        creator_id: `${65645664355556 + i}`,
        creator_name: creators[creatorIndex],
        creator_avatar: "assets/img/admin-placeholder.png",
        gw_req: hasRequirement ? requirements[Math.floor(Math.random() * requirements.length)] : null,
        end_date: new Date(today.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1)),
        prize: prizes[Math.floor(Math.random() * prizes.length)],
        winner_count: Math.floor(Math.random() * 3) + 1,
        participants: Math.floor(Math.random() * 500) + 10,
        ...(hasSponsor && {
          sponsor_id: `sponsor_${200000 + sponsorIndex}`,
          sponsor_name: sponsors[sponsorIndex],
          sponsor_avatar: "assets/img/admin-placeholder.png"
        })
      };
    });
  }
}
