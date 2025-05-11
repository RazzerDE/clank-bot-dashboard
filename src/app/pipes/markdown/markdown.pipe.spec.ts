import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    pipe = new MarkdownPipe();
  });

  it('should return empty string for non-string input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(123)).toBe('');
    expect(pipe.transform({})).toBe('');
  });

  it('should escape HTML special characters', () => {
    const input = '<script>alert("xss")</script>';
    const output = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
    expect(pipe.transform(input)).toBe(output);
  });

  it('should format bold markdown (**text**)', () => {
    expect(pipe.transform('**bold**')).toBe('<b>bold</b>');
  });

  it('should format underline markdown (__text__)', () => {
    expect(pipe.transform('__underline__')).toBe('<u>underline</u>');
  });

  it('should format italic markdown (*text*)', () => {
    expect(pipe.transform('*italic*')).toBe('<i>italic</i>');
  });

  it('should format strikethrough markdown (~~text~~)', () => {
    expect(pipe.transform('~~strike~~')).toBe('<s>strike</s>');
  });

  it('should format headline level 3 (### text)', () => {
    expect(pipe.transform('### headline3')).toBe('<h3>headline3</h3>');
  });

  it('should format headline level 2 (## text)', () => {
    expect(pipe.transform('## headline2')).toBe('<h2>headline2</h2>');
  });

  it('should format headline level 1 (# text)', () => {
    expect(pipe.transform('# headline1')).toBe('<h1>headline1</h1>');
  });

  it('should format small text (#- text)', () => {
    expect(pipe.transform('#- small')).toBe('<small>small</small>');
  });

  it('should format channel mentions', () => {
    expect(pipe.transform('<#123456>')).toBe('<code>#channel-mention</code>');
  });

  it('should format role mentions', () => {
    expect(pipe.transform('<@&123456>')).toBe('<code>@role-mention</code>');
  });

  it('should format user mentions', () => {
    expect(pipe.transform('<@123456>')).toBe('<code>@user-mention</code>');
  });

  it('should apply multiple markdown formats in one string', () => {
    const input = '**bold** and *italic* and __underline__ and ~~strike~~';
    const output = '<b>bold</b> and <i>italic</i> and <u>underline</u> and <s>strike</s>';
    expect(pipe.transform(input)).toBe(output);
  });

  it('should call escapeHtml with the input', () => {
    const spy = jest.spyOn(pipe as any, 'escapeHtml');
    pipe.transform('test');
    expect(spy).toHaveBeenCalledWith('test');
  });
});
