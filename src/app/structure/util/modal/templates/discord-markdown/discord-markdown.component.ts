import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {DatePipe, NgClass, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {EmbedConfig} from "../../../../../services/types/Config";
import {Giveaway} from "../../../../../services/types/Events";

@Component({
  selector: 'template-discord-markdown',
  imports: [
    MarkdownPipe,
    NgOptimizedImage,
    TranslatePipe,
    NgClass,
    DatePipe,
    FaIconComponent
  ],
  templateUrl: './discord-markdown.component.html',
  styleUrl: './discord-markdown.component.scss'
})
export class DiscordMarkdownComponent {
  @Input() type: string = '';
  @Input() content: string = '';
  @Input() no_overlay: boolean = false;
  @Input() giveaway: Giveaway | null = null;
  @Input() embed_config: EmbedConfig = { color: '#706fd3', thumbnail: 'https://i.imgur.com/8eajG1v.gif', banner: null,
                                         emoji: this.dataService.getEmojibyId('<a:present:873708141085343764>') }

  // Other Preview Elements
  @ViewChild('faqPreview') faqPreview!: ElementRef<HTMLSpanElement>;
  @ViewChild('ticketPreview') ticketPreview!: ElementRef<HTMLDivElement>;

  // giveaway Preview Eelements
  @ViewChild('prizeElement') prizeElement!: ElementRef<HTMLDivElement>;
  @ViewChild('winnerElement') winnerElement!: ElementRef<HTMLDivElement>;
  @ViewChild('dateElement') dateElement!: ElementRef<HTMLDivElement>;
  @ViewChild('sponsorElement') sponsorElement!: ElementRef<HTMLDivElement>;
  @ViewChild('reqElement') reqElement!: ElementRef<HTMLDivElement>;

  prize_emoji: string = 'diamond_pink.gif'
  protected readonly now: Date = new Date();
  protected readonly faCheck: IconDefinition = faCheck;
  protected invalidImg: boolean = false;

  constructor(protected dataService: DataHolderService, protected translate: TranslateService) {}
}
