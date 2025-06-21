import {AfterViewChecked, Component, Input} from '@angular/core';
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {FormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {DatePipe, NgClass} from "@angular/common";
import {Giveaway} from "../../../../../services/types/Events";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faTrophy} from "@fortawesome/free-solid-svg-icons/faTrophy";
import {SelectItems} from "../../../../../services/types/Config";
import {SelectComponent} from "../select/select.component";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {ComService} from "../../../../../services/discord-com/com.service";

@Component({
  selector: 'template-create-giveaway',
  imports: [
    DiscordMarkdownComponent,
    FormsModule,
    TranslatePipe,
    NgClass,
    FaIconComponent,
    DatePipe,
    SelectComponent
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

  @Input() type: 'EVENTS_CREATE' | 'EVENTS_EDIT' = 'EVENTS_CREATE';
  @Input() showFirst: boolean = false;
  @Input() giveaway: Giveaway = this.initGiveaway;

  constructor(protected dataService: DataHolderService, private comService: ComService) {}

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
   *
   * @returns {boolean} `true` if the giveaway is valid, otherwise `false`.
   */
  protected isValidGiveaway(): boolean {
    const hasValidRequirement: boolean = !this.giveaway.gw_req || !this.giveaway.gw_req.includes(': ') ||
      (this.giveaway.gw_req.includes(': ') &&
        ((this.giveaway.gw_req.startsWith('SERVER: ') && this.giveaway.gw_req.includes('://discord.gg/')) ||
          (!this.giveaway.gw_req.startsWith('SERVER: ') && this.giveaway.gw_req.split(': ')[1].trim().length > 0)));

    return !!this.giveaway.prize && !!this.giveaway.end_date && this.giveaway.end_date.getTime() > Date.now() &&
      !!this.giveaway.channel_id && !!this.giveaway.winner_count && this.giveaway.winner_count >= 1 &&
      this.giveaway.winner_count <= 100 && hasValidRequirement;
  }

  /**
   * Ensures the `winner_count` property of the giveaway is within the valid range.
   * This method is used to sanitize user input and prevent invalid values.
   */
  protected checkWinnerInput(): void {
    if (this.giveaway.winner_count < 1) {
      this.giveaway.winner_count = 1;
    } else if (this.giveaway.winner_count >= 100) {
      this.giveaway.winner_count = 99;
    }
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
