import { describe, it, expect } from 'vitest';
import { parseHtml } from '../src/parse.js';
import { toHtmlSync } from '../src/serialize.js';
import { assignIds } from '../src/identity.js';
import { normalize } from '../src/normalize.js';

describe('round-trip stability', () => {
  it('should handle simple div', () => {
    const html = '<div>Hello World</div>';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('Hello World');
    expect(result).toContain('<div');
    expect(result).toContain('</div>');
  });

  it('should handle nested elements', () => {
    const html = '<div><p>Paragraph <strong>bold</strong> text</p></div>';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('Paragraph');
    expect(result).toContain('bold');
    expect(result).toContain('<strong>');
  });

  it('should preserve attributes', () => {
    const html = '<div class="container" id="main" data-test="value">Content</div>';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('class="container"');
    expect(result).toContain('id="main"');
    expect(result).toContain('data-test="value"');
  });

  it('should handle self-closing tags', () => {
    const html = '<img src="test.jpg" alt="Test" /><br />';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('src="test.jpg"');
    expect(result).toContain('alt="Test"');
  });

  it('should handle lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('Item 1');
    expect(result).toContain('Item 2');
  });

  it('should preserve data-id through round-trip', () => {
    const html = '<div><p>Test</p></div>';
    const tree = parseHtml(html);
    assignIds(tree);

    const firstResult = toHtmlSync(tree);
    const tree2 = parseHtml(firstResult);
    const secondResult = toHtmlSync(tree2);

    expect(firstResult).toBe(secondResult);
  });

  it('should handle complex nested structure', () => {
    const html = `
      <div class="wrapper">
        <header>
          <h1>Title</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <main>
          <article>
            <h2>Article Title</h2>
            <p>First paragraph with <strong>bold</strong> and <em>italic</em>.</p>
            <p>Second paragraph.</p>
          </article>
        </main>
        <footer>
          <p>Footer text</p>
        </footer>
      </div>
    `;

    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('wrapper');
    expect(result).toContain('Title');
    expect(result).toContain('Article Title');
    expect(result).toContain('Footer text');
  });

  it('should handle normalized HTML', () => {
    const html = '<div>  <span>Text</span>  </div>';
    const tree = parseHtml(html);
    normalize(tree);

    const result = toHtmlSync(tree);

    expect(result).toContain('Text');
  });

  it('should handle multiple round-trips with normalization', () => {
    const html = '<div><p>Test</p></div>';

    let tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const first = toHtmlSync(tree);

    tree = parseHtml(first);
    normalize(tree);

    const second = toHtmlSync(tree);

    tree = parseHtml(second);
    normalize(tree);

    const third = toHtmlSync(tree);

    expect(second).toBe(third);
  });

  it('should handle special characters', () => {
    const html = '<div>Hello &amp; goodbye &lt;test&gt;</div>';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('&');
    expect(result).toContain('<div>');
  });

  it('should handle empty elements', () => {
    const html = '<div></div><p></p>';
    const tree = parseHtml(html);
    const result = toHtmlSync(tree);

    expect(result).toContain('<div>');
    expect(result).toContain('</div>');
    expect(result).toContain('<p>');
    expect(result).toContain('</p>');
  });
});
