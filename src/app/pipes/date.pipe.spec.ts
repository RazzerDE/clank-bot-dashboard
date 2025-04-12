import { DatePipe } from './date.pipe';

describe('DatePipe', () => {
  let pipe: DatePipe;

  beforeEach(() => {
    pipe = new DatePipe();
  });

  it('should return an empty string for invalid date input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(12345)).toBe('');
  });

  it('should format date in "long" format for German locale', () => {
    const date = new Date('2025-04-01T10:30:00');
    expect(pipe.transform(date, 'long', 'de')).toBe('am 01.04.2025 um 10:30 Uhr');
  });

  it('should format date with 12 PM correctly in English locale', () => {
    const date = new Date('2025-04-01T12:00:00');
    expect(pipe.transform(date, 'long', 'en')).toBe('on 04/01/2025 at 12:00 PM');
  });

  it('should format date in "long" format for English locale', () => {
    const date = new Date('2025-04-01T10:30:00');
    expect(pipe.transform(date, 'long', 'en')).toBe('on 04/01/2025 at 10:30 AM');
  });

  it('should return "gestern" for a date 1 day ago in German locale', () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    expect(pipe.transform(date, undefined, 'de')).toBe('gestern');
  });

  it('should return "yesterday" for a date 1 day ago in English locale', () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    expect(pipe.transform(date, undefined, 'en')).toBe('yesterday');
  });

  it('should return "vor X Tagen" for dates more than 1 day ago in German locale', () => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    expect(pipe.transform(date, undefined, 'de')).toBe('vor 5 Tagen');
  });

  it('should return "X days ago" for dates more than 1 day ago in English locale', () => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    expect(pipe.transform(date, undefined, 'en')).toBe('5 days ago');
  });

  it('should return "vor 1 Stunde" for 1 hour ago in German', () => {
    const pipe = new DatePipe();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    expect(pipe.transform(oneHourAgo, undefined, 'de')).toBe('vor 1 Stunde');
  });

  it('should return "1 hour ago" for 1 hour ago in English', () => {
    const pipe = new DatePipe();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    expect(pipe.transform(oneHourAgo, undefined, 'en')).toBe('1 hour ago');
  });

  it('should return "vor X Stunden" for hours difference in German locale', () => {
    const date = new Date();
    date.setHours(date.getHours() - 3);
    expect(pipe.transform(date, undefined, 'de')).toBe('vor 3 Stunden');
  });

  it('should return "X hours ago" for hours difference in English locale', () => {
    const date = new Date();
    date.setHours(date.getHours() - 3);
    expect(pipe.transform(date, undefined, 'en')).toBe('3 hours ago');
  });

  it('should return "vor 1 Minute" for 1 minute ago in German', () => {
    const pipe = new DatePipe();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 1000);
    expect(pipe.transform(oneHourAgo, undefined, 'de')).toBe('vor 1 Minute');
  });

  it('should return "1 minute ago" for 1 minute ago in English', () => {
    const pipe = new DatePipe();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 1000);
    expect(pipe.transform(oneHourAgo, undefined, 'en')).toBe('1 minute ago');
  });

  it('should return "vor X Minuten" for minutes difference in German locale', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 15);
    expect(pipe.transform(date, undefined, 'de')).toBe('vor 15 Minuten');
  });

  it('should return "X minutes ago" for minutes difference in English locale', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 15);
    expect(pipe.transform(date, undefined, 'en')).toBe('15 minutes ago');
  });

  it('should return "gerade eben" for seconds <= 10 in German locale', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 5);
    expect(pipe.transform(date, undefined, 'de')).toBe('gerade eben');
  });

  it('should return "just now" for seconds <= 10 in English locale', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 5);
    expect(pipe.transform(date, undefined, 'en')).toBe('just now');
  });

  it('should return "vor X Sekunden" for seconds > 10 in German locale', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 20);
    expect(pipe.transform(date, undefined, 'de')).toBe('vor 20 Sekunden');
  });

  it('should return "X seconds ago" for seconds > 10 in English locale', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 20);
    expect(pipe.transform(date, undefined, 'en')).toBe('20 seconds ago');
  });

  it('should handle string date input correctly', () => {
    const dateString = '2025-04-01T10:30:00';
    expect(pipe.transform(dateString, 'long', 'de')).toBe('am 01.04.2025 um 10:30 Uhr');
  });
});
