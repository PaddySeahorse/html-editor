import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { toHtml as hastToHtml } from 'hast-util-to-html';
import type { Root, Element, Nodes } from 'hast';

let idCounter = 0;

export function parse(html: string): Root {
  const processor = unified().use(rehypeParse, { fragment: true });
  return processor.parse(html) as Root;
}

export function toHtml(tree: Root): string {
  return hastToHtml(tree);
}

export function addIds(tree: Root): Root {
  const visit = (node: Root | Element): void => {
    if (node.type === 'element') {
      if (!node.properties) {
        node.properties = {};
      }
      if (!node.properties['data-editor-id']) {
        node.properties['data-editor-id'] = `node-${idCounter++}`;
      }
    }
    if ('children' in node && Array.isArray(node.children)) {
      node.children.forEach((child: Nodes) => {
        if (child.type === 'element') {
          visit(child as Element);
        }
      });
    }
  };

  visit(tree);
  return tree;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

export type { Root, Element, Nodes };
