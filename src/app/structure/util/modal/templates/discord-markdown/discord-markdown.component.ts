import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {NgOptimizedImage} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../../services/data/data-holder.service";

@Component({
  selector: 'template-discord-markdown',
  imports: [
    MarkdownPipe,
    NgOptimizedImage,
    TranslatePipe
  ],
  templateUrl: './discord-markdown.component.html',
  styleUrl: './discord-markdown.component.scss'
})
export class DiscordMarkdownComponent {
  @Input() type: string = '';
  @Input() content: string = '';

  @ViewChild('faqPreview') faqPreview!: ElementRef<HTMLSpanElement>;
  @ViewChild('ticketPreview') ticketPreview!: ElementRef<HTMLDivElement>;

  constructor(protected dataService: DataHolderService) {
  }
}
