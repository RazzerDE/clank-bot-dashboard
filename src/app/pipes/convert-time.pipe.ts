import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertTime'
})
export class ConvertTimePipe implements PipeTransform {

  /**
   * Converts a given number of seconds into a human-readable format.
   *
   * The function supports two languages: German ('de') and English ('en').
   * It returns the time in the form of the largest two units (e.g., "1 day and 2 hours").
   * If the input value is invalid (null, undefined, or not a number), it returns an empty string.
   *
   * @param value - The number of seconds to convert.
   * @param lang - The language for the output ('de' for German, 'en' for English). Defaults to 'de'.
   * @returns A string representing the time in a human-readable format.
   */
  transform(value: number, lang: string = 'de'): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '';
    }

    const parts: string[] = [];
    let remainingSeconds: number = value;
    const validLang: string = ['de', 'en'].includes(lang.toLowerCase()) ? lang.toLowerCase() : 'de';
    const units = ConvertTimePipe.UNITS_MAP[['de', 'en'].includes(lang.toLowerCase()) ? lang.toLowerCase() : 'de'];

    for (const unit of units) {
      const count: number = Math.floor(remainingSeconds / unit.value);
      if (count > 0) {
        parts.push(`${count} ${count === 1 ? unit.singular : unit.plural}`);
        remainingSeconds %= unit.value;

        if (parts.length >= 2) break;  // Limit to two parts (e.g. "1 day and 2 hours")
      }
    }

    if (parts.length === 0) { return validLang === 'de' ? '0 Sekunden' : '0 seconds'; }
    return parts.length === 1 ? parts[0] : `${parts[0]} ${validLang === 'de' ? 'und' : 'and'} ${parts[1]}`;
  }

  /**
   * A static map defining time units and their corresponding values, singular, and plural forms
   * for supported languages ('de' for German and 'en' for English).
   *
   * Each unit is represented as an object containing:
   * - `value`: The number of seconds the unit represents.
   * - `singular`: The singular form of the unit.
   * - `plural`: The plural form of the unit.
   */
  private static readonly UNITS_MAP: Record<string, { value: number; singular: string; plural: string }[]> = {
    de: [
      { value: 31536000, singular: 'Jahr', plural: 'Jahre' },
      { value: 2592000, singular: 'Monat', plural: 'Monate' },
      { value: 604800, singular: 'Woche', plural: 'Wochen' },
      { value: 86400, singular: 'Tag', plural: 'Tage' },
      { value: 3600, singular: 'Stunde', plural: 'Stunden' },
      { value: 60, singular: 'Minute', plural: 'Minuten' },
      { value: 1, singular: 'Sekunde', plural: 'Sekunden' }
    ],
    en: [
      { value: 31536000, singular: 'year', plural: 'years' },
      { value: 2592000, singular: 'month', plural: 'months' },
      { value: 604800, singular: 'week', plural: 'weeks' },
      { value: 86400, singular: 'day', plural: 'days' },
      { value: 3600, singular: 'hour', plural: 'hours' },
      { value: 60, singular: 'minute', plural: 'minutes' },
      { value: 1, singular: 'second', plural: 'seconds' }
    ]
  };

}
