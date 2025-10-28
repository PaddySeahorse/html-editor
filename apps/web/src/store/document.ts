import { create } from 'zustand';

export interface Selection {
  start: number;
  end: number;
}

export interface DocumentNode {
  id: string;
  type: string;
  children?: DocumentNode[];
  properties?: Record<string, unknown>;
  value?: string;
}

export interface DocumentState {
  content: string;
  ast: DocumentNode | null;
  selection: Selection | null;
  setContent: (content: string) => void;
  setAst: (ast: DocumentNode | null) => void;
  setSelection: (selection: Selection | null) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  content: '',
  ast: null,
  selection: null,
  setContent: (content) => set({ content }),
  setAst: (ast) => set({ ast }),
  setSelection: (selection) => set({ selection }),
}));
