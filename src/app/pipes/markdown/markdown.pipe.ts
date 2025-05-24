import { Pipe, PipeTransform } from '@angular/core';

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
      .replace(/\n/g, '<br />')                                       // Line break (\n\n)
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')                         // Bold (**)
      .replace(/__(.*?)__/g, '<u>$1</u>')                             // Underline (__)
      .replace(/\*(.*?)\*/g, '<i>$1</i>')                             // Italic (*)
      .replace(/~~(.*?)~~/g, '<s>$1</s>')                             // Strikethrough (~~)
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')                         // Headline level 3 (###)
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')                          // Headline level 2 (##)
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')                           // Headline level 1 (#)
      .replace(/^#- (.*$)/gm, '<small>$1</small>')                    // Smaller text (#-)
      .replace(/(^|<br \/>)(\s*)&gt;/g, '$1  $2')                 // Blockquote escape (>)
      .replace(/&lt;#\d+&gt;/g, '<code>#channel-mention</code>')      // Channel mentions
      .replace(/&lt;@&amp;\d+&gt;/g, '<code>@role-mention</code>')    // Role mentions
      .replace(/&lt;@\d+&gt;/g, '<code>@user-mention</code>')         // User mentions
      .replace(/`([^`]+)`/g, '<code>$1</code>')                       // Inline-Code (`code`)

      // (animated) discord guild emoji
      .replace(/&lt;a:(.*?):([\d]+)&gt;/g, (match, name, id) => {
        return this.isValidEmojiId(id) ?
          `<img src="https://cdn.discordapp.com/emojis/${id}.gif?size=24" width="22" height="22" class="inline-block" alt="${name}">` :
          match;
      })
      .replace(/&lt;:(.*?):([\d]+)&gt;/g, (match, name, id) => {
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

    // remove potential XSS attack vectors
    return text.replace(/[&<>"':=]/g, (match) => htmlEscapes[match])
      .replace(/javascript&#0*58|javascript&#x0*3a/gi, '')
      .replace(/data:/gi, '')
      .replace(/onerror\s*=/gi, '')
      .replace(/onclick\s*=/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onmouseover\s*=/gi, '')
      .replace(/onfocus\s*=/gi, '')
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
