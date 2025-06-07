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
});
