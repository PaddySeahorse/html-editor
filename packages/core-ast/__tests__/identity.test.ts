import { describe, it, expect, beforeEach } from 'vitest';
import { parseHtml } from '../src/parse.js';
import { assignIds, buildIndexMaps, findNodeById, resetIdCounter } from '../src/identity.js';

describe('identity', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('assignIds', () => {
    it('should assign data-id to all elements', () => {
      const html = '<div><p>Hello</p><span>World</span></div>';
      const tree = parseHtml(html);
      assignIds(tree);
      
      const div = tree.children[0];
      expect(div.type).toBe('element');
      if (div.type === 'element') {
        expect(div.properties?.dataId).toBeDefined();
        expect(typeof div.properties?.dataId).toBe('string');
        
        const p = div.children[0];
        const span = div.children[1];
        
        if (p.type === 'element') {
          expect(p.properties?.dataId).toBeDefined();
        }
        if (span.type === 'element') {
          expect(span.properties?.dataId).toBeDefined();
        }
      }
    });

    it('should generate unique IDs', () => {
      const html = '<div><p>One</p><p>Two</p></div>';
      const tree = parseHtml(html);
      assignIds(tree);
      
      const div = tree.children[0];
      if (div.type === 'element') {
        const p1 = div.children[0];
        const p2 = div.children[1];
        
        if (p1.type === 'element' && p2.type === 'element') {
          expect(p1.properties?.dataId).not.toBe(p2.properties?.dataId);
        }
      }
    });

    it('should not overwrite existing data-id', () => {
      const html = '<div data-id="custom-id">Content</div>';
      const tree = parseHtml(html);
      assignIds(tree);
      
      const div = tree.children[0];
      if (div.type === 'element') {
        expect(div.properties?.dataId).toBe('custom-id');
      }
    });
  });

  describe('buildIndexMaps', () => {
    it('should build id index', () => {
      const html = '<div><p>Hello</p></div>';
      const tree = parseHtml(html);
      assignIds(tree);
      
      const maps = buildIndexMaps(tree);
      
      expect(maps.byId.size).toBeGreaterThan(0);
    });

    it('should map all elements', () => {
      const html = '<div><p>One</p><p>Two</p></div>';
      const tree = parseHtml(html);
      assignIds(tree);
      
      const maps = buildIndexMaps(tree);
      
      expect(maps.byId.size).toBe(3);
    });
  });

  describe('findNodeById', () => {
    it('should find node by id', () => {
      const html = '<div><p>Target</p></div>';
      const tree = parseHtml(html);
      assignIds(tree);
      
      const div = tree.children[0];
      if (div.type === 'element') {
        const id = div.properties?.dataId as string;
        const found = findNodeById(tree, id);
        
        expect(found).toBe(div);
      }
    });

    it('should return undefined for non-existent id', () => {
      const html = '<div>Content</div>';
      const tree = parseHtml(html);
      assignIds(tree);
      
      const found = findNodeById(tree, 'non-existent-id');
      
      expect(found).toBeUndefined();
    });
  });
});
