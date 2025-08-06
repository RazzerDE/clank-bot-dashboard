import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    pipe = new MarkdownPipe();
  });

  it('should return an empty string if the input is an empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return an empty string if the input exceeds 1000 characters', () => {
    const longString = 'a'.repeat(1001);
    expect(pipe.transform(longString)).toBe('');
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

  it('should return the original match for invalid animated emoji ID', () => {
    const input = '<a:emojiName:1>';
    const output = '&lt;a&#058;emojiName&#058;1&gt;';
    jest.spyOn(pipe as any, 'isValidEmojiId').mockReturnValue(false);

    expect(pipe.transform(input)).toBe(output);
  });

  it('should return the original match for invalid static emoji ID', () => {
    const input = '<:emojiName:1>';
    const output = '&lt;&#058;emojiName&#058;1&gt;';
    jest.spyOn(pipe as any, 'isValidEmojiId').mockReturnValue(false);

    expect(pipe.transform(input)).toBe(output);
  });

  it('should call isValidEmojiId for animated emoji', () => {
    const spy = jest.spyOn(pipe as any, 'isValidEmojiId');
    pipe.transform('<a:emojiName:123456>');
    expect(spy).toHaveBeenCalledWith('123456');
  });

  it('should call isValidEmojiId for static emoji', () => {
    const spy = jest.spyOn(pipe as any, 'isValidEmojiId');
    pipe.transform('<:emojiName:123456>');
    expect(spy).toHaveBeenCalledWith('123456');
  });


  it('should return true for valid emoji ID', () => {
    expect(pipe['isValidEmojiId']('123456')).toBe(true);
  });

  it('should return false for emoji ID with non-digit characters', () => {
    expect(pipe['isValidEmojiId']('123abc')).toBe(false);
  });

  it('should return false for an empty emoji ID', () => {
    expect(pipe['isValidEmojiId']('')).toBe(false);
  });

  it('should return false for emoji ID longer than 19 characters', () => {
    expect(pipe['isValidEmojiId']('12345678901234567890')).toBe(false);
  });

  it('should return true for emoji ID with 19 characters', () => {
    expect(pipe['isValidEmojiId']('1234567890123456789')).toBe(true);
  });

  //                      SOME XSS-PREVENTION UNIT-TESTS

  describe('XSS Prevention Tests', () => {
    it('should handle multiple markdown formats while maintaining HTML escaping', () => {
      const input = '**bold** and <script>alert("xss")</script>';
      const output = '<b>bold</b> and &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      expect(pipe.transform(input)).toBe(output);
    });

    it('should escape script tags inside markdown formatting', () => {
      expect(pipe.transform('**<script>alert("xss")</script>**'))
        .toBe('<b>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</b>');
    });

    it('should escape javascript: URLs', () => {
      const input = '[Click me](javascript:alert("XSS"))';
      expect(pipe.transform(input)).not.toContain('javascript:');

      // test with encoded characters
      const inputDecimalEncoded = '[Click me](javascript&#058;alert("XSS"))';
      expect(pipe.transform(inputDecimalEncoded)).not.toContain('javascript&#058');
      expect(pipe.transform(inputDecimalEncoded)).not.toContain('javascript&#0058');

      // test with hex encoded characters
      const inputHexEncoded = '[Click me](javascript&#x3a;alert("XSS"))';
      expect(pipe.transform(inputHexEncoded)).not.toContain('javascript&#x3a');
      expect(pipe.transform(inputHexEncoded)).not.toContain('javascript&#x03a');
    });

    it('should escape event handlers', () => {
      let input = '<div onmouseover="alert(\'XSS\')">Hover me</div>';
      expect(pipe.transform(input)).toBe('&lt;div onmouseover&#061;&quot;alert(&#039;XSS&#039;)&quot;&gt;Hover me&lt;/div&gt;');

      input = '<div onclick="alert(\'XSS\')">Click me</div>';
      expect(pipe.transform(input)).toBe('&lt;div onclick&#061;&quot;alert(&#039;XSS&#039;)&quot;&gt;Click me&lt;/div&gt;');

      input = '<img onload="alert(\'XSS\')" src="image.jpg">';
      expect(pipe.transform(input)).toBe('&lt;img onload&#061;&quot;alert(&#039;XSS&#039;)&quot; src&#061;&quot;image.jpg&quot;&gt;');

      input = '<input onfocus="alert(\'XSS\')" type="text">';
      expect(pipe.transform(input)).toBe('&lt;input onfocus&#061;&quot;alert(&#039;XSS&#039;)&quot; type&#061;&quot;text&quot;&gt;');
    });

    it('should escape data attributes with javascript', () => {
      const input = '<div data-custom="javascript:alert(\'XSS\')">Test</div>';
      expect(pipe.transform(input)).toBe('&lt;div data-custom&#061;&quot;;alert(&#039;XSS&#039;)&quot;&gt;Test&lt;/div&gt;');
    });

    it('should escape base64 encoded scripts', () => {
      const encoded = btoa('<script>alert("XSS")</script>');
      const input = `<img src="data:image/svg+xml;base64,${encoded}">`;
      expect(pipe.transform(input)).not.toContain('<script>');
    });

    it('should escape SVG with embedded script', () => {
      const input = '<svg><script>alert("XSS")</script></svg>';
      expect(pipe.transform(input)).toBe('&lt;svg&gt;&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&lt;/svg&gt;');
    });

    it('should handle iframe injection attempts', () => {
      const input = '<iframe src="javascript:alert(`xss`)"></iframe>';
      expect(pipe.transform(input)).toBe('&lt;iframe src&#061;&quot;;alert(<code>xss</code>)&quot;&gt;&lt;/iframe&gt;');
    });

    it('should escape CSS-based XSS attempts', () => {
      const input = '<div style="background-image: url(' + 'javascript:alert(\'XSS\')' + ')">Test</div>';
      expect(pipe.transform(input)).not.toContain('javascript:alert');
    });

    it('should escape nested HTML attributes', () => {
      const input = '<div a="<img src=x onerror=alert(\'XSS\')>">Test</div>';
      expect(pipe.transform(input)).not.toContain('<img src');
    });

    it('should handle emoji patterns with potential XSS payloads', () => {
      const input = '<:xss:(123" onerror="alert(\'XSS\')")>';
      expect(pipe.transform(input)).not.toContain('onerror=');
    });

    it('should safely handle input with maximum length', () => {
      const longInput = '<script>'.repeat(100);
      expect(pipe.transform(longInput)).toContain('&lt;script&gt;');
      expect(pipe.transform(longInput)).not.toContain('<script>');
    });

    it('should handle null byte injection attempts', () => {
      const input = 'Hello\x00<script>alert("XSS")</script>';
      expect(pipe.transform(input)).not.toContain('<script>');
    });
  });
});
