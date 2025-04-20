import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {

  transform(value: unknown): string {

    if (typeof value != 'string') {
      return '';
    }

    // HTML-Escape: Potenziell gefährliche Zeichen escapen
    let safeValue: string = this.escapeHtml(value);

    // Markdown-Formatierung anwenden
    return safeValue
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')               // Bold (**)
      .replace(/__(.*?)__/g, '<u>$1</u>')                   // Underline (__)
      .replace(/\*(.*?)\*/g, '<i>$1</i>')                   // Italic (*)
      .replace(/~~(.*?)~~/g, '<s>$1</s>')                   // Strikethrough (~~)
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')               // Headline level 3 (###)
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')                // Headline level 2 (##)
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')                 // Headline level 1 (#)
      .replace(/^#- (.*$)/gm, '<small>$1</small>')          // Smaller text (#-)
      .replace(/&lt;#\d+&gt;/g, '<code>#channel-mention</code>')  // Channel mentions
      .replace(/&lt;@&\d+&gt;/g, '<code>@role-mention</code>')    // Role mentions
      .replace(/&lt;@\d+&gt;/g, '<code>@user-mention</code>');    // User mentions
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
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
  }
}
