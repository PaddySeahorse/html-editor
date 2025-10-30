import { visit, SKIP } from 'unist-util-visit';
import type { Root, Element, Text } from './types.js';

export function normalize(root: Root): Root {
  removeEmptyTextNodes(root);
  mergeAdjacentTextNodes(root);
  unwrapRedundantSpans(root);
  trimWhitespace(root);
  return root;
}

function removeEmptyTextNodes(root: Root): void {
  visit(root, (node, index, parent) => {
    if (node.type === 'text' && parent && index !== undefined) {
      const textNode = node as Text;
      if (!textNode.value || textNode.value.trim() === '') {
        if (parent.type === 'root' || parent.type === 'element') {
          parent.children.splice(index, 1);
          return [SKIP, index];
        }
      }
    }
  });
}

function mergeAdjacentTextNodes(root: Root): void {
  visit(root, (node) => {
    if (node.type === 'root' || node.type === 'element') {
      const children = node.children;
      let i = 0;

      while (i < children.length - 1) {
        const current = children[i];
        const next = children[i + 1];

        if (current.type === 'text' && next.type === 'text') {
          (current as Text).value += (next as Text).value;
          children.splice(i + 1, 1);
        } else {
          i++;
        }
      }
    }
  });
}

function unwrapRedundantSpans(root: Root): void {
  visit(root, (node, index, parent) => {
    if (node.type === 'element' && parent && index !== undefined) {
      const element = node as Element;

      if (element.tagName === 'span' && isRedundantSpan(element)) {
        if (parent.type === 'root' || parent.type === 'element') {
          parent.children.splice(index, 1, ...element.children);
          return [SKIP, index];
        }
      }
    }
  });
}

function isRedundantSpan(element: Element): boolean {
  if (!element.properties) return true;

  const props = element.properties;
  const hasDataId = 'dataEditorId' in props;
  const propCount = Object.keys(props).length;

  return propCount === 0 || (hasDataId && propCount === 1);
}

function trimWhitespace(root: Root): void {
  visit(root, (node) => {
    if (node.type === 'element') {
      const element = node as Element;
      const children = element.children;

      if (isInlineElement(element.tagName) || isBlockElement(element.tagName)) {
        if (children.length > 0) {
          const first = children[0];
          if (first.type === 'text' && isBlockElement(element.tagName)) {
            (first as Text).value = (first as Text).value.replace(/^\s+/, '');
          }

          const last = children[children.length - 1];
          if (last.type === 'text' && isBlockElement(element.tagName)) {
            (last as Text).value = (last as Text).value.replace(/\s+$/, '');
          }
        }
      }
    }
  });
}

function isBlockElement(tagName: string): boolean {
  const blockElements = new Set([
    'div',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'section',
    'article',
    'header',
    'footer',
    'nav',
    'main',
    'aside',
    'blockquote',
    'pre',
  ]);
  return blockElements.has(tagName);
}

function isInlineElement(tagName: string): boolean {
  const inlineElements = new Set([
    'span',
    'a',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'code',
    'small',
    'mark',
    'del',
    'ins',
    'sub',
    'sup',
  ]);
  return inlineElements.has(tagName);
}
