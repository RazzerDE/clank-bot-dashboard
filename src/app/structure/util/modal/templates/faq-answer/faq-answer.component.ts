import {Component, Input, ViewChild} from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {ModalComponent} from "../../modal.component";
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";

@Component({
  selector: 'template-faq-answer',
  imports: [
    TranslatePipe,
    DiscordMarkdownComponent
  ],
  templateUrl: './faq-answer.component.html',
  styleUrl: './faq-answer.component.scss'
})
export class FaqAnswerComponent {
  @Input() faqChecked: boolean = false;
  @Input() type: string = '';
  @Input() content: string = '';

  @ViewChild(ModalComponent) modalComponent!: ModalComponent;
  @ViewChild(DiscordMarkdownComponent) discordMarkdownComponent!: DiscordMarkdownComponent;

}
