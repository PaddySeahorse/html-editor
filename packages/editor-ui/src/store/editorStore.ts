import { create } from 'zustand';
import {
  parseHtml,
  toHtmlSync,
  assignIds,
  buildIndexMaps,
  normalize,
  replaceNodeById,
  resetIdCounter,
} from '@html-editor/core-ast';
import type { Root, Element, NodeIndexMap } from '@html-editor/core-ast';

export interface EditorState {
  htmlContent: string;
  ast: Root | null;
  indexMaps: NodeIndexMap | null;
  selectedNodeId: string | null;
  error: string | null;
  isProcessing: boolean;
  cursorPosition: { line: number; column: number } | null;
  
  updateHtml: (html: string) => void;
  updateAst: (ast: Root) => void;
  selectNode: (nodeId: string | null) => void;
  replaceNode: (nodeId: string, newNode: Element) => void;
  clearError: () => void;
  setCursorPosition: (position: { line: number; column: number } | null) => void;
  initialize: (html: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  htmlContent: '',
  ast: null,
  indexMaps: null,
  selectedNodeId: null,
  error: null,
  isProcessing: false,
  cursorPosition: null,

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
  },
}));
