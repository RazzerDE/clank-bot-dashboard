import { DatePipe } from './date.pipe';

describe('DatePipe', () => {
  let pipe: DatePipe;

  beforeEach(() => {
    pipe = new DatePipe();
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return formatted date in German when lang is "de"', () => {
    const result = pipe.transform(new Date('2025-06-01T15:56:00'), 'de');
    expect(result).toBe('am Sonntag, 01.06.2025 um 15:56 Uhr');
  });

  it('should return formatted date in English when lang is "en"', () => {
    const result = pipe.transform(new Date('2025-06-01T15:56:00'), 'en');
    expect(result).toBe('on Sunday, 01.06.2025 at 3:56 PM');
  });

  it('should handle string input and return formatted date', () => {
    const result = pipe.transform('2025-06-01T15:56:00', 'de');
    expect(result).toBe('am Sonntag, 01.06.2025 um 15:56 Uhr');
  });

  it('should handle number input and return formatted date', () => {
    const timestamp = new Date('2025-06-01T15:56:00').getTime();
    const result = pipe.transform(timestamp, 'en');
    expect(result).toBe('on Sunday, 01.06.2025 at 3:56 PM');
  });

  it('should return empty string for invalid input', () => {
    const result = pipe.transform(null, 'de');
    expect(result).toBe('');
  });

  it('should default to German formatting when lang is not provided', () => {
    const result = pipe.transform(new Date('2025-06-01T15:56:00'));
    expect(result).toBe('am Sonntag, 01.06.2025 um 15:56 Uhr');
  });

  it('should return "12 AM" for midnight in English', () => {
    const result = pipe.transform(new Date('2025-06-01T00:00:00'), 'en');
    expect(result).toBe('on Sunday, 01.06.2025 at 12:00 AM');
  });

  it('should return "12 PM" for noon in English', () => {
    const result = pipe.transform(new Date('2025-06-01T12:00:00'), 'en');
    expect(result).toBe('on Sunday, 01.06.2025 at 12:00 PM');
  });

  it('should format future minutes in German', () => {
    const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const result = pipe.transform(futureDate, 'de', 'short');
    expect(['in 10 Minuten', 'in 9 Minuten', 'in einer Minute']).toContain(result);
  });

  it('should format future minutes in English', () => {
    const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const result = pipe.transform(futureDate, 'en', 'short');
    expect(['in 10 minutes', 'in 9 minutes', 'in 1 minute']).toContain(result);
  });

  it('should format past minutes in German', () => {
    const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const result = pipe.transform(pastDate, 'de', 'short');
    expect(['vor 10 Minuten', 'vor 9 Minuten', 'vor einer Minute']).toContain(result);
  });

  it('should format past minutes in English', () => {
    const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const result = pipe.transform(pastDate, 'en', 'short');
    expect(['10 minutes ago', '9 minutes ago', '1 minute ago']).toContain(result);
  });

  it('should format future hours correctly', () => {
    const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    const resultDe = pipe.transform(futureDate, 'de', 'short');
    const resultEn = pipe.transform(futureDate, 'en', 'short');
    expect(['in 3 Stunden', 'in 2 Stunden', 'in einer Stunde']).toContain(resultDe);
    expect(['in 3 hours', 'in 2 hours', 'in 1 hour']).toContain(resultEn);
  });

  it('should format past hours correctly', () => {
    const pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const resultDe = pipe.transform(pastDate, 'de', 'short');
    const resultEn = pipe.transform(pastDate, 'en', 'short');
    expect(['vor 3 Stunden', 'vor 2 Stunden', 'vor einer Stunde']).toContain(resultDe);
    expect(['3 hours ago', '2 hours ago', '1 hour ago']).toContain(resultEn);
  });

  it('should format future days correctly', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();
    const resultDe = pipe.transform(futureDate, 'de', 'short');
    const resultEn = pipe.transform(futureDate, 'en', 'short');

    expect(['in 4 Tagen', 'in 3 Tagen', 'in einem Tag']).toContain(resultDe);
    expect(['in 4 days', 'in 3 days', 'in 1 day']).toContain(resultEn);
  });

  it('should format past days correctly', () => {
    const pastDate = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    const resultDe = pipe.transform(pastDate, 'de', 'short');
    const resultEn = pipe.transform(pastDate, 'en', 'short');
    expect(['vor 4 Tagen', 'vor 3 Tagen', 'vor einem Tag']).toContain(resultDe);
    expect(['4 days ago', '3 days ago', '1 day ago']).toContain(resultEn);
  });

  it('should format future months correctly', () => {
    const now = new Date();
    const futureDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate(), 12, 0, 0).toISOString();
    const resultDe = pipe.transform(futureDate, 'de', 'short');
    const resultEn = pipe.transform(futureDate, 'en', 'short');
    expect(['in 3 Monaten', 'in 2 Monaten', 'in einem Monat', 'in 1 Monat', 'in 29 Tagen', 'in 30 Tagen', 'in 31 Tagen']).toContain(resultDe);
    expect(['in 3 months', 'in 2 months', 'in 1 month', 'in 29 days', 'in 30 days', 'in 31 days']).toContain(resultEn);
  });

  it('should format past months correctly', () => {
    const now = new Date();
    const pastDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate(), 12, 0, 0).toISOString();
    const resultDe = pipe.transform(pastDate, 'de', 'short');
    const resultEn = pipe.transform(pastDate, 'en', 'short');
    expect(['vor 3 Monaten', 'vor 2 Monaten', 'vor einem Monat', 'vor 1 Monat', 'vor 29 Tagen', 'vor 30 Tagen', 'vor 31 Tagen']).toContain(resultDe);
    expect(['3 months ago', '2 months ago', '1 month ago', '29 days ago', '30 days ago', '31 days ago']).toContain(resultEn);
  });

  it('should format past years correctly', () => {
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate(), 12, 0, 0).toISOString();
    const resultDe = pipe.transform(pastDate, 'de', 'short');
    const resultEn = pipe.transform(pastDate, 'en', 'short');
    expect(['vor 2 Jahren', 'vor einem Jahr', 'vor 1 Jahr', 'vor 12 Monaten']).toContain(resultDe);
    expect(['2 years ago', '1 year ago', '12 months ago']).toContain(resultEn);
  });

  it('should format singular time units correctly', () => {
    // Test 1 minute
    const oneMinuteDate = new Date(Date.now() + 60 * 1000).toISOString();
    expect(['in einer Minute', 'in 1 Minute']).toContain(pipe.transform(oneMinuteDate, 'de', 'short'));
    expect(['in 1 minute']).toContain(pipe.transform(oneMinuteDate, 'en', 'short'));

    // Test 1 hour
    const oneHourDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(['in einer Stunde', 'in 1 Stunde', 'in 59 Minuten', 'in 60 Minuten']).toContain(pipe.transform(oneHourDate, 'de', 'short'));
    expect(['in 1 hour', 'in 59 minutes', 'in 60 minutes']).toContain(pipe.transform(oneHourDate, 'en', 'short'));

    // Test 1 day
    const oneDayDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(['in einem Tag', 'in 1 Tag', 'in 23 Stunden', 'in 24 Stunden']).toContain(pipe.transform(oneDayDate, 'de', 'short'));
    expect(['in 1 day', 'in 23 hours', 'in 24 hours']).toContain(pipe.transform(oneDayDate, 'en', 'short'));

    // Test 1 month
    const now = new Date();
    const oneMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), 12, 0, 0).toISOString();
    expect(['in einem Monat', 'in 1 Monat', 'in 29 Tagen', 'in 30 Tagen', 'in 31 Tagen']).toContain(pipe.transform(oneMonthDate, 'de', 'short'));
    expect(['in 1 month', 'in 29 days', 'in 30 days', 'in 31 days']).toContain(pipe.transform(oneMonthDate, 'en', 'short'));

    // Test 1 year
    const oneYearDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate(), 12, 0, 0).toISOString();
    expect(['in einem Jahr', 'in 1 Jahr', 'in 12 Monaten']).toContain(pipe.transform(oneYearDate, 'de', 'short'));
    expect(['in 1 year', 'in 12 months']).toContain(pipe.transform(oneYearDate, 'en', 'short'));
  });

  it('should return "12 PM" for noon in English', () => {
    const result = pipe.transform(new Date('2025-06-01T12:00:00'), 'en');
    expect(result).toBe('on Sunday, 01.06.2025 at 12:00 PM');
  });

  it('should return formatted date in German when lang is "de"', () => {
    const result = pipe.transform(new Date('2025-06-01T15:56:00'), 'de');
    expect(result).toBe('am Sonntag, 01.06.2025 um 15:56 Uhr');
  });
});
