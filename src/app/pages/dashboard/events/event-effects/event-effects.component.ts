import { Component } from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHashtag, faTrashAlt, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {event_cards, EventCard} from "../../../../services/types/Events";
import {Channel, Role} from "../../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";

@Component({
  selector: 'app-event-effects',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    ReactiveFormsModule,
    TranslatePipe,
    SelectComponent,
    FaIconComponent,
    NgClass,
  ],
  templateUrl: './event-effects.component.html',
  styleUrl: './event-effects.component.scss',
  animations: [
    trigger('zoomAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate('200ms ease-in', style({ transform: 'scale(0)', opacity: 0 }))
      ])
    ])
  ]
})
export class EventEffectsComponent {
  protected readonly faTrashAlt: IconDefinition = faTrashAlt;
  protected readonly faHashtag: IconDefinition = faHashtag;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faSave: IconDefinition = faSave;
  protected activeTab: 'ROLES' | 'CHANNELS' = 'ROLES';

  protected event_cards: EventCard[] = event_cards;

  constructor(protected dataService: DataHolderService) {
    this.dataService.isLoading = false;
  }

  /**
   * Type guard to check if a value is of type `Role`.
   *
   * @param value - The value to check, which can be a SelectItems or a `Role` object.
   * @returns `true` if the value is a `Role` object, otherwise `false`.
   */
  protected isRoleType(value: Role | Channel): value is Role {
    return value !== null && 'hoist' in value && 'color' in value;
  }
}
