import { ConvertTimePipe } from './convert-time.pipe';

describe('ConvertTimePipe', () => {
  it('create an instance', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null, undefined, or NaN input', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
    expect(pipe.transform(NaN as any)).toBe('');
  });

  it('should return "0 Sekunden" for 0 seconds in German', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.transform(0, 'de')).toBe('0 Sekunden');
  });

  it('should return "0 seconds" for 0 seconds in English', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.transform(0, 'en')).toBe('0 seconds');
  });

  it('should convert seconds to largest two German units', () => {
    const pipe = new ConvertTimePipe();
    // 90061 = 1 Tag, 1 Stunde, 1 Minute, 1 Sekunde
    expect(pipe.transform(90061, 'de')).toBe('1 Tag und 1 Stunde');
  });

  it('should convert seconds to largest two English units', () => {
    const pipe = new ConvertTimePipe();
    // 90061 = 1 day, 1 hour, 1 minute, 1 second
    expect(pipe.transform(90061, 'en')).toBe('1 day and 1 hour');
  });

  it('should use plural forms for multiple units', () => {
    const pipe = new ConvertTimePipe();
    // 172800 = 2 Tage
    expect(pipe.transform(172800, 'de')).toBe('2 Tage');
    // 7200 = 2 hours
    expect(pipe.transform(7200, 'en')).toBe('2 hours');
  });

  it('should default to German for unsupported language', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.transform(3600, 'fr')).toBe('1 Stunde');
  });

  it('should handle values just below a unit threshold', () => {
    const pipe = new ConvertTimePipe();
    // 3599 = 59 Minuten und 59 Sekunden
    expect(pipe.transform(3599, 'de')).toBe('59 Minuten und 59 Sekunden');
    // 59 = 59 Sekunden
    expect(pipe.transform(59, 'de')).toBe('59 Sekunden');
  });

  it('should handle values just above a unit threshold', () => {
    const pipe = new ConvertTimePipe();
    // 3601 = 1 Stunde und 1 Sekunde
    expect(pipe.transform(3601, 'de')).toBe('1 Stunde und 1 Sekunde');
    // 3661 = 1 hour and 1 minute
    expect(pipe.transform(3661, 'en')).toBe('1 hour and 1 minute');
  });

  it('should be case-insensitive for language parameter', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.transform(3600, 'EN')).toBe('1 hour');
    expect(pipe.transform(3600, 'De')).toBe('1 Stunde');
  });

  it('should return an empty string for null, undefined, NaN, or negative input', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(null as any)).toBe('');
    expect(pipe.convertToFormattedTime(undefined as any)).toBe('');
    expect(pipe.convertToFormattedTime(NaN as any)).toBe('');
    expect(pipe.convertToFormattedTime(-1)).toBe('');
  });

  it('should return "1y" for 31536000 seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(31536000)).toBe('1y');
  });

  it('should return "2y 3mo" for 2 years and 3 months', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(2 * 31536000 + 3 * 2592000)).toBe('2y 3mo');
  });

  it('should return "1y 2mo 3d 4h 5m 6s" for a complex duration', () => {
    const pipe = new ConvertTimePipe();
    const seconds = 31536000 + 2 * 2592000 + 3 * 86400 + 4 * 3600 + 5 * 60 + 6;
    expect(pipe.convertToFormattedTime(seconds)).toBe('1y 2mo 3d 4h 5m 6s');
  });

  it('should skip zero units and preserve order', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(3600 + 6)).toBe('1h 6s');
  });

  it('should return "59s" for 59 seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(59)).toBe('59s');
  });

  it('should return "1m" for 60 seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(60)).toBe('1m');
  });

  it('should return "1h" for 3600 seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(3600)).toBe('1h');
  });

  it('should return "1d" for 86400 seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(86400)).toBe('1d');
  });

  it('should return "1mo" for 2592000 seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(2592000)).toBe('1mo');
  });

  it('should return "1y" for 31536000 seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToFormattedTime(31536000)).toBe('1y');
  });

  it('should return "0" for empty input', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('')).toBe('0');
  });

  it('should convert only years', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('2y')).toBe((2 * 31536000).toString());
  });

  it('should convert only months', () => {
    const pipe = new ConvertTimePipe();
    const expected = 3 * 2592000;
    const actual = Number(pipe.convertToSeconds('3mo'));
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(300);
  });

  it('should convert only days', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('4d')).toBe((4 * 86400).toString());
  });

  it('should convert only minutes', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('5m')).toBe((5 * 60).toString());
  });

  it('should convert only seconds', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('6s')).toBe('6');
  });

  it('should convert a full duration string', () => {
    const pipe = new ConvertTimePipe();
    const expected = 31536000 + 2 * 2592000 + 3 * 86400 + 4 * 60 + 5;
    const actual = Number(pipe.convertToSeconds('1y 2mo 3d 4m 5s'));
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(300);
  });

  it('should convert a string with all units', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('1y 1mo 1d 1m 1s')).toBe((31536000 + 2592000 + 86400 + 60 + 1).toString());
  });

  it('should ignore missing units and sum only present ones', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('2y 5m')).toBe((2 * 31536000 + 5 * 60).toString());
  });

  it('should handle units in any order', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('5s 2y 4m')).toBe((2 * 31536000 + 4 * 60 + 5).toString());
  });

  it('should return "0" for invalid input', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('invalid')).toBe('0');
  });

  it('should handle multiple digit values for each unit', () => {
    const pipe = new ConvertTimePipe();
    expect(pipe.convertToSeconds('12y 11mo 10d 9m 8s')).toBe((407808668).toString());
  });

});
