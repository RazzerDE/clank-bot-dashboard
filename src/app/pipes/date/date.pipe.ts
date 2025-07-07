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
   * @param format - Optional format type. If 'short', it returns a relative time format (e.g., "in 7 days").
   * @returns A formatted date string. Returns an empty string if the input value is invalid.
   */
  transform(value: unknown, lang: string = 'de', format?: string): string {
    let date: Date;

    if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      return '';
    }

    // Relative time format ("in 7 days" / "in 7 Tagen")
    if (format === 'short') {
      return this.formatRelativeTime(date, lang);
    }

    return this.formatFullDate(date, lang);
  }

  /**
   * Formats a date as a relative time string (e.g., "in 7 days", "vor 7 Tagen").
   *
   * @param date - The target date to compare with the current time.
   * @param lang - The language code for formatting ('de' for German, 'en' for English).
   * @returns A human-readable relative time string.
   */
  private formatRelativeTime(date: Date, lang: string): string {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const isFuture = diffTime > 0;
    const absDiffTime = Math.abs(diffTime);

    // calc difference in days, hours, and minutes
    const absDiffDays = Math.floor(absDiffTime / (1000 * 3600 * 24));
    const diffHours = Math.floor((absDiffTime % (1000 * 3600 * 24)) / (1000 * 3600));
    const diffMinutes = Math.floor((absDiffTime % (1000 * 3600)) / (1000 * 60)) || 1;

    const diffYears = Math.floor(absDiffDays / 365);
    const remainingDaysAfterYears = absDiffDays % 365;
    const diffMonths = Math.floor(remainingDaysAfterYears / 30);

    let unit: 'year' | 'month' | 'day' | 'hour' | 'minute';
    let value: number;

    if (diffYears > 0) {
      unit = 'year';
      value = diffYears;
    } else if (diffMonths > 0) {
      unit = 'month';
      value = diffMonths;
    } else if (absDiffDays > 0) {
      unit = 'day';
      value = absDiffDays;
    } else if (diffHours > 0) {
      unit = 'hour';
      value = diffHours;
    } else {
      unit = 'minute';
      value = diffMinutes;
    }

    // format text
    const timeText = this.getTimeText(value, unit, lang);

    if (isFuture) {
      return lang === 'de' ? `in ${timeText}` : `in ${timeText}`;
    } else {
      return lang === 'de' ? `vor ${timeText}` : `${timeText} ago`;
    }
  }

  /**
   * Returns the localized time unit string for the given value and unit.
   *
   * @param value - The numeric value of the time difference.
   * @param unit - The time unit ('year', 'month', 'day', 'hour', 'minute').
   * @param lang - The language code for formatting ('de' or 'en').
   * @returns The formatted time unit string.
   */
  private getTimeText(value: number, unit: 'year'|'month'|'day'|'hour'|'minute', lang: string): string {
    const units = {
      year: { de: ['einem Jahr', 'Jahren'], en: ['1 year', 'years'] },
      month: { de: ['einem Monat', 'Monaten'], en: ['1 month', 'months'] },
      day: { de: ['einem Tag', 'Tagen'], en: ['1 day', 'days'] },
      hour: { de: ['einer Stunde', 'Stunden'], en: ['1 hour', 'hours'] },
      minute: { de: ['einer Minute', 'Minuten'], en: ['1 minute', 'minutes'] }
    };

    const langKey = lang === 'de' ? 'de' : 'en';
    return value === 1 ? units[unit][langKey][0] : `${value} ${units[unit][langKey][1]}`;
  }

  /**
   * Formats a date as a full date string, including weekday, date, time, and language-specific formatting.
   *
   * @param date - The date to format.
   * @param lang - The language code for formatting ('de' for German, 'en' for English).
   * @returns The formatted date string.
   */
  private formatFullDate(date: Date, lang: string): string {
    const weekday: string = new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-US', { weekday: 'long' }).format(date);
    const day: string = date.getDate().toString().padStart(2, '0');
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
    const year: number = date.getFullYear();

    let hours: number = date.getHours();
    const minutes: string = date.getMinutes().toString().padStart(2, '0');

    if (lang === 'de') {
      const formattedHours: string = hours.toString().padStart(2, '0');
      return `am ${weekday}, ${day}.${month}.${year} um ${formattedHours}:${minutes} Uhr`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 0 wird zu 12
      return `on ${weekday}, ${day}.${month}.${year} at ${hours}:${minutes} ${period}`;
    }
  }
}
