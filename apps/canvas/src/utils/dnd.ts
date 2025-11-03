import { ASTNode } from '../types/ast';
import { isValidChildFor } from './ast';

export interface ParsedDropId {
  parentId: string | null;
  index: number;
}

export function createDropId(parentId: string | null, index: number): string {
  return `drop:${parentId ?? 'root'}:${index}`;
}

export function parseDropId(id: string): ParsedDropId | null {
  if (!id.startsWith('drop:')) {
    return null;
  }
  const [, parentSegment, indexSegment] = id.split(':');
  if (typeof parentSegment === 'undefined' || typeof indexSegment === 'undefined') {
    return null;
  }

  const parentId = parentSegment === 'root' ? null : parentSegment;
  const index = Number.parseInt(indexSegment, 10);

  if (Number.isNaN(index)) {
    return null;
  }

  return { parentId, index };
}

export function nodeContainsId(node: ASTNode, targetId: string): boolean {
  if (!node.children) {
    return false;
  }

  for (const child of node.children) {
    if (child.id === targetId) {
      return true;
    }
    if (nodeContainsId(child, targetId)) {
      return true;
    }
  }

  return false;
}

export function canDropIntoParent(activeNode: ASTNode | null, parentNode: ASTNode | null): boolean {
  if (!activeNode) {
    return true;
  }

  if (!parentNode) {
    return true;
  }

  if (activeNode.id === parentNode.id) {
    return false;
  }

  if (!isValidChildFor(parentNode, activeNode)) {
    return false;
  }

  if (nodeContainsId(activeNode, parentNode.id)) {
    return false;
  }

  return true;
}
