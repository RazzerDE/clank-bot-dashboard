import {Component, Input, ViewChild} from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";

@Component({
  selector: 'app-template-faq-answer',
  imports: [
    TranslatePipe,
    DiscordMarkdownComponent
  ],
  templateUrl: './faq-answer.component.html',
  styleUrl: './faq-answer.component.scss'
})
export class FaqAnswerComponent {
  @Input() faqChecked = false;
  @Input() type = '';
  @Input() content = '';

  @ViewChild(DiscordMarkdownComponent) discordMarkdownComponent!: DiscordMarkdownComponent;

}
