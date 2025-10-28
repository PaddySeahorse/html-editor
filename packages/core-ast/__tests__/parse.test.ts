import { describe, it, expect } from 'vitest';
import { parseHtml } from '../src/parse.js';

describe('parseHtml', () => {
  it('should parse simple HTML', () => {
    const html = '<div>Hello World</div>';
    const tree = parseHtml(html);
    
    expect(tree.type).toBe('root');
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].type).toBe('element');
  });

  it('should parse nested HTML', () => {
    const html = '<div><p>Hello <strong>World</strong></p></div>';
    const tree = parseHtml(html);
    
    expect(tree.type).toBe('root');
    expect(tree.children).toHaveLength(1);
  });

  it('should parse HTML with attributes', () => {
    const html = '<div class="container" id="main">Content</div>';
    const tree = parseHtml(html);
    
    const element = tree.children[0];
    expect(element.type).toBe('element');
    if (element.type === 'element') {
      expect(element.properties?.className).toEqual(['container']);
      expect(element.properties?.id).toBe('main');
    }
  });

  it('should parse multiple root elements', () => {
    const html = '<div>First</div><div>Second</div>';
    const tree = parseHtml(html);
    
    expect(tree.children).toHaveLength(2);
  });

  it('should handle self-closing tags', () => {
    const html = '<img src="test.jpg" /><br />';
    const tree = parseHtml(html);
    
    expect(tree.children).toHaveLength(2);
  });

  it('should preserve whitespace in text nodes', () => {
    const html = '<p>Hello   World</p>';
    const tree = parseHtml(html);
    
    const element = tree.children[0];
    if (element.type === 'element') {
      const textNode = element.children[0];
      if (textNode.type === 'text') {
        expect(textNode.value).toContain('   ');
      }
    }
  });
});
