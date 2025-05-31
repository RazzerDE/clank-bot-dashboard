import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datecustom',
  standalone: true
})
export class DatePipe implements PipeTransform {

  /**
   * Transforms a date value into a formatted string based on the specified language.
   *
   * @param value - The input value to be transformed. Can be a string or a Date object.
   * @param lang - The language code for formatting ('de' for German, 'en' for English). Defaults to 'de'.
   * @returns A formatted date string. Returns an empty string if the input value is invalid.
   */
  transform(value: unknown, lang: string = 'de'): string {
    let date: Date;

    if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      return '';
    }

    // Format weekday
    const weekday: string = new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-US', { weekday: 'long' }).format(date);

    // Format date
    const day: string = date.getDate().toString().padStart(2, '0');
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
    const year: number = date.getFullYear();

    // Format time
    let hours: number = date.getHours();
    const minutes: string = date.getMinutes().toString().padStart(2, '0');

    if (lang === 'de') {  // Donnerstag, 01.06.2025 um 15:56 Uhr
      const formattedHours: string = hours.toString().padStart(2, '0');
      return `${weekday}, ${day}.${month}.${year} um ${formattedHours}:${minutes} Uhr`;
    } else {              // Thursday, 01.06.2025 at 3:56 PM
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 12 AM is 0
      return `${weekday}, ${day}.${month}.${year} at ${hours}:${minutes} ${period}`;
    }
  }
}
