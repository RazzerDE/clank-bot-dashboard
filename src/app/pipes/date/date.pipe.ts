import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date',
  standalone: true
})
export class DatePipe implements PipeTransform {

  transform(value: unknown, format?: string, lang: string = 'de'): string {
    let date: Date;

    if (typeof value === 'string') {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      return '';
    }

    if (format === 'long') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');

      if (lang === 'de') {
        return `am ${day}.${month}.${year} um ${hours}:${minutes} Uhr`;
      } else {
        const hours12 = hours % 12 || 12;
        const amPm = hours < 12 ? 'AM' : 'PM';
        return `on ${month}/${day}/${year} at ${hours12}:${minutes} ${amPm}`;
      }
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      if (lang === 'de') {
        return days === 1 ? 'gestern' : `vor ${days} Tagen`;
      } else {
        return days === 1 ? 'yesterday' : `${days} days ago`;
      }
    } else if (hours > 0) {
      if (lang === 'de') {
        return hours === 1 ? 'vor 1 Stunde' : `vor ${hours} Stunden`;
      } else {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
      }
    } else if (minutes > 0) {
      if (lang === 'de') {
        return minutes === 1 ? 'vor 1 Minute' : `vor ${minutes} Minuten`;
      } else {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
      }
    } else {
      if (lang === 'de') {
        return seconds <= 10 ? 'gerade eben' : `vor ${seconds} Sekunden`;
      } else {
        return seconds <= 10 ? 'just now' : `${seconds} seconds ago`;
      }
    }
  }
}
