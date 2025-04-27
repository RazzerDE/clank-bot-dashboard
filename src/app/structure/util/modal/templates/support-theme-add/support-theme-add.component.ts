import {Component, Input, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {SelectComponent} from "../select/select.component";
import {Role} from "../../../../../services/types/discord/Guilds";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {NgClass} from "@angular/common";
import {SupportTheme} from "../../../../../services/types/Tickets";

@Component({
  selector: 'template-support-theme-add',
  imports: [
    FormsModule,
    DiscordMarkdownComponent,
    TranslatePipe,
    SelectComponent,
    NgClass
  ],
  templateUrl: './support-theme-add.component.html',
  styleUrl: './support-theme-add.component.scss'
})
export class SupportThemeAddComponent {
  @Input() showFirst: boolean = false;
  @Input() emojis: string[] = [];
  @Input() type: string = '';
  @Input() discordRoles: Role[] = [];
  @Input() isDefaultMentioned: (role_id: string) => boolean = () => false;
  protected newTheme: SupportTheme = { id: "0", name: '', icon: '🌟', desc: '', faq_answer: '', roles: [], default_roles: [] };
  protected showEmojiPicker: boolean = false;

  @ViewChild(DiscordMarkdownComponent) discordMarkdown!: DiscordMarkdownComponent;
  private markdownPipe: MarkdownPipe = new MarkdownPipe();

  constructor(private translate: TranslateService, protected dataService: DataHolderService) {}

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

  /**
   * Determines whether the current theme configuration is valid for submission.
   *
   * The method evaluates two main cases:
   * 1. Non-FAQ themes: Valid when both name and description fields are populated
   * 2. FAQ themes: Valid when name and description are populated AND FAQ answer content exists
   *
   * @returns {boolean} Returns true if the theme is INVALID
   */
  isThemeInvalid(): boolean {
    if (this.newTheme.name.length > 0 && this.newTheme.desc.length > 0 && !this.dataService.isFAQ) {
      return false; // Non-FAQ Theme
    }

    // FAQ theme (getElementbyId is necessary because @ViewChild and ngModel are bugged)
    const faq_answer: HTMLTextAreaElement = document.getElementById('faq_answer') as HTMLTextAreaElement;
    if (faq_answer) { this.newTheme.faq_answer = faq_answer.value; }

    return !(this.newTheme.name.length > 0 && this.newTheme.desc.length > 0 && (this.dataService.isFAQ && this.newTheme.faq_answer!.length > 0));
  }
}
