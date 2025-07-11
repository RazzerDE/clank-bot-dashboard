import { Component } from '@angular/core';
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faTrashAlt, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {event_cards, EventCard} from "../../../../services/types/Events";
import {Channel, Role} from "../../../../services/types/discord/Guilds";
import {NgClass} from "@angular/common";

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
  styleUrl: './event-effects.component.scss'
})
export class EventEffectsComponent {
  protected readonly faTrashAlt: IconDefinition = faTrashAlt;
  protected readonly faSave: IconDefinition = faSave;

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
    return value !== null && 'id' in value && 'name' in value;
  }
}
