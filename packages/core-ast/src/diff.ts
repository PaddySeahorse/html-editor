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

interface NodeWithChildren {
  type: string;
  children?: unknown[];
  properties?: Record<string, unknown>;
}

function hasChildrenArray(
  node: NodeWithChildren
): node is NodeWithChildren & { children: unknown[] } {
  return Array.isArray(node.children);
}

export function moveNodeById(
  root: Root,
  nodeId: string,
  parentId: string | null,
  indexInParent: number
): Root {
  let nodeToMove: Element | undefined;
  let removeParent: NodeWithChildren | null = null;
  let removeIndex: number | undefined;

  const findAndRemoveNode = (node: NodeWithChildren): boolean => {
    if (!hasChildrenArray(node)) return false;

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i] as NodeWithChildren;
      if (child.type === 'element' && (child.properties?.dataId as string) === nodeId) {
        nodeToMove = child as Element;
        removeParent = node;
        removeIndex = i;
        return true;
      }
      if (findAndRemoveNode(child)) {
        return true;
      }
    }
    return false;
  };

  findAndRemoveNode(root as NodeWithChildren);

  if (!nodeToMove || removeParent === null || removeIndex === undefined) {
    throw new Error(`Node with id ${nodeId} not found`);
  }

  const removeChildren = (removeParent as Record<string, unknown>).children as unknown[];
  if (Array.isArray(removeChildren)) {
    removeChildren.splice(removeIndex, 1);
  }

  let targetParent: Element | Root | undefined;
  if (parentId === null) {
    targetParent = root;
  } else {
    const findParentNode = (node: NodeWithChildren): Element | undefined => {
      if (node.type === 'element' && (node.properties?.dataId as string) === parentId) {
        return node as Element;
      }
      if (!hasChildrenArray(node)) return undefined;

      for (const child of node.children) {
        const childNode = child as NodeWithChildren;
        if (childNode.type === 'element') {
          const found = findParentNode(childNode);
          if (found) return found;
        }
      }
      return undefined;
    };

    targetParent = findParentNode(root as NodeWithChildren);
  }

  if (!targetParent) {
    throw new Error(`Parent node with id ${parentId} not found`);
  }

  const targetChildren = (targetParent as Root | Element).children;
  if (!targetChildren) {
    (targetParent as Root | Element).children = [];
  }

  const insertIndex = Math.min(indexInParent, (targetParent as Root | Element).children!.length);
  (targetParent as Root | Element).children!.splice(insertIndex, 0, nodeToMove);

  return root;
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
