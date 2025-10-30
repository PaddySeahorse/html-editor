import { describe, it, expect } from 'vitest';
import { parseHtml } from '../src/parse.js';
import { toHtml, toHtmlSync } from '../src/serialize.js';

describe('toHtml', () => {
  it('should serialize simple HTML', async () => {
    const html = '<div>Hello World</div>';
    const tree = parseHtml(html);
    const result = await toHtml(tree);

    expect(result).toContain('Hello World');
    expect(result).toContain('div');
  });

  it('should serialize nested HTML', async () => {
    const html = '<div><p>Hello <strong>World</strong></p></div>';
    const tree = parseHtml(html);
    const result = await toHtml(tree);

    expect(result).toContain('strong');
    expect(result).toContain('World');
  });

  it('should preserve attributes', async () => {
    const html = '<div class="container" id="main">Content</div>';
    const tree = parseHtml(html);
    const result = await toHtml(tree);

    expect(result).toContain('class="container"');
    expect(result).toContain('id="main"');
  });

  it('should format HTML when requested', async () => {
    const html = '<div><p>Test</p></div>';
    const tree = parseHtml(html);
    const result = await toHtml(tree, { format: true });

    expect(result).toContain('\n');
  });

  it('toHtmlSync should work synchronously', () => {
    const html = '<div>Hello World</div>';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('Hello World');
    expect(result).toContain('div');
  });
});
