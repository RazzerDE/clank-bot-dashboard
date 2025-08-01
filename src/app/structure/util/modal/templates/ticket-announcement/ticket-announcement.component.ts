import {Component, Input, ViewChild} from '@angular/core';
import {TicketAnnouncement} from "../../../../../services/types/Tickets";
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DatePipe, NgClass} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {ApiService} from "../../../../../services/api/api.service";

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

  @ViewChild(DiscordMarkdownComponent) markdownComponent!: DiscordMarkdownComponent;
  @Input() activeAnnounce: TicketAnnouncement = { level: null, description: null, end_date: null };
  @Input() org_activeAnnounce: TicketAnnouncement = { level: null, description: null, end_date: null };
  protected readonly faChevronDown: IconDefinition = faChevronDown;
  protected readonly faTrashCan: IconDefinition = faTrashCan;
  protected readonly today: Date = new Date();
  protected readonly JSON = JSON;

  constructor(protected dataService: DataHolderService, private apiService: ApiService, private translate: TranslateService) {}

  /**
   * Submits the current ticket announcement to the server.
   *
   * It sends the announcement to the server using the `apiService`.
   * On success, it updates the local storage and displays a success message. On failure, it shows
   * an error message to the user.
   *
   * @returns {void}
   */
  submitAnnouncement(): void {
    if (!this.dataService.active_guild) { return; }
    if (this.activeAnnounce.end_date === '') {
      this.activeAnnounce.end_date = null; // Reset end date if empty
    } else if (this.activeAnnounce.end_date) {
      this.activeAnnounce.end_date = new Date(this.activeAnnounce.end_date).toISOString();  // respect timezone
    }

    let sub: Subscription | null = null;
    sub = this.apiService.setAnnouncement(this.activeAnnounce, this.dataService.active_guild.id)
      .subscribe({
        next: (_data: any): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_ANNOUNCEMENT_SET_TITLE'),
            this.translate.instant('SUCCESS_ANNOUNCEMENT_SET_DESC', { date: this.formatEndDate() }));

          this.org_activeAnnounce = { ...this.activeAnnounce };
          localStorage.setItem('ticket_announcement', JSON.stringify(this.activeAnnounce));
          this.hideModal();
          if (sub) { sub.unsubscribe(); }
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';
          if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }
          this.hideModal();
          if (sub) { sub.unsubscribe(); }
        }
      });
  }

  /**
   * Deletes the current ticket announcement from the server.
   *
   * This method sends a request to delete the announcement associated with the active guild.
   * On success, it resets the local announcement data, updates the local storage, and displays
   * a success message. On failure, it handles the error by showing an appropriate error message.
   *
   * @returns {void}
   */
  deleteAnnouncement(): void {
    if (!this.dataService.active_guild) { return; }

    let sub1: Subscription | null = null;
    sub1 = this.apiService.deleteAnnouncement(this.dataService.active_guild.id)
      .subscribe({
        next: (_data: any): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_ANNOUNCEMENT_DELETE_TITLE'),
            this.translate.instant('SUCCESS_ANNOUNCEMENT_DELETE_DESC'));

          this.activeAnnounce.level = null;
          this.activeAnnounce.description = null;
          this.activeAnnounce.end_date = null;

          this.org_activeAnnounce = { ...this.activeAnnounce };
          localStorage.setItem('ticket_announcement', JSON.stringify(this.activeAnnounce));
          this.hideModal();
          if (sub1) { sub1.unsubscribe(); }
        },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';
          if (sub1) { sub1.unsubscribe(); }
          if (error.status == 429) {
            this.dataService.redirectLoginError('REQUESTS');
            return;
          } else if (error.status == 404) {
            this.dataService.showAlert(this.translate.instant('ERROR_ANNOUNCEMENT_NOT_FOUND_TITLE'),
              this.translate.instant('ERROR_ANNOUNCEMENT_NOT_FOUND_DESC'));

            this.activeAnnounce.level = null;
            this.activeAnnounce.description = null;
            this.activeAnnounce.end_date = null;
            localStorage.setItem('ticket_announcement', JSON.stringify(this.activeAnnounce));
          } else {
            this.dataService.redirectLoginError('UNKNOWN');
          }
          this.hideModal();
        }
      });
  }

  /**
   * Determines whether the current theme configuration is valid for submission.
   *
   * @returns {boolean} Returns true if the theme is INVALID
   */
  protected isAnnounceInvalid(): boolean {
    return this.activeAnnounce.level == null || this.activeAnnounce.description == null ||
      this.activeAnnounce.description.trim().length === 0;
  }

  /**
   * Hides the modal by removing the `hidden` class from the backdrop and modal elements.
   * This method makes the modal and its backdrop visible again.
   */
  private hideModal(): void {
    const backdrop: HTMLDivElement = document.getElementById('modal_backdrop') as HTMLDivElement;
    const modal: HTMLDivElement = document.getElementById('modal_container') as HTMLDivElement;

    backdrop.classList.add('hidden');
    modal.classList.add('hidden');
  }

  /**
   * Formats the `end_date` of the active announcement into a localized string.
   *
   * `DE`: formatted as `DD.MM.YYYY, HH:mm Uhr`.
   * <br />
   * `EN`: formatted as `MM/DD/YYYY, HH:mm AM/PM`.
   *
   * @returns {string} The formatted date string or a placeholder for "Never".
   */
  private formatEndDate(): string {
    if (this.activeAnnounce.end_date == null) {
      return this.translate.instant('PLACEHOLDER_NEVER');
    }

    const date: Date = new Date(this.activeAnnounce.end_date);
    const locale: 'de-DE' | 'en-US' = this.translate.currentLang === 'de' ? 'de-DE' : 'en-US';

    if (locale === 'de-DE') {
      const formattedDate: string = date.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'});
      return `${formattedDate}, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} Uhr`;
    } else {
      const formattedDate: string = date.toLocaleDateString('en-US', {day: '2-digit', month: '2-digit', year: 'numeric'});

      const hours: number = date.getHours() % 12;
      const period: 'PM' | 'AM' = date.getHours() >= 12 ? 'PM' : 'AM';
      return `${formattedDate}, ${hours}:${date.getMinutes().toString().padStart(2, '0')} ${period}`;
    }
  }

  /**
   * Updates the preview of the ticket announcement based on the selected level.
   *
   * Sets the preview border color and icon according to the selected announcement level.
   * Level 1: Green (default), Level 2: Orange, Level 3: Red.
   * Updates the preview elements in the DOM to reflect the current selection.
   *
   * @param {Event} event - The change event from the level select input.
   * @returns {void}
   */
  changeAnnouncementPreview(event: Event): void {
    if (!event.target) { return; }
    let color: number = 0x2cbf68;
    let icon: string = 'assets/img/icons/green_mark.gif'
    const value: number = parseInt((event.target as HTMLSelectElement).value, 10);
    this.activeAnnounce.level = value;

    switch (value) {
      case 2:
        color = 0xf98928; // Orange
        icon = 'assets/img/icons/orange_mark.png';
        break;
      case 3:
        color = 0xd04130; // Red
        icon = 'assets/img/icons/alarm.gif';
        break;
    }

    const previewElement: HTMLDivElement = document.getElementById('previewBorderColor') as HTMLDivElement;
    const previewIconElement: HTMLImageElement = document.getElementById('previewIcon') as HTMLImageElement;
    if (previewElement && previewIconElement) {
      previewElement.style.backgroundColor = `#${color.toString(16).padStart(6, '0')}`;
      setTimeout((): void => { previewIconElement.src = icon; }, 10);
    }
  }
}
