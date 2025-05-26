import {Component, Input} from '@angular/core';
import {TicketAnnouncement} from "../../../../../services/types/Tickets";
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {DatePipe, NgClass} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons/faTrashCan";

@Component({
  selector: 'template-ticket-announcement',
  imports: [
    DiscordMarkdownComponent,
    ReactiveFormsModule,
    TranslatePipe,
    NgClass,
    FormsModule,
    DatePipe,
    FaIconComponent
  ],
  templateUrl: './ticket-announcement.component.html',
  styleUrl: './ticket-announcement.component.scss'
})
export class TicketAnnouncementComponent {
  @Input() type: string = '';
  @Input() showFirst: boolean = false;

  @Input() activeAnnounce: TicketAnnouncement = { level: null, description: null, end_date: null };
  protected readonly faChevronDown: IconDefinition = faChevronDown;

  /**
   * Determines whether the current theme configuration is valid for submission.
   *
   * @returns {boolean} Returns true if the theme is INVALID
   */
  protected isAnnounceInvalid(): boolean {
    return this.activeAnnounce.level == null || this.activeAnnounce.description == null;
  }

  protected readonly faTrashCan = faTrashCan;
}
