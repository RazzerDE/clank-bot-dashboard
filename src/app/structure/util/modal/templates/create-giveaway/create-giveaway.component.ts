import {AfterViewChecked, Component, Input, ViewChild} from '@angular/core';
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DatePipe, NgClass} from "@angular/common";
import {Giveaway} from "../../../../../services/types/Events";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faTrophy} from "@fortawesome/free-solid-svg-icons/faTrophy";
import {SelectItems} from "../../../../../services/types/Config";
import {SelectComponent} from "../select/select.component";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {ComService} from "../../../../../services/discord-com/com.service";
import {DatePipe as ownDatePipe} from "../../../../../pipes/date/date.pipe";
import {RequirementFieldComponent} from "./req-field/req-field.component";
import {ConvertTimePipe} from "../../../../../pipes/convert-time.pipe";
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";

@Component({
  selector: 'template-create-giveaway',
  imports: [
    DiscordMarkdownComponent,
    FormsModule,
    TranslatePipe,
    NgClass,
    FaIconComponent,
    SelectComponent,
    DatePipe,
    RequirementFieldComponent
  ],
  templateUrl: './create-giveaway.component.html',
  styleUrl: './create-giveaway.component.scss'
})
export class CreateGiveawayComponent implements AfterViewChecked {
  private initGiveaway: Giveaway = { creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, prize: '',
                                     channel_id: null, end_date: new Date(Date.now() + 10 * 60 * 6000), winner_count: 1,
                                     participants: 0 };
  protected giveaway_reqs: SelectItems[] = this.getGiveawayReqs();
  protected readonly faTrophy: IconDefinition = faTrophy;
  protected rolesLoading: boolean = false;
  protected readonly today: Date = new Date();
  private ownDatePipe: ownDatePipe = new ownDatePipe();
  private convertTimePipe: ConvertTimePipe = new ConvertTimePipe();
  private markdownPipe: MarkdownPipe = new MarkdownPipe();

  @Input() type: 'EVENTS_CREATE' | 'EVENTS_EDIT' = 'EVENTS_CREATE';
  @Input() showFirst: boolean = false;
  @Input() giveaway: Giveaway = this.initGiveaway;
  @Input() externalMarkdown: DiscordMarkdownComponent | undefined | null = undefined;
  @ViewChild(DiscordMarkdownComponent) discordMarkdown!: DiscordMarkdownComponent;

  constructor(protected dataService: DataHolderService, private comService: ComService, protected translate: TranslateService) {}

  /**
   * Lifecycle hook that checks if roles need to be fetched based on the current state.
   * If `rolesLoading` is true and the giveaway requirement is set to `ROLE_ID: `,
   * it triggers the fetching of guild roles and disables the loader.
   */
  ngAfterViewChecked(): void {
    if (!this.dataService.isFetching && this.rolesLoading && this.giveaway.gw_req?.startsWith('ROLE_ID: ')) {
      setTimeout((): void => { this.rolesLoading = false }, 0);
    }
  }

  /**
   * Updates the snippet's discord preview based on the input in the text area.
   *
   * @param {KeyboardEvent} type - The type of giveaway being created or edited, e.g., 'PRIZE'.
   * @param {KeyboardEvent} event - The keyboard event triggered by user input.
   * @param {string} [gw_req] - Optional giveaway requirement string to update the preview.
   */
  protected updateGiveawayPreview(type: 'PRIZE'|'WINNERS'|'DATE'|'SPONSOR'|'REQ', event: KeyboardEvent | string,
                                  gw_req?: string): void {
    const value: string = typeof event === 'string' ? event : (event.target as HTMLTextAreaElement)?.value || '';
    const markdown: DiscordMarkdownComponent | undefined | null = this.discordMarkdown || this.externalMarkdown;
    if (!markdown) return;

    switch (type) {
      case 'WINNERS':
        if (markdown.winnerElement) { markdown.winnerElement.nativeElement.innerHTML = value; }
        break;
      case 'SPONSOR':
        if (markdown.sponsorElement) { markdown.sponsorElement.nativeElement.classList.toggle('hidden', !value); }
        break;
      case 'PRIZE':
        if (markdown.prizeElement) {
          this.externalMarkdown!.prize_emoji = this.getPrizeEmoji(value);
          markdown.prizeElement.nativeElement.innerHTML = value.toUpperCase();
        }
        break;
      case 'DATE':
        if (markdown.dateElement) {
          markdown.dateElement.nativeElement.innerHTML =
            this.ownDatePipe.transform(value, this.translate.currentLang, 'short');
        }
        break;
      case 'REQ':
        if (markdown.reqElement) {
          const reqElement: HTMLDivElement = markdown.reqElement.nativeElement;
          if (gw_req === '') { reqElement.innerHTML = ''; return; }
          reqElement.classList.remove('hidden');

          if (gw_req!.startsWith('MSG: ')) {
            reqElement.innerHTML = this.markdownPipe.transform(
              this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_MSG', { count: gw_req!.split(': ')[1] }));

          } else if (gw_req!.startsWith('VOICE: ')) {
            const voiceTime: string = this.convertTimePipe.transform(Number(gw_req!.split(': ')[1]), this.translate.currentLang);
            reqElement.innerHTML = this.markdownPipe.transform(
              this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_VOICE', { voicetime: voiceTime }));

          } else if (gw_req!.startsWith('ROLE_ID: ')) {
            reqElement.innerHTML = this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_ROLE');

          } else if (gw_req!.startsWith('no_nitro')) {
            reqElement.innerHTML = this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_NITRO');

          } else if (gw_req!.startsWith('MITGLIED: ')) {
            const membership: string = this.convertTimePipe.transform(Number(gw_req!.split(': ')[1]), this.translate.currentLang);
            reqElement.innerHTML = this.markdownPipe.transform(
              this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_MEMBER', { membership }));

          } else if (gw_req!.startsWith('OWN: ')) {
            reqElement.innerHTML = this.markdownPipe.transform(gw_req!.split(': ')[1]);

          } else if (gw_req!.startsWith('SERVER: ')) {
            reqElement.innerHTML = this.markdownPipe.transform(
              this.translate.instant('PLACEHOLDER_GIVEAWAY_EMBED_REQUIREMENTS_SERVER',
                { server: gw_req!.split(': ')[1] }));
          }
        }
        break;
    }
  }

  /**
   * Returns the appropriate emoji file name based on the giveaway prize content
   * @returns The emoji file name as string
   */
  protected getPrizeEmoji(prize: string): string {
    if (!this.giveaway) { return 'diamond_pink.gif'; }

    const emojiMap: Record<string, string[]> = {
      'ad1.gif': ['classic', 'basic'],
      'nitro_boost.gif': ['nitro'],
      'DSH.png': ['server'],
      'chip.png': ['casino'],
      'banner.gif': ['banner', 'profile', 'avatar'],
      'money.gif': ['paypal', 'money', 'giftcard', 'amazon', 'gutschein', 'paysafecard', 'psc', 'euro', 'dollar', 'guthaben']
    };

    for (const [emoji, keywords] of Object.entries(emojiMap)) {
      if (keywords.some(keyword => prize.toLowerCase().includes(keyword))) {
        return emoji;
      }
    }

    return 'diamond_pink.gif';
  }

  /**
   * Converts a formatted time string (e\.g\. '1y 1mo 7d 5m 3s') into the total number of seconds as a string\.
   *
   * Supported units:
   *  - y: years \(365 days each\)
   *  - mo: months \(30 days each\)
   *  - d: days
   *  - m: minutes
   *  - s: seconds
   *
   * @param {string} timeInput \- The input string representing the time duration\.
   * @returns {string} The total duration in seconds as a string\.
   */
  protected convertToSeconds(timeInput: string): string {
    const yearMatch = timeInput.match(/(\d+)y/);
    const monthMatch = timeInput.match(/(\d+)mo/);
    const dayMatch = timeInput.match(/(\d+)d/);
    const minuteMatch = timeInput.match(/(\d+)m/);
    const secondMatch = timeInput.match(/(\d+)s/);

    let totalSeconds = 0;

    if (yearMatch) totalSeconds += parseInt(yearMatch[1]) * 31536000; // 365 days
    if (monthMatch) totalSeconds += parseInt(monthMatch[1]) * 2592000; // 30 days
    if (dayMatch) totalSeconds += parseInt(dayMatch[1]) * 86400;
    if (minuteMatch) totalSeconds += parseInt(minuteMatch[1]) * 60;
    if (secondMatch) totalSeconds += parseInt(secondMatch[1]);

    return totalSeconds.toString();
  }

  /**
   * Checks if the current giveaway is valid based on its properties.
   *
   * A giveaway is considered invalid if:
   * - The prize is empty or undefined.
   * - The number of winners is less than 1 or greater than 100.
   * - The end date is missing or set to a past date/time.
   * - The channel ID is missing or undefined.
   * - A giveaway requirement was set but has no value
   * - A server recommendation was set but has no valid discord URL
   *
   * @returns {boolean} `true` if the giveaway is valid, otherwise `false`.
   */
  protected isValidGiveaway(): boolean {
    const hasValidRequirement: boolean = !this.giveaway.gw_req || !this.giveaway.gw_req.includes(': ') ||
      (this.giveaway.gw_req.includes(': ') &&
        ((this.giveaway.gw_req.startsWith('SERVER: ') && this.giveaway.gw_req.includes('://discord.gg/')) ||
          (!this.giveaway.gw_req.startsWith('SERVER: ') && this.giveaway.gw_req.split(': ')[1].trim().length > 0)));

    return !!this.giveaway.prize && !!this.giveaway.end_date && !isNaN(this.giveaway.end_date.getTime())
      && this.giveaway.end_date.getTime() > Date.now() &&
      !!this.giveaway.channel_id && !!this.giveaway.winner_count && this.giveaway.winner_count >= 1 &&
      this.giveaway.winner_count <= 100 && hasValidRequirement;
  }

  /**
   * Ensures the `winner_count` property of the giveaway is within the valid range.
   * This method is used to sanitize user input and prevent invalid values.
   *
   * @param {InputEvent} event - The keyboard event triggered by the user.
   */
  protected checkWinnerInput(event: KeyboardEvent): void {
    if (!(event.target instanceof HTMLInputElement)) { return; }
    let value: number = parseInt(event.target.value.replace(/[^0-9]/g, ''));

    // only allow numbers between 1 and 99
    if (isNaN(value) || value < 1) {
      event.target.value = '1';
    } else if (value > 99) {
      event.target.value = '99';
    }

    this.updateGiveawayPreview('WINNERS', event)
  }

  /**
   * Handles numeric input by sanitizing the value to contain only digits.
   * This method ensures that the input field accepts only valid numeric characters.
   *
   * @param {InputEvent} event - The input event triggered by the user.
   * @param {boolean} [gw_req] - Optional parameter to indicate if this is related to giveaway requirements.
   */
  protected numberInput(event: InputEvent, gw_req?: boolean): void {
    if (!(event.target instanceof HTMLInputElement)) { return; }
    event.target.value = event.target.value.replace(/[^0-9]/g, '');

    if (gw_req) {
      const prefix: string = this.giveaway.gw_req?.split(/\d/).shift() || '';
      this.giveaway.gw_req = prefix + event.target.value;
    }
  }

  /**
   * Updates the giveaway requirement value and triggers role loading if necessary.
   *
   * If the selected requirement is 'ROLE_ID: ', sets the rolesLoading flag to true
   * and fetches the guild roles using the data service.
   *
   * @param value The selected giveaway requirement value.
   */
  protected changeGiveawayReq(value: string): void {
    this.giveaway.gw_req = value;

    if (value === 'ROLE_ID: ') {
      this.rolesLoading = true;
      this.dataService.getGuildRoles(this.comService, true);
    }
  }

  /**
   * Provides the list of available giveaway requirements options.
   * @returns {SelectItems[]} Array of requirement options for selection dropdown.
   */
  private getGiveawayReqs(): SelectItems[] {
    return [
      { value: '', label: 'PLACEHOLDER_EVENT_REQ' },
      { value: 'MSG: ', label: 'PLACEHOLDER_EVENT_REQ_MSG_MODAL' },
      { value: 'VOICE: ', label: 'PLACEHOLDER_EVENT_REQ_VOICE_MODAL' },
      { value: 'ROLE_ID: ', label: 'PLACEHOLDER_EVENT_REQ_ROLE_MODAL' },
      { value: 'no_nitro', label: 'PLACEHOLDER_EVENT_REQ_NO_NITRO_MODAL' },
      { value: 'MITGLIED: ', label: 'PLACEHOLDER_EVENT_REQ_MEMBER_MODAL' },
      { value: 'OWN: ', label: 'PLACEHOLDER_EVENT_REQ_OWN_MODAL' },
      { value: 'SERVER: ', label: 'PLACEHOLDER_EVENT_REQ_SERVER_MODAL' },
    ];
  }
}
