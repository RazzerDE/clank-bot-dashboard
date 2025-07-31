import {AfterViewChecked, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {DatePipe, NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Giveaway} from "../../../../../services/types/Events";
import {DatePipe as own} from "../../../../../pipes/date/date.pipe";
import {GlobalChatConfig} from "../../../../../services/types/Misc";

@Component({
  selector: 'template-discord-markdown',
  imports: [
    MarkdownPipe,
    NgOptimizedImage,
    TranslatePipe,
    NgClass,
    FaIconComponent,
    DatePipe,
  ],
  templateUrl: './discord-markdown.component.html',
  styleUrl: './discord-markdown.component.scss'
})
export class DiscordMarkdownComponent implements AfterViewChecked {
  @Input() type: string = '';
  @Input() content: string = '';
  @Input() no_overlay: boolean = false;
  @Input() giveaway: Giveaway | null = null;
  @Input() invalidAvatar: boolean = false;
  @Input() obj: GlobalChatConfig = {} as GlobalChatConfig;
  protected org_giveaway: Giveaway | null = {...this.giveaway} as Giveaway;

  // Other Preview Elements
  @ViewChild('faqPreview') faqPreview!: ElementRef<HTMLSpanElement>;
  @ViewChild('ticketPreview') ticketPreview!: ElementRef<HTMLDivElement>;

  // giveaway Preview Eelements
  @ViewChild('reqElement') reqElement!: ElementRef<HTMLDivElement>;

  protected readonly Number = Number;
  protected readonly now: Date = new Date();
  protected readonly faCheck: IconDefinition = faCheck;
  protected ownDatePipe: own = new own();
  protected giveway_duration: string = '';

  protected invalidServerImg: boolean = false;

  constructor(protected dataService: DataHolderService, protected translate: TranslateService) {}

  /**
   * Angular lifecycle hook that is called after the view has been checked.
   * Checks if the giveaway end date has changed compared to the original reference.
   * If a change is detected, updates the giveaway duration accordingly.
   */
  ngAfterViewChecked(): void {
    if (this.giveaway?.end_date != this.org_giveaway?.end_date) {
      this.getGiveawayDuration();
    }
  }

  /**
   * Returns the appropriate emoji file name based on the giveaway prize content
   *
   * @returns The emoji file name as string
   */
  protected getPrizeEmoji(prize: string): string {
    if (!this.giveaway) { return 'diamond_pink.gif'; }

    const emojiMap: Record<string, string[]> = {
      'ad1.gif': ['classic', 'basic'],
      'nitro_boost.gif': ['nitro'],
      'dsh.png': ['server'],
      'chip.png': ['casino'],
      'banner.gif': ['banner', 'profile', 'avatar'],
      'money.gif': ['paypal', 'money', 'giftcard', 'amazon', 'gutschein', 'paysafecard', 'psc', 'euro', 'dollar', 'guthaben'],
    };

    for (const [emoji, keywords] of Object.entries(emojiMap)) {
      if (keywords.some(keyword => prize.toLowerCase().includes(keyword))) {
        return emoji;
      }
    }

    return 'diamond_pink.gif';
  }

  /**
   * Returns a valid hex color string for Discord embed elements.
   * Accepts a number (converted to hex), a string (used as-is), or null (returns default color).
   *
   * @param color_code - The color code as number, string, or null.
   * @returns The hex color string (e.g. '#706fd3').
   */
  getEventEmbedColor(color_code: number | string | null): string {
    if (!color_code) { return '#706fd3'; } // Default color

    if (typeof color_code === 'number') {
      const hex = color_code.toString(16).padStart(6, '0');
      return `#${hex.toUpperCase()}`;
    }

    return color_code;
  }

  /**
   * Calculates and updates the giveaway duration string based on the current giveaway end date.
   * Uses a timeout to ensure the view is updated after Angular's change detection cycle.
   *
   * If a giveaway exists, transforms the end date using the custom date pipe and current language.
   * If no giveaway is present, sets a default duration string based on the current language.
   * Also updates the original giveaway reference for change tracking.
   */
  getGiveawayDuration(): void {
    setTimeout((): void => {
      this.giveway_duration = this.giveaway ?
        (this.ownDatePipe.transform(this.giveaway.end_date, this.translate.currentLang, 'short')) :
        this.translate.currentLang === 'de' ? 'in 1 Stunde' : 'in 1 hour'

      this.org_giveaway = {...this.giveaway} as Giveaway;
    }, 0);
  }
}
