import { create } from 'zustand';
import {
  parseHtml,
  toHtmlSync,
  assignIds,
  buildIndexMaps,
  normalize,
  replaceNodeById,
  resetIdCounter,
  moveNodeById,
} from '@html-editor/core-ast';
import type { Root, Element, NodeIndexMap } from '@html-editor/core-ast';

export interface HistoryEntry {
  ast: Root;
  htmlContent: string;
}

export interface EditorState {
  htmlContent: string;
  ast: Root | null;
  indexMaps: NodeIndexMap | null;
  selectedNodeId: string | null;
  error: string | null;
  isProcessing: boolean;
  cursorPosition: { line: number; column: number } | null;
  isDragging: boolean;
  draggedNodeId: string | null;
  draggedNodeParentId: string | null;
  draggedNodeIndex: number;
  dragOffset: { x: number; y: number };
  dropTargetParentId: string | null;
  dropTargetIndex: number;
  history: HistoryEntry[];
  historyIndex: number;

  updateHtml: (html: string) => void;
  updateAst: (ast: Root) => void;
  selectNode: (nodeId: string | null) => void;
  replaceNode: (nodeId: string, newNode: Element) => void;
  clearError: () => void;
  setCursorPosition: (position: { line: number; column: number } | null) => void;
  initialize: (html: string) => void;
  startDrag: (
    nodeId: string,
    parentId: string,
    index: number,
    offsetX: number,
    offsetY: number
  ) => void;
  updateDragOffset: (offsetX: number, offsetY: number) => void;
  setDropTarget: (parentId: string | null, index: number) => void;
  completeDrag: () => void;
  cancelDrag: () => void;
  moveNode: (nodeId: string, parentId: string | null, index: number) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  htmlContent: '',
  ast: null,
  indexMaps: null,
  selectedNodeId: null,
  error: null,
  isProcessing: false,
  cursorPosition: null,
  isDragging: false,
  draggedNodeId: null,
  draggedNodeParentId: null,
  draggedNodeIndex: 0,
  dragOffset: { x: 0, y: 0 },
  dropTargetParentId: null,
  dropTargetIndex: 0,
  history: [],
  historyIndex: -1,

  updateHtml: (html: string) => {
    set({ isProcessing: true, error: null });

    try {
      const ast = parseHtml(html);
      assignIds(ast);
      normalize(ast);
      const indexMaps = buildIndexMaps(ast);

      set({
        htmlContent: html,
        ast,
        indexMaps,
        isProcessing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to parse HTML',
        isProcessing: false,
      });
    }
  },

  updateAst: (ast: Root) => {
    try {
      const html = toHtmlSync(ast);
      const indexMaps = buildIndexMaps(ast);

      set({
        ast,
        htmlContent: html,
        indexMaps,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to serialize AST',
      });
    }
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  replaceNode: (nodeId: string, newNode: Element) => {
    const { ast } = get();
    if (!ast) return;

    try {
      const updatedAst = replaceNodeById(ast, nodeId, newNode);
      get().updateAst(updatedAst);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to replace node',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setCursorPosition: (position: { line: number; column: number } | null) => {
    set({ cursorPosition: position });
  },

  initialize: (html: string) => {
    resetIdCounter();
    get().updateHtml(html);
    set({ history: [], historyIndex: -1 });
  },

  startDrag: (
    nodeId: string,
    parentId: string,
    index: number,
    offsetX: number,
    offsetY: number
  ) => {
    set({
      isDragging: true,
      draggedNodeId: nodeId,
      draggedNodeParentId: parentId,
      draggedNodeIndex: index,
      dragOffset: { x: offsetX, y: offsetY },
      dropTargetParentId: parentId,
      dropTargetIndex: index,
    });
  },

  updateDragOffset: (offsetX: number, offsetY: number) => {
    set({ dragOffset: { x: offsetX, y: offsetY } });
  },

  setDropTarget: (parentId: string | null, index: number) => {
    set({ dropTargetParentId: parentId, dropTargetIndex: index });
  },

  completeDrag: () => {
    const { draggedNodeId, dropTargetParentId, dropTargetIndex } = get();
    if (draggedNodeId && dropTargetParentId !== null) {
      get().moveNode(draggedNodeId, dropTargetParentId, dropTargetIndex);
    }
    set({
      isDragging: false,
      draggedNodeId: null,
      draggedNodeParentId: null,
      draggedNodeIndex: 0,
      dragOffset: { x: 0, y: 0 },
      dropTargetParentId: null,
      dropTargetIndex: 0,
    });
  },

  cancelDrag: () => {
    set({
      isDragging: false,
      draggedNodeId: null,
      draggedNodeParentId: null,
      draggedNodeIndex: 0,
      dragOffset: { x: 0, y: 0 },
      dropTargetParentId: null,
      dropTargetIndex: 0,
    });
  },

  moveNode: (nodeId: string, parentId: string | null, index: number) => {
    const { ast } = get();
    if (!ast) return;

    try {
      const updatedAst = moveNodeById(ast, nodeId, parentId, index);
      get().updateAst(updatedAst);
      get().pushHistory();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to move node',
      });
    }
  },

  pushHistory: () => {
    const { ast, htmlContent, history, historyIndex } = get();
    if (!ast) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ast: JSON.parse(JSON.stringify(ast)), htmlContent });
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevEntry = history[prevIndex];
      set({
        ast: JSON.parse(JSON.stringify(prevEntry.ast)),
        htmlContent: prevEntry.htmlContent,
        historyIndex: prevIndex,
      });
      const state = get();
      if (state.ast) {
        const indexMaps = buildIndexMaps(state.ast);
        set({ indexMaps });
      }
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextEntry = history[nextIndex];
      set({
        ast: JSON.parse(JSON.stringify(nextEntry.ast)),
        htmlContent: nextEntry.htmlContent,
        historyIndex: nextIndex,
      });
      const state = get();
      if (state.ast) {
        const indexMaps = buildIndexMaps(state.ast);
        set({ indexMaps });
      }
    }
  },
}));
