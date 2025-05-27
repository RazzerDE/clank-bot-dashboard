import {Component, Input, ViewChild} from '@angular/core';
import {DiscordMarkdownComponent} from "../discord-markdown/discord-markdown.component";
import {NgClass} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {TicketSnippet} from "../../../../../services/types/Tickets";
import {MarkdownPipe} from "../../../../../pipes/markdown/markdown.pipe";

@Component({
  selector: 'template-snippet-add',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    FormsModule,
    NgClass,
    DiscordMarkdownComponent
  ],
  templateUrl: './snippet-add.component.html',
  styleUrl: './snippet-add.component.scss'
})
export class SnippetAddComponent {
  @Input() type: string = '';
  @Input() showFirst: boolean = false;
  @Input() newSnippet: TicketSnippet = {} as TicketSnippet;
  @Input() externalMarkdown: DiscordMarkdownComponent | undefined | null = undefined;
  @Input() snippet_action: (snippet: TicketSnippet) => void = (): void => {};
  @Input() snippet_edit: (snippet: TicketSnippet) => void = (): void => {};

  @ViewChild(DiscordMarkdownComponent) discordMarkdown!: DiscordMarkdownComponent;
  private markdownPipe: MarkdownPipe = new MarkdownPipe();

  constructor(private translate: TranslateService) {}

  /**
   * Updates the snippet's discord preview based on the input in the text area.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by user input.
   */
  protected updateSnippetPreview(event: KeyboardEvent): void {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    const markdown: DiscordMarkdownComponent = this.discordMarkdown || this.externalMarkdown;

    if (markdown && markdown.ticketPreview) {
      if (!target.value) {
        markdown.ticketPreview.nativeElement.innerHTML = this.translate.instant('PLACEHOLDER_SNIPPET_PREVIEW_DESC');
      } else {
        markdown.ticketPreview.nativeElement.innerHTML = this.markdownPipe.transform(target.value);
      }
    }
  }

  /**
   * Determines whether the current theme configuration is valid for submission.
   *
   * @returns {boolean} Returns true if the theme is INVALID
   */
  protected isSnippetInvalid(): boolean {
    return !(this.newSnippet.name.length > 0 && this.newSnippet.desc.length > 0);
  }

}
