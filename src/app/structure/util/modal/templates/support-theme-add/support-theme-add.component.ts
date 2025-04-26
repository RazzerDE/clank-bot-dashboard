import {Component, Input, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ModalComponent} from "../../modal.component";
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {SelectComponent} from "../select/select.component";
import {Role} from "../../../../../services/types/discord/Guilds";

@Component({
  selector: 'template-support-theme-add',
  imports: [
    FormsModule,
    DiscordMarkdownComponent,
    TranslatePipe,
    SelectComponent
  ],
  templateUrl: './support-theme-add.component.html',
  styleUrl: './support-theme-add.component.scss'
})
export class SupportThemeAddComponent {
  @Input() showFirst: boolean = false;
  @Input() faqChecked: boolean = false;
  @Input() emojis: string[] = [];
  @Input() type: string = '';
  @Input() discordRoles: Role[] = [];
  @Input() isDefaultMentioned: (role_id: string) => boolean = () => false;

  protected selectedEmoji: string = '🌟';
  protected showEmojiPicker: boolean = false;

  @ViewChild(ModalComponent) modal!: ModalComponent;
  @ViewChild(DiscordMarkdownComponent) discordMarkdown!: DiscordMarkdownComponent;
  private markdownPipe: MarkdownPipe = new MarkdownPipe();

  constructor(private translate: TranslateService) {}

  /**
   * Updates the FAQ preview with the entered markdown text.
   *
   * @param event - The keyboard event from the textarea input
   */
  updateFAQPreview(event: KeyboardEvent): void {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    if (!target.value) {
      this.discordMarkdown.faqPreview.nativeElement.innerHTML = this.translate.instant('PLACEHOLDER_THEME_PREVIEW_DESC');
    } else {
      this.discordMarkdown.faqPreview.nativeElement.innerHTML = this.markdownPipe.transform(target.value);
    }
  }

}
