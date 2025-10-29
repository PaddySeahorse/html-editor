import { visit } from 'unist-util-visit';
import type { Root, Element, NodeIndexMap } from './types.js';

let idCounter = 0;

export function resetIdCounter(): void {
  idCounter = 0;
}

function generateId(): string {
  return `node-${++idCounter}`;
}

export function assignIds(root: Root): Root {
  visit(root, 'element', (node: Element) => {
    if (!node.properties) {
      node.properties = {};
    }
    if (!node.properties.dataId) {
      node.properties.dataId = generateId();
    }
  });
  return root;
}

export function buildIndexMaps(root: Root): NodeIndexMap {
  const byId = new Map<string, Element>();
  const byTextRange = new Map<string, { start: number; end: number }>();

  visit(root, 'element', (node: Element) => {
    const id = node.properties?.dataId as string | undefined;
    if (id) {
      byId.set(id, node);
      
      if (node.position) {
        byTextRange.set(id, {
          start: node.position.start.offset || 0,
          end: node.position.end.offset || 0,
        });
      }
    }
  });

  return { byId, byTextRange };
}

export function findNodeById(root: Root, id: string): Element | undefined {
  let found: Element | undefined;
  
  visit(root, 'element', (node: Element) => {
    if (node.properties?.dataId === id) {
      found = node;
      return false;
    }
  });
  
  return found;
}
