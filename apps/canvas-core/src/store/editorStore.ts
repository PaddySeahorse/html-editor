import { create } from 'zustand';
import { ASTNode } from '../types/ast';
import {
  deleteNode,
  updateNode,
  insertNode,
  moveNode,
  duplicateNode,
  generateId,
  findNodeById,
} from '../utils/ast';
import { htmlToAst, astToHtml } from '../utils/html';

interface EditorStore {
  ast: ASTNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  editingNodeId: string | null;
  history: {
    past: ASTNode[][];
    future: ASTNode[][];
  };
  lastEditTime: number;
  coalesceDelay: number;
  
  setAst: (ast: ASTNode[]) => void;
  setSelectedNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setEditingNode: (id: string | null) => void;
  
  addNode: (node: ASTNode, parentId: string | null, index?: number) => void;
  deleteNodeById: (id: string) => void;
  updateNodeById: (id: string, updates: Partial<ASTNode>) => void;
  duplicateNodeById: (id: string) => void;
  moveNodeById: (nodeId: string, targetParentId: string | null, index: number) => void;
  
  updateFromHtml: (html: string) => void;
  getHtml: () => string;
  
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  pushHistory: (coalesce?: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ast: [
    {
      id: generateId(),
      type: 'section',
      tag: 'section',
      children: [
        {
          id: generateId(),
          type: 'heading',
          tag: 'h1',
          content: 'Welcome to HTML Editor',
        },
        {
          id: generateId(),
          type: 'text',
          tag: 'p',
          content: 'Start editing your HTML visually or with code.',
        },
      ],
    },
  ],
  selectedNodeId: null,
  hoveredNodeId: null,
  editingNodeId: null,
  history: {
    past: [],
    future: [],
  },
  lastEditTime: 0,
  coalesceDelay: 500,
  
  setAst: (ast) => set({ ast }),
  
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  
  setEditingNode: (id) => set({ editingNodeId: id }),
  
  pushHistory: (coalesce = false) => {
    const state = get();
    const now = Date.now();
    
    if (coalesce && now - state.lastEditTime < state.coalesceDelay && state.history.past.length > 0) {
      return;
    }
    
    set({
      history: {
        past: [...state.history.past, state.ast],
        future: [],
      },
      lastEditTime: now,
    });
  },
  
  addNode: (node, parentId, index) => {
    get().pushHistory();
    set((state) => ({
      ast: insertNode(state.ast, node, parentId, index),
    }));
  },
  
  deleteNodeById: (id) => {
    get().pushHistory();
    set((state) => ({
      ast: deleteNode(state.ast, id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },
  
  updateNodeById: (id, updates) => {
    get().pushHistory(true);
    set((state) => ({
      ast: updateNode(state.ast, id, updates),
    }));
  },
  
  duplicateNodeById: (id) => {
    const state = get();
    const node = findNodeById(state.ast, id);
    if (!node) return;
    
    const newNode = duplicateNode(node);
    get().pushHistory();
    
    set((state) => {
      const parent = findParentById(state.ast, id);
      return {
        ast: insertNode(state.ast, newNode, parent?.id || null),
      };
    });
  },
  
  moveNodeById: (nodeId, targetParentId, index) => {
    get().pushHistory();
    set((state) => ({
      ast: moveNode(state.ast, nodeId, targetParentId, index),
    }));
  },
  
  updateFromHtml: (html) => {
    get().pushHistory();
    try {
      const ast = htmlToAst(html);
      set({ ast });
    } catch (error) {
      console.error('Failed to parse HTML:', error);
    }
  },
  
  getHtml: () => {
    const state = get();
    return astToHtml(state.ast);
  },
  
  undo: () => {
    const state = get();
    if (state.history.past.length === 0) return;
    
    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);
    
    set({
      ast: previous,
      history: {
        past: newPast,
        future: [state.ast, ...state.history.future],
      },
    });
  },
  
  redo: () => {
    const state = get();
    if (state.history.future.length === 0) return;
    
    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);
    
    set({
      ast: next,
      history: {
        past: [...state.history.past, state.ast],
        future: newFuture,
      },
    });
  },
  
  canUndo: () => get().history.past.length > 0,
  
  canRedo: () => get().history.future.length > 0,
}));

function findParentById(nodes: ASTNode[], childId: string, parent: ASTNode | null = null): ASTNode | null {
  for (const node of nodes) {
    if (node.id === childId) {
      return parent;
    }
    if (node.children) {
      const found = findParentById(node.children, childId, node);
      if (found !== null) return found;
    }
  }
  return null;
}
