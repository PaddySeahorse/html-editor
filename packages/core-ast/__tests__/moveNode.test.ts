import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseHtml,
  toHtmlSync,
  assignIds,
  buildIndexMaps,
  normalize,
  moveNodeById,
  resetIdCounter,
} from '../src/index.js';

describe('moveNodeById', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it('should move a node to a different position in the same parent', () => {
    const html = '<div><p>1</p><p>2</p><p>3</p></div>';
    let tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const maps = buildIndexMaps(tree);
    const nodeIds = Array.from(maps.byId.keys());

    // Find the div parent
    const divId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'div';
    });

    // Find the first p
    const firstPId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'p';
    });

    if (firstPId && divId) {
      tree = moveNodeById(tree, firstPId, divId, 2);
      const result = toHtmlSync(tree);

      // Node 1 should be moved to the end
      expect(result).toMatch(/<p[^>]*>2<\/p>/);
      expect(result).toMatch(/<p[^>]*>3<\/p>/);
      expect(result).toMatch(/<p[^>]*>1<\/p>/);
      // Verify order: 2, 3, 1
      const indexOf2 = result.indexOf('>2<');
      const indexOf3 = result.indexOf('>3<');
      const indexOf1 = result.lastIndexOf('>1<');
      expect(indexOf2).toBeLessThan(indexOf3);
      expect(indexOf3).toBeLessThan(indexOf1);
    }
  });

  it('should move a node to a different parent', () => {
    const html = '<div><p>Item 1</p><section>Target</section></div>';
    let tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const maps = buildIndexMaps(tree);
    const nodeIds = Array.from(maps.byId.keys());

    const pId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'p';
    });

    const sectionId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'section';
    });

    if (pId && sectionId) {
      tree = moveNodeById(tree, pId, sectionId, 0);
      const result = toHtmlSync(tree);

      // p should now be inside section
      expect(result).toMatch(/<section[^>]*><p[^>]*>Item 1<\/p>Target<\/section>/);
    }
  });

  it('should throw error when node not found', () => {
    const html = '<div><p>Test</p></div>';
    const tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    expect(() => {
      moveNodeById(tree, 'nonexistent-id', 'null', 0);
    }).toThrow();
  });

  it('should preserve other nodes when moving', () => {
    const html = '<div><p>Keep 1</p><article>Keep 2</article></div>';
    let tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const maps = buildIndexMaps(tree);
    const nodeIds = Array.from(maps.byId.keys());

    const divId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'div';
    });

    const pId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'p';
    });

    if (pId && divId) {
      tree = moveNodeById(tree, pId, divId, 1);
      const result = toHtmlSync(tree);

      // All nodes should still exist in the result
      expect(result).toMatch(/<p[^>]*>/);
      expect(result).toMatch(/Keep 1/);
      expect(result).toMatch(/<article[^>]*>/);
      expect(result).toMatch(/Keep 2/);
    }
  });

  it('should handle moving nested elements', () => {
    const html = '<div><article><p>Move me</p></article><section></section></div>';
    let tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const maps = buildIndexMaps(tree);
    const nodeIds = Array.from(maps.byId.keys());

    const pId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'p';
    });

    const sectionId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'section';
    });

    if (pId && sectionId) {
      tree = moveNodeById(tree, pId, sectionId, 0);
      const result = toHtmlSync(tree);

      // Should contain the section with p inside it
      expect(result).toMatch(/<section[^>]*><p[^>]*>Move me<\/p><\/section>/);
      // Article should be empty
      expect(result).toMatch(/<article[^>]*><\/article>/);
    }
  });

  it('should move to root when parentId is null', () => {
    const html = '<div><section><p>Item</p></section></div>';
    let tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const maps = buildIndexMaps(tree);
    const nodeIds = Array.from(maps.byId.keys());

    const pId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'p';
    });

    if (pId) {
      tree = moveNodeById(tree, pId, null, 0);
      const result = toHtmlSync(tree);

      // When moving to root, p should be at the top level
      expect(result).toMatch(/<p[^>]*>Item<\/p>/);
      expect(result).toMatch(/<div[^>]*>/);
      // Section should now be empty
      expect(result).toMatch(/<section[^>]*><\/section>/);
    }
  });

  it('should handle boundary index values', () => {
    const html = '<div><p>1</p><p>2</p><p>3</p></div>';
    let tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const maps = buildIndexMaps(tree);
    const nodeIds = Array.from(maps.byId.keys());

    const divId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'div';
    });

    const firstPId = nodeIds.find((id) => {
      const node = maps.byId.get(id);
      return node?.tagName === 'p';
    });

    if (firstPId && divId) {
      // Move to index beyond current length (should clamp)
      tree = moveNodeById(tree, firstPId, divId, 999);
      const result = toHtmlSync(tree);

      // Should still be valid HTML
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/<p[^>]*>/);
    }
  });
});
