import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {NgOptimizedImage} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";

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
  @Input() faqChecked: boolean = false;
  @Input() type: string = '';
  @Input() content: string = '';

  @ViewChild('faqPreview') faqPreview!: ElementRef<HTMLSpanElement>;
}
