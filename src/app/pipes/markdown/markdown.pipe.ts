import { Pipe, PipeTransform } from '@angular/core';
import sanitizeHtml from 'sanitize-html';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {

  transform(value: unknown): string {
    if (typeof value != 'string') { return ''; }
    if (value.length === 0 || value.length > 1000) { return ''; }

    // HTML-Escape: escape potential XSS attacks
    let safeValue: string = this.escapeHtml(value);

    // apply discord markdown
    return safeValue
      .replaceAll(/\n/g, '<br />')                                       // Line break (\n\n)
      .replaceAll(/\*\*(.*?)\*\*/g, '<b>$1</b>')                         // Bold (**)
      .replaceAll(/__(.*?)__/g, '<u>$1</u>')                             // Underline (__)
      .replaceAll(/\*(.*?)\*/g, '<i>$1</i>')                             // Italic (*)
      .replaceAll(/~~(.*?)~~/g, '<s>$1</s>')                             // Strikethrough (~~)
      .replaceAll(/^### (.*$)/gm, '<h3>$1</h3>')                         // Headline level 3 (###)
      .replaceAll(/^## (.*$)/gm, '<h2>$1</h2>')                          // Headline level 2 (##)
      .replaceAll(/^# (.*$)/gm, '<h1>$1</h1>')                           // Headline level 1 (#)
      .replaceAll(/^#- (.*$)/gm, '<small>$1</small>')                    // Smaller text (#-)
      .replaceAll(/(^|<br \/>)(\s*)&gt;/g, '$1  $2')                 // Blockquote escape (>)
      .replaceAll(/&lt;#\d+&gt;/g, '<code>#channel-mention</code>')      // Channel mentions
      .replaceAll(/&lt;@&amp;\d+&gt;/g, '<code>@role-mention</code>')    // Role mentions
      .replaceAll(/&lt;@\d+&gt;/g, '<code>@user-mention</code>')         // User mentions
      .replaceAll(/`([^`]+)`/g, '<code>$1</code>')                       // Inline-Code (`code`)

      // (animated) discord guild emoji
      .replaceAll(/&lt;a:(.*?):([\d]+)&gt;/g, (match, name, id) => {
        return this.isValidEmojiId(id) ?
          `<img src="https://cdn.discordapp.com/emojis/${id}.gif?size=24" width="22" height="22" class="inline-block" alt="${name}">` :
          match;
      })
      .replaceAll(/&lt;:(.*?):([\d]+)&gt;/g, (match, name, id) => {
        return this.isValidEmojiId(id) ?
          `<img src="https://cdn.discordapp.com/emojis/${id}.png?size=24" width="22" height="22" class="inline-block" alt="${name}">` :
          match;
      });
  }

  /**
   * Escape HTML special characters to prevent XSS attacks.
   * @param text The text to escape.
   * @returns The escaped text.
   */
  private escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      ':': '&#058;',
      '=': '&#061;',
    };

    // Escape special characters
    text = text.replace(/[&<>"':=]/g, (match) => htmlEscapes[match])

    // Sanitize HTML to remove any tags and attributes
    return sanitizeHtml(text, {
      allowedTags: [], // Disallow all HTML tags
      allowedAttributes: {}, // Disallow all attributes
      disallowedTagsMode: 'escape', // Escape disallowed tags instead of removing them
    }).replaceAll(/javascript&#0*58|javascript&#x0*3a|javascript:/gi, '')
      .replaceAll(/data:/gi, '')
      .replaceAll(/vbscript:/gi, '')
      .replaceAll(/onerror\s*=/gi, '')
      .replaceAll(/onclick\s*=/gi, '')
      .replaceAll(/onload\s*=/gi, '')
      .replaceAll(/onmouseover\s*=/gi, '')
      .replaceAll(/onfocus\s*=/gi, '');
  }

  /**
   * Validates an emoji ID to ensure it contains only digits.
   * @param id The emoji ID to validate.
   * @returns true if the ID is valid.
   */
  private isValidEmojiId(id: string): boolean {
    return /^\d+$/.test(id) && id.length > 0 && id.length < 20;
  }
}
