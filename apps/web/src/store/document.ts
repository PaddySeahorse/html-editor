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

export interface OutlineNode {
  id: string;
  label: string;
  children?: OutlineNode[];
}

export interface HistoryState {
  past: string[];
  future: string[];
}

export interface UIState {
  theme: 'light' | 'dark';
  isOutlineCollapsed: boolean;
  lastInsertType: string | null;
  lastDeleteTimestamp: number | null;
}

export interface DocumentState {
  content: string;
  ast: DocumentNode | null;
  outline: OutlineNode[];
  selection: Selection | null;
  history: HistoryState;
  ui: UIState;
  setContent: (content: string) => void;
  setAst: (ast: DocumentNode | null) => void;
  setSelection: (selection: Selection | null) => void;
  setOutline: (outline: OutlineNode[]) => void;
  enqueueInsert: (element: string) => void;
  toggleTheme: () => void;
  toggleOutline: () => void;
  undo: () => void;
  redo: () => void;
  deleteSelection: () => void;
}

const HISTORY_LIMIT = 100;

const initialHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HTML Editor</title>
  </head>
  <body>
    <section class="hero">
      <h1>Welcome to the HTML Editor</h1>
      <p>Edit the code on the right to see live updates here.</p>
      <button>Get Started</button>
    </section>
    <section class="features">
      <h2>Features</h2>
      <ul>
        <li>Dual-view editing</li>
        <li>Outline navigation</li>
        <li>Keyboard shortcuts</li>
      </ul>
    </section>
  </body>
</html>`;

const mockOutline: OutlineNode[] = [
  {
    id: 'node-html',
    label: 'html',
    children: [
      {
        id: 'node-head',
        label: 'head',
        children: [
          { id: 'node-meta', label: 'meta' },
          { id: 'node-title', label: 'title' },
        ],
      },
      {
        id: 'node-body',
        label: 'body',
        children: [
          {
            id: 'node-hero',
            label: 'section.hero',
            children: [
              { id: 'node-hero-h1', label: 'h1' },
              { id: 'node-hero-p', label: 'p' },
              { id: 'node-hero-button', label: 'button' },
            ],
          },
          {
            id: 'node-features',
            label: 'section.features',
            children: [
              { id: 'node-features-h2', label: 'h2' },
              {
                id: 'node-features-ul',
                label: 'ul',
                children: [{ id: 'node-li', label: 'li ×3' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

const mockAst: DocumentNode = {
  id: 'root',
  type: 'root',
  children: [
    {
      id: 'node-html',
      type: 'element',
      properties: { tagName: 'html' },
      children: [
        {
          id: 'node-head',
          type: 'element',
          properties: { tagName: 'head' },
          children: [
            {
              id: 'node-meta',
              type: 'element',
              properties: { tagName: 'meta', charset: 'UTF-8' },
            },
            {
              id: 'node-title',
              type: 'element',
              properties: { tagName: 'title' },
              children: [{ id: 'node-title-text', type: 'text', value: 'HTML Editor' }],
            },
          ],
        },
        {
          id: 'node-body',
          type: 'element',
          properties: { tagName: 'body' },
          children: [
            {
              id: 'node-hero',
              type: 'element',
              properties: { tagName: 'section', className: 'hero' },
              children: [
                {
                  id: 'node-hero-h1',
                  type: 'element',
                  properties: { tagName: 'h1' },
                  children: [
                    { id: 'node-hero-h1-text', type: 'text', value: 'Welcome to the HTML Editor' },
                  ],
                },
                {
                  id: 'node-hero-p',
                  type: 'element',
                  properties: { tagName: 'p' },
                  children: [
                    {
                      id: 'node-hero-p-text',
                      type: 'text',
                      value: 'Edit the code on the right to see live updates here.',
                    },
                  ],
                },
                {
                  id: 'node-hero-button',
                  type: 'element',
                  properties: { tagName: 'button' },
                  children: [{ id: 'node-hero-button-text', type: 'text', value: 'Get Started' }],
                },
              ],
            },
            {
              id: 'node-features',
              type: 'element',
              properties: { tagName: 'section', className: 'features' },
              children: [
                {
                  id: 'node-features-h2',
                  type: 'element',
                  properties: { tagName: 'h2' },
                  children: [{ id: 'node-features-h2-text', type: 'text', value: 'Features' }],
                },
                {
                  id: 'node-features-ul',
                  type: 'element',
                  properties: { tagName: 'ul' },
                  children: [
                    {
                      id: 'node-li-1',
                      type: 'element',
                      properties: { tagName: 'li' },
                      children: [
                        { id: 'node-li-1-text', type: 'text', value: 'Dual-view editing' },
                      ],
                    },
                    {
                      id: 'node-li-2',
                      type: 'element',
                      properties: { tagName: 'li' },
                      children: [
                        { id: 'node-li-2-text', type: 'text', value: 'Outline navigation' },
                      ],
                    },
                    {
                      id: 'node-li-3',
                      type: 'element',
                      properties: { tagName: 'li' },
                      children: [
                        { id: 'node-li-3-text', type: 'text', value: 'Keyboard shortcuts' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  content: initialHtml,
  ast: mockAst,
  outline: mockOutline,
  selection: null,
  history: {
    past: [],
    future: [],
  },
  ui: {
    theme: 'light',
    isOutlineCollapsed: false,
    lastInsertType: null,
    lastDeleteTimestamp: null,
  },
  setContent: (content) => {
    const currentContent = get().content;
    if (currentContent === content) {
      return;
    }

    set((state) => {
      const newPast = [...state.history.past, state.content].slice(-HISTORY_LIMIT);

      return {
        content,
        history: {
          past: newPast,
          future: [],
        },
      };
    });
  },
  setAst: (ast) => set({ ast }),
  setSelection: (selection) => set({ selection }),
  setOutline: (outline) => set({ outline }),
  enqueueInsert: (element) =>
    set((state) => ({
      ui: {
        ...state.ui,
        lastInsertType: element,
      },
    })),
  toggleTheme: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        theme: state.ui.theme === 'light' ? 'dark' : 'light',
      },
    })),
  toggleOutline: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        isOutlineCollapsed: !state.ui.isOutlineCollapsed,
      },
    })),
  undo: () => {
    const { history } = get();
    if (!history.past.length) {
      return;
    }

    set((state) => {
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      const newFuture = [state.content, ...state.history.future].slice(0, HISTORY_LIMIT);

      return {
        content: previous,
        history: {
          past: newPast,
          future: newFuture,
        },
      };
    });
  },
  redo: () => {
    const { history } = get();
    if (!history.future.length) {
      return;
    }

    set((state) => {
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      const newPast = [...state.history.past, state.content].slice(-HISTORY_LIMIT);

      return {
        content: next,
        history: {
          past: newPast,
          future: newFuture,
        },
      };
    });
  },
  deleteSelection: () =>
    set((state) => ({
      selection: null,
      ui: {
        ...state.ui,
        lastDeleteTimestamp: Date.now(),
      },
    })),
}));
