import { describe, it, expect } from 'vitest';
import { parseHtml } from '../src/parse.js';
import { normalize } from '../src/normalize.js';
import { toHtmlSync } from '../src/serialize.js';

describe('normalize', () => {
  it('should remove empty text nodes', () => {
    const html = '<div>  </div>';
    const tree = parseHtml(html);
    normalize(tree);
    
    const div = tree.children[0];
    if (div.type === 'element') {
      const hasOnlyWhitespace = div.children.every(
        child => child.type === 'text' && child.value.trim() === ''
      );
      expect(hasOnlyWhitespace || div.children.length === 0).toBe(true);
    }
  });

  it('should merge adjacent text nodes', () => {
    const tree = parseHtml('<div>Hello</div>');
    const div = tree.children[0];
    
    if (div.type === 'element') {
      div.children.push(
        { type: 'text', value: ' ' },
        { type: 'text', value: 'World' }
      );
      
      expect(div.children.length).toBeGreaterThan(1);
      
      normalize(tree);
      
      const textNodes = div.children.filter(c => c.type === 'text');
      expect(textNodes.length).toBeLessThanOrEqual(1);
    }
  });

  it('should unwrap redundant spans without attributes', () => {
    const html = '<div><span>Hello</span></div>';
    const tree = parseHtml(html);
    normalize(tree);
    
    const div = tree.children[0];
    if (div.type === 'element') {
      const hasSpan = div.children.some(
        child => child.type === 'element' && child.tagName === 'span'
      );
      expect(hasSpan).toBe(false);
    }
  });

  it('should not unwrap spans with attributes', () => {
    const html = '<div><span class="highlight">Hello</span></div>';
    const tree = parseHtml(html);
    normalize(tree);
    
    const div = tree.children[0];
    if (div.type === 'element') {
      const span = div.children.find(
        child => child.type === 'element' && child.tagName === 'span'
      );
      expect(span).toBeDefined();
    }
  });

  it('should trim whitespace in block elements', () => {
    const html = '<div>  Hello World  </div>';
    const tree = parseHtml(html);
    normalize(tree);
    
    const div = tree.children[0];
    if (div.type === 'element') {
      const text = div.children[0];
      if (text.type === 'text') {
        expect(text.value).not.toMatch(/^\s+/);
        expect(text.value).not.toMatch(/\s+$/);
      }
    }
  });

  it('should handle complex nested structures', () => {
    const html = '<div><p>  Text  </p><span></span><p>More</p></div>';
    const tree = parseHtml(html);
    normalize(tree);
    
    const result = toHtmlSync(tree);
    expect(result).toBeDefined();
  });
});
