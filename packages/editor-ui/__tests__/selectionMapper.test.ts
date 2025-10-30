import { describe, it, expect } from 'vitest';
import {
  offsetToLineColumn,
  lineColumnToOffset,
  getNodeRange,
} from '../src/utils/selectionMapper.js';
import { parseHtml, assignIds, buildIndexMaps, resetIdCounter } from '@html-editor/core-ast';

describe('selectionMapper', () => {
  describe('offsetToLineColumn', () => {
    it('should convert offset to line and column', () => {
      const content = 'Hello\nWorld\nTest';

      expect(offsetToLineColumn(content, 0)).toEqual({ line: 1, column: 1 });
      expect(offsetToLineColumn(content, 5)).toEqual({ line: 1, column: 6 });
      expect(offsetToLineColumn(content, 6)).toEqual({ line: 2, column: 1 });
      expect(offsetToLineColumn(content, 11)).toEqual({ line: 2, column: 6 });
      expect(offsetToLineColumn(content, 12)).toEqual({ line: 3, column: 1 });
    });

    it('should handle empty content', () => {
      expect(offsetToLineColumn('', 0)).toEqual({ line: 1, column: 1 });
    });
  });

  describe('lineColumnToOffset', () => {
    it('should convert line and column to offset', () => {
      const content = 'Hello\nWorld\nTest';

      expect(lineColumnToOffset(content, 1, 1)).toBe(0);
      expect(lineColumnToOffset(content, 1, 6)).toBe(5);
      expect(lineColumnToOffset(content, 2, 1)).toBe(6);
      expect(lineColumnToOffset(content, 2, 6)).toBe(11);
      expect(lineColumnToOffset(content, 3, 1)).toBe(12);
    });

    it('should handle positions beyond line length', () => {
      const content = 'Hi\nBye';
      const offset = lineColumnToOffset(content, 1, 100);
      expect(offset).toBe(2);
    });
  });

  describe('getNodeRange', () => {
    it('should get code range for a node', () => {
      resetIdCounter();
      const html = '<div><p>Hello</p></div>';
      const tree = parseHtml(html);
      assignIds(tree);
      const indexMaps = buildIndexMaps(tree);

      const nodeIds = Array.from(indexMaps.byId.keys());
      const firstNodeId = nodeIds[0];

      const range = getNodeRange(firstNodeId, indexMaps, html);

      expect(range).toBeDefined();
      expect(range?.startLine).toBeGreaterThanOrEqual(1);
      expect(range?.startColumn).toBeGreaterThanOrEqual(1);
    });

    it('should return null for non-existent node', () => {
      resetIdCounter();
      const html = '<div>Test</div>';
      const tree = parseHtml(html);
      assignIds(tree);
      const indexMaps = buildIndexMaps(tree);

      const range = getNodeRange('non-existent', indexMaps, html);

      expect(range).toBeNull();
    });
  });

  describe('round-trip conversion', () => {
    it('should convert offset -> line/column -> offset', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const offset = 10;

      const pos = offsetToLineColumn(content, offset);
      const newOffset = lineColumnToOffset(content, pos.line, pos.column);

      expect(newOffset).toBe(offset);
    });

    it('should handle multiple round trips', () => {
      const content = 'A\nB\nC\nD\nE';

      for (let i = 0; i < content.length; i++) {
        const pos = offsetToLineColumn(content, i);
        const offset = lineColumnToOffset(content, pos.line, pos.column);
        expect(offset).toBe(i);
      }
    });
  });
});
