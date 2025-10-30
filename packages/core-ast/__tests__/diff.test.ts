import { describe, it, expect, beforeEach } from 'vitest';
import { parseHtml } from '../src/parse.js';
import { assignIds, resetIdCounter } from '../src/identity.js';
import { applyPatch, replaceNodeById, detectChanges } from '../src/diff.js';
import type { Element } from '../src/types.js';

describe('diff and patch', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('applyPatch', () => {
    it('should replace node by id', () => {
      const html = '<div><p>Old Text</p></div>';
      const tree = parseHtml(html);
      assignIds(tree);

      const div = tree.children[0];
      if (div.type === 'element') {
        const p = div.children[0];
        if (p.type === 'element') {
          const id = p.properties?.dataId as string;

          const newP: Element = {
            type: 'element',
            tagName: 'p',
            properties: { dataId: id },
            children: [{ type: 'text', value: 'New Text' }],
          };

          applyPatch(tree, id, newP);

          const updatedP = div.children[0];
          if (updatedP.type === 'element') {
            const text = updatedP.children[0];
            if (text.type === 'text') {
              expect(text.value).toBe('New Text');
            }
          }
        }
      }
    });

    it('should throw error for non-existent id', () => {
      const html = '<div>Content</div>';
      const tree = parseHtml(html);
      assignIds(tree);

      const newNode: Element = {
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [],
      };

      expect(() => applyPatch(tree, 'non-existent', newNode)).toThrow();
    });
  });

  describe('replaceNodeById', () => {
    it('should be an alias for applyPatch', () => {
      const html = '<div><p>Text</p></div>';
      const tree = parseHtml(html);
      assignIds(tree);

      const div = tree.children[0];
      if (div.type === 'element') {
        const p = div.children[0];
        if (p.type === 'element') {
          const id = p.properties?.dataId as string;

          const newP: Element = {
            type: 'element',
            tagName: 'p',
            properties: { dataId: id },
            children: [{ type: 'text', value: 'Updated' }],
          };

          replaceNodeById(tree, id, newP);

          const updatedP = div.children[0];
          if (updatedP.type === 'element') {
            const text = updatedP.children[0];
            if (text.type === 'text') {
              expect(text.value).toBe('Updated');
            }
          }
        }
      }
    });
  });

  describe('detectChanges', () => {
    it('should detect when IDs are removed', () => {
      const html1 = '<div><p>One</p><p>Two</p></div>';
      const html2 = '<div><p>One</p></div>';

      const tree1 = parseHtml(html1);
      const tree2 = parseHtml(html2);
      assignIds(tree1);
      assignIds(tree2);

      const changes = detectChanges(tree1, tree2);

      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0].type).toBe('reparse');
    });

    it('should detect when IDs are added', () => {
      const html1 = '<div><p>One</p></div>';
      const html2 = '<div><p>One</p><p>Two</p></div>';

      const tree1 = parseHtml(html1);
      const tree2 = parseHtml(html2);
      assignIds(tree1);
      assignIds(tree2);

      const changes = detectChanges(tree1, tree2);

      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0].type).toBe('reparse');
    });

    it('should return empty array when no structural changes', () => {
      const html1 = '<div><p>Text</p></div>';
      const html2 = '<div><p>Text</p></div>';

      const tree1 = parseHtml(html1);
      assignIds(tree1);

      const tree2 = parseHtml(html2);
      const div1 = tree1.children[0];
      if (div1.type === 'element') {
        const p1 = div1.children[0];
        if (p1.type === 'element') {
          const divId = div1.properties?.dataId;
          const pId = p1.properties?.dataId;

          const div2 = tree2.children[0];
          if (div2.type === 'element') {
            div2.properties = { ...div2.properties, dataId: divId };
            const p2 = div2.children[0];
            if (p2.type === 'element') {
              p2.properties = { ...p2.properties, dataId: pId };
            }
          }
        }
      }

      const changes = detectChanges(tree1, tree2);

      expect(changes.length).toBe(0);
    });
  });
});
