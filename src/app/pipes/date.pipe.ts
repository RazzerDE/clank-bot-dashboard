import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    let date: Date;

    if (typeof value === 'string') {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      return 'Ungültiges Datum';
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days === 1 ? 'gestern' : `vor ${days} Tagen`;
    } else if (hours > 0) {
      return hours === 1 ? 'vor 1 Stunde' : `vor ${hours} Stunden`;
    } else if (minutes > 0) {
      return minutes === 1 ? 'vor 1 Minute' : `vor ${minutes} Minuten`;
    } else {
      return seconds <= 10 ? 'gerade eben' : `vor ${seconds} Sekunden`;
    }
  }

}
