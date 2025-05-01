import {Component, HostListener, Input, OnDestroy, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";
import {SelectComponent} from "../select/select.component";
import {Emoji, Role} from "../../../../../services/types/discord/Guilds";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {SupportTheme} from "../../../../../services/types/Tickets";
import {ApiService} from "../../../../../services/api/api.service";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'template-support-theme-add',
  imports: [
    FormsModule,
    DiscordMarkdownComponent,
    TranslatePipe,
    SelectComponent,
    NgClass,
    NgOptimizedImage
  ],
  templateUrl: './support-theme-add.component.html',
  styleUrl: './support-theme-add.component.scss'
})
export class SupportThemeAddComponent implements OnDestroy {
  @Input() showFirst: boolean = false;
  @Input() emojis: Emoji[] | string[] = [];
  @Input() type: string = '';
  @Input() discordRoles: Role[] = [];
  @Input() isDefaultMentioned: (role_id: string) => boolean = () => false;
  protected newTheme: SupportTheme = { id: "0", name: '', icon: '🌟', desc: '', faq_answer: '', roles: [], default_roles: [],
                                       guild_id: this.dataService.active_guild!.id, pending: true };
  private initTheme: SupportTheme = this.newTheme;
  protected showEmojiPicker: boolean = false;
  private subscriptions: Subscription[] = [];

  @ViewChild(DiscordMarkdownComponent) discordMarkdown!: DiscordMarkdownComponent;
  private markdownPipe: MarkdownPipe = new MarkdownPipe();

  constructor(private translate: TranslateService, protected dataService: DataHolderService,
              private apiService: ApiService) {}

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }


  /**
   * Creates a new support theme by sending it to the API.
   *
   * This method sends the provided theme to the server via the API service,
   * handles the response or any potential errors, and updates the UI accordingly.
   * On success, it adds the new theme to the displayed themes list and sorts them.
   * On error, it displays an appropriate error message based on the error type.
   *
   * @param {SupportTheme} theme - The support theme object to be created
   */
  protected addSupportTheme(theme: SupportTheme): void {
    const sent_theme: Subscription = this.apiService.createSupportTheme(theme, this.dataService.active_guild!.id)
      .subscribe({
        next: (_data: any): void => {
          this.dataService.error_color = 'green';
          this.dataService.showAlert(this.translate.instant('SUCCESS_THEME_CREATION_TITLE'),
            this.translate.instant('SUCCESS_THEME_CREATION_DESC', { name: theme.name }));

          // update shown data
          this.dataService.support_themes.push(theme);
          this.dataService.support_themes.sort((a: SupportTheme, b: SupportTheme): number => a.name.localeCompare(b.name));
          this.newTheme = this.initTheme;
          this.hideModal();
          },
        error: (error: HttpErrorResponse): void => {
          this.dataService.error_color = 'red';

          if (error.status === 409) { // already pending/exist
            this.dataService.showAlert(this.translate.instant('ERROR_THEME_CREATION_CONFLICT'),
              this.translate.instant('ERROR_THEME_CREATION_CONFLICT_DESC', { name: theme.name }));
          } else {
            this.dataService.showAlert(this.translate.instant('ERROR_UNKNOWN_TITLE'), this.translate.instant('ERROR_UNKNOWN_DESC'));
            this.newTheme = this.initTheme;
          }

          this.hideModal();
        }
      });

    this.subscriptions.push(sent_theme);
  }

  /**
   * Hides the modal by removing the `hidden` class from the backdrop and modal elements.
   * This method makes the modal and its backdrop visible again.
   */
  hideModal(): void {
    const backdrop: HTMLDivElement = document.getElementById('modal_backdrop') as HTMLDivElement;
    const modal: HTMLDivElement = document.getElementById('modal_container') as HTMLDivElement;

    backdrop.classList.add('hidden');
    modal.classList.add('hidden');
  }

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
   * Type guard to determine if an object is of type Emoji rather than string.
   *
   * This function checks if the provided object has an 'id' property defined,
   * which indicates it's an Emoji object rather than a plain string.
   *
   * @param {Emoji | string} obj - The object to check, which could be either an Emoji or a string
   * @returns {boolean} True if the object is an Emoji, false if it's a string
   */
  isEmojiType(obj: Emoji | string): obj is Emoji {
    return (obj as Emoji).id !== undefined;
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

  /**
   * Updates the theme's icon with the selected Discord emoji.
   *
   * @param {Emoji} emoji - The Discord emoji object that was selected by the user
   */
  updateThemeIcon(emoji: Emoji): void {
    this.newTheme.icon = this.dataService.getEmojibyId(emoji.id, true, emoji.animated);
    this.newTheme.guild_id = this.dataService.active_guild!.id;
    this.showEmojiPicker = false;
  }

  /**
   * Listens for any click event on the document.
   *
   * This method is used to hide the emoji picker when:
   * - An emoji is selected (the picker is open and a click occurs)
   * - The user clicks outside the emoji picker
   */
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.showEmojiPicker) {
      this.showEmojiPicker = false;
    }
  }
}
