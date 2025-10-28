import { describe, it, expect, beforeEach } from 'vitest';
import { parse, toHtml, addIds, resetIdCounter } from '../index';

describe('core-ast', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('parse', () => {
    it('should parse simple HTML', () => {
      const html = '<div>Hello</div>';
      const tree = parse(html);
      expect(tree.type).toBe('root');
      expect(tree.children).toBeDefined();
    });

    it('should parse nested HTML', () => {
      const html = '<div><p>Hello</p></div>';
      const tree = parse(html);
      expect(tree.children.length).toBeGreaterThan(0);
    });
  });

  describe('toHtml', () => {
    it('should convert AST back to HTML', () => {
      const html = '<div>Hello</div>';
      const tree = parse(html);
      const output = toHtml(tree);
      expect(output).toContain('Hello');
      expect(output).toContain('<div>');
    });
  });

  describe('addIds', () => {
    it('should add data-editor-id to elements', () => {
      const html = '<div><p>Hello</p></div>';
      const tree = parse(html);
      const treeWithIds = addIds(tree);
      const output = toHtml(treeWithIds);
      expect(output).toContain('data-editor-id');
    });

    it('should increment IDs for multiple elements', () => {
      const html = '<div></div><p></p>';
      const tree = parse(html);
      const treeWithIds = addIds(tree);
      const output = toHtml(treeWithIds);
      expect(output).toContain('node-0');
      expect(output).toContain('node-1');
    });
  });
});
