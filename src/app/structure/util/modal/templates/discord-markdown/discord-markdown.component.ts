import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {DatePipe, NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Giveaway} from "../../../../../services/types/Events";
import {DatePipe as own} from "../../../../../pipes/date/date.pipe";

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
export class DiscordMarkdownComponent {
  @Input() type: string = '';
  @Input() content: string = '';
  @Input() no_overlay: boolean = false;
  @Input() giveaway: Giveaway | null = null;

  // Other Preview Elements
  @ViewChild('faqPreview') faqPreview!: ElementRef<HTMLSpanElement>;
  @ViewChild('ticketPreview') ticketPreview!: ElementRef<HTMLDivElement>;

  // giveaway Preview Eelements
  @ViewChild('reqElement') reqElement!: ElementRef<HTMLDivElement>;

  protected readonly now: Date = new Date();
  protected readonly faCheck: IconDefinition = faCheck;
  protected invalidImg: boolean = false;
  protected ownDatePipe: own = new own();

  constructor(protected dataService: DataHolderService, protected translate: TranslateService) {}

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
}
