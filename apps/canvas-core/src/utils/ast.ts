import { ASTNode } from '../types/ast';

let nextId = 1;

export function generateId(): string {
  return `node-${nextId++}`;
}

export function findNodeById(nodes: ASTNode[], id: string): ASTNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentNode(
  nodes: ASTNode[],
  childId: string,
  parent: ASTNode | null = null
): { parent: ASTNode | null; parentArray: ASTNode[] } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === childId) {
      return { parent, parentArray: nodes };
    }
    if (node.children) {
      const found = findParentNode(node.children, childId, node);
      if (found) return found;
    }
  }
  return null;
}

export function deleteNode(nodes: ASTNode[], id: string): ASTNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children) {
        return {
          ...node,
          children: deleteNode(node.children, id),
        } as ASTNode;
      }
      return node;
    });
}

export function updateNode(nodes: ASTNode[], id: string, updates: Partial<ASTNode>): ASTNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates } as ASTNode;
    }
    if (node.children) {
      return {
        ...node,
        children: updateNode(node.children, id, updates),
      } as ASTNode;
    }
    return node;
  });
}

export function duplicateNode(node: ASTNode): ASTNode {
  const newNode = { ...node, id: generateId() };
  if (newNode.children) {
    newNode.children = newNode.children.map(duplicateNode);
  }
  return newNode;
}

export function insertNode(
  nodes: ASTNode[],
  newNode: ASTNode,
  parentId: string | null,
  index?: number
): ASTNode[] {
  if (parentId === null) {
    if (index !== undefined) {
      const result = [...nodes];
      result.splice(index, 0, newNode);
      return result;
    }
    return [...nodes, newNode];
  }

  return nodes.map((node) => {
    if (node.id === parentId && node.children) {
      const newChildren = [...node.children];
      if (index !== undefined) {
        newChildren.splice(index, 0, newNode);
      } else {
        newChildren.push(newNode);
      }
      return { ...node, children: newChildren } as ASTNode;
    }
    if (node.children) {
      return {
        ...node,
        children: insertNode(node.children, newNode, parentId, index),
      } as ASTNode;
    }
    return node;
  });
}

export function moveNode(
  nodes: ASTNode[],
  nodeId: string,
  targetParentId: string | null,
  index: number
): ASTNode[] {
  const node = findNodeById(nodes, nodeId);
  if (!node) return nodes;

  let result = deleteNode(nodes, nodeId);
  result = insertNode(result, node, targetParentId, index);
  return result;
}

export function canAcceptChildren(node: ASTNode): boolean {
  return node.type === 'section' || node.type === 'container' || node.type === 'list';
}

export function isValidChildFor(parent: ASTNode | null, child: ASTNode): boolean {
  if (!parent) return true;

  if (parent.type === 'list') {
    return child.type === 'listItem';
  }

  if (parent.type === 'section' || parent.type === 'container') {
    return child.type !== 'listItem';
  }

  return false;
}
