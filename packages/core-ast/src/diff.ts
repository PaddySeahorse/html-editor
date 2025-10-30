import { visit } from 'unist-util-visit';
import type { Root, Element, DiffResult } from './types.js';

export function applyPatch(root: Root, nodeId: string, newNode: Element): Root {
  let replaced = false;
  
  visit(root, 'element', (node: Element, index, parent) => {
    if (node.properties?.dataId === nodeId && parent && index !== undefined) {
      if (parent.type === 'root' || parent.type === 'element') {
        parent.children[index] = newNode;
        replaced = true;
        return false;
      }
    }
  });
  
  if (!replaced) {
    throw new Error(`Node with id ${nodeId} not found`);
  }
  
  return root;
}

export function replaceNodeById(root: Root, nodeId: string, newNode: Element): Root {
  return applyPatch(root, nodeId, newNode);
}

export function detectChanges(oldRoot: Root, newRoot: Root): DiffResult[] {
  const changes: DiffResult[] = [];
  const oldIds = new Set<string>();
  const newIds = new Set<string>();
  
  visit(oldRoot, 'element', (node: Element) => {
    const id = node.properties?.dataId as string | undefined;
    if (id) oldIds.add(id);
  });
  
  visit(newRoot, 'element', (node: Element) => {
    const id = node.properties?.dataId as string | undefined;
    if (id) newIds.add(id);
  });
  
  for (const id of oldIds) {
    if (!newIds.has(id)) {
      changes.push({ type: 'reparse' });
      return changes;
    }
  }
  
  for (const id of newIds) {
    if (!oldIds.has(id)) {
      changes.push({ type: 'reparse' });
      return changes;
    }
  }
  
  return changes;
}
