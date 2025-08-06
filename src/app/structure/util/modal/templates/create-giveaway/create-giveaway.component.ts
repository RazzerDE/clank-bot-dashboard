import {AfterContentChecked, AfterViewChecked, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DatePipe, NgClass} from "@angular/common";
import {Giveaway} from "../../../../../services/types/Events";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faTrophy} from "@fortawesome/free-solid-svg-icons";
import {SelectItems} from "../../../../../services/types/Config";
import {SelectComponent} from "../select/select.component";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {ComService} from "../../../../../services/discord-com/com.service";
import {RequirementFieldComponent} from "./req-field/req-field.component";
import {ConvertTimePipe} from "../../../../../pipes/convert-time.pipe";
import {faUser} from "@fortawesome/free-solid-svg-icons";

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
export class CreateGiveawayComponent implements AfterViewChecked, AfterContentChecked {
  private initGiveaway: Giveaway = { creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, prize: '',
                                     channel_id: null, end_date: new Date(Date.now() + 10 * 60 * 6000), winner_count: 1,
                                     participants: 0, start_date: null };
  protected giveaway_reqs: SelectItems[] = this.getGiveawayReqs();
  protected readonly faTrophy: IconDefinition = faTrophy;
  protected readonly faUser: IconDefinition = faUser;
  protected rolesLoading: boolean = false;
  protected readonly today: Date = new Date();
  protected readonly now: Date = new Date(Date.now());
  protected convertTimePipe: ConvertTimePipe = new ConvertTimePipe();

  @Input() type: 'EVENTS_CREATE' | 'EVENTS_EDIT' | 'EVENTS_DESIGN' = 'EVENTS_CREATE';
  @Input() showFirst: boolean = false;
  @Input() giveaway: Giveaway = this.initGiveaway;
  @Input() externalMarkdown: DiscordMarkdownComponent | undefined | null = undefined;
  @Input() event_action: (giveaway: Giveaway) => void = (): void => {};
  @Input() event_edit: (giveaway: Giveaway) => void = (): void => {};

  @ViewChild(DiscordMarkdownComponent) discordMarkdown!: DiscordMarkdownComponent;
  @ViewChild(RequirementFieldComponent) reqField!: RequirementFieldComponent;
  @ViewChild('roleVisible') roleVisible!: ElementRef<HTMLLabelElement>;

  constructor(protected dataService: DataHolderService, private comService: ComService, protected translate: TranslateService) {}

  /**
   * Angular lifecycle hook that is called after every check of the component's content.
   * Checks if the role selection element is visible and roles are not currently loading.
   * If so, triggers loading of guild roles via the data service and sets the loading flag.
   */
  ngAfterContentChecked(): void {
    if (this.roleVisible && this.roleVisible.nativeElement.checkVisibility() && !this.rolesLoading) {
      this.rolesLoading = true; this.dataService.getGuildRoles(this.comService, true);
    }
  }

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
   * Checks if the current giveaway is valid based on its properties.
   *
   * A giveaway is considered invalid if:
   * - The prize is empty or undefined.
   * - The number of winners is less than 1 or greater than 100.
   * - The end date is missing or set to a past date/time.
   * - The channel ID is missing or undefined.
   * - A giveaway requirement was set but has no value
   * - A server recommendation was set but has no valid discord URL
   * - the start date is bigger than the end date
   * - The giveaway requirement is set to a value that requires VIP but the user does not have VIP.
   * - The giveaway prize is empty or undefined.
   *
   * @returns {boolean} `true` if the giveaway is valid, otherwise `false`.
   */
  protected isValidGiveaway(): boolean {
    const hasValidRequirement: boolean = !this.giveaway.gw_req || !this.giveaway.gw_req.includes(': ') ||
      (this.giveaway.gw_req.includes(': ') &&
        ((this.giveaway.gw_req.startsWith('SERVER: ') && this.giveaway.gw_req.includes('://discord.gg/')) ||
          (!this.giveaway.gw_req.startsWith('SERVER: ') && this.giveaway.gw_req.split(': ')[1].trim().length > 0)));

    const hasNoVip: boolean = !this.dataService.has_vip && !!this.giveaway.gw_req && (this.giveaway.gw_req.startsWith('OWN:') ||
      this.giveaway.gw_req.startsWith('MITGLIED:') || this.giveaway.gw_req.startsWith('no_nitro'));

    return !!this.giveaway.prize && this.giveaway.prize.trim().length > 0 &&!!this.giveaway.end_date &&
      !isNaN(new Date(this.giveaway.end_date).getTime()) && new Date(this.giveaway.end_date).getTime() > Date.now() &&
      !!this.giveaway.channel_id && !!this.giveaway.winner_count && this.giveaway.winner_count >= 1 &&
      this.giveaway.winner_count <= 100 && hasValidRequirement && !hasNoVip &&
      (!this.giveaway.start_date || new Date(this.giveaway.start_date).getTime() <= new Date(this.giveaway.end_date).getTime());
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
      this.giveaway.winner_count = 1;
    } else if (value > 99) {
      event.target.value = '99';
      this.giveaway.winner_count = 99;
    }
  }

  /**
   * Handles numeric input by sanitizing the value to contain only digits.
   * This method ensures that the input field accepts only valid numeric characters.
   *
   * @param {InputEvent} event - The input event triggered by the user.
   * @param {boolean} [sponsor] - Optional parameter to indicate if this is related to sponsor giveaways.
   * @param {boolean} [gw_req] - Optional parameter to indicate if this is related to giveaway requirements.
   */
  protected numberInput(event: InputEvent, gw_req?: boolean, sponsor?: boolean): void {
    if (!(event.target instanceof HTMLInputElement)) { return; }
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
    const inputValue: number = Number(event.target.value);
    if ((isNaN(inputValue) || inputValue < 1 || inputValue > 1000) && !sponsor) { event.target.value = '1' }
    else if (sponsor && (isNaN(inputValue) || inputValue < 1)) { event.target.value = ''; this.giveaway.sponsor_id = undefined; return; }

    if (gw_req) {
      const prefix: string = this.giveaway.gw_req?.split(/\d/).shift() || '';
      this.giveaway.gw_req = prefix + event.target.value;
      this.dataService.getGWRequirementValue(this.giveaway.gw_req);
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

  /**
   * Resets the content of the requirement element if no giveaway requirement is set.
   * This ensures that the requirement field is cleared whenever the giveaway requirement changes.
   *
   * @returns {string} The id of the requirement picker element.
   */
  getReqId(): string {
    if (!this.giveaway.gw_req) {
      const reqElement = document.getElementById('req_element') as HTMLSpanElement;
      if (reqElement) { reqElement.innerHTML = ''; }
    }
    return "reqpicker";
  }
}
