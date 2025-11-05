import { create } from 'zustand';
import { assignIds, parseHtml, toHtmlSync, moveNodeById } from '@html-editor/core-ast';
import type {
  Root,
  Element as HastElement,
  Text as HastText,
  Comment as HastComment,
  RootContent as HastRootContent,
  ElementContent,
  Properties as HastProperties,
} from 'hast';

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
  selectedNodeId: string | null;
  setContent: (content: string) => void;
  setSelection: (selection: Selection | null) => void;
  enqueueInsert: (element: string) => void;
  toggleTheme: () => void;
  toggleOutline: () => void;
  undo: () => void;
  redo: () => void;
  deleteSelection: () => void;
  setSelectedNode: (id: string | null) => void;
  updateTextNode: (id: string, value: string) => void;
  moveNode: (nodeId: string, parentId: string | null, index: number) => void;
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

type IdFactory = {
  nextElement: () => string;
  nextText: () => string;
  nextComment: () => string;
};

const createIdFactory = (): IdFactory => {
  let element = 0;
  let text = 0;
  let comment = 0;

  return {
    nextElement: () => `element-${++element}`,
    nextText: () => `text-${++text}`,
    nextComment: () => `comment-${++comment}`,
  };
};

const toClassName = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(' ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
};

const isRenderableRootContent = (
  child: HastRootContent
): child is HastElement | HastText | HastComment => child.type !== 'doctype';

const hastToDocumentNode = (
  node: Root | HastElement | HastText | HastComment,
  ids: IdFactory
): DocumentNode => {
  if (node.type === 'root') {
    return {
      id: 'root',
      type: 'root',
      children: (node.children ?? [])
        .filter(isRenderableRootContent)
        .map((child) => hastToDocumentNode(child, ids)),
    };
  }

  if (node.type === 'element') {
    const properties: Record<string, unknown> = { tagName: node.tagName };
    if (node.properties) {
      for (const [key, value] of Object.entries(node.properties)) {
        if (key === 'className') {
          const className = toClassName(value);
          if (className) {
            properties.className = className;
          }
          continue;
        }
        properties[key] = value as unknown;
      }
    }

    const dataId =
      (properties.dataId as string | undefined) ||
      (properties.id as string | undefined) ||
      ids.nextElement();

    properties.dataId = dataId;

    return {
      id: dataId,
      type: 'element',
      properties,
      children: (node.children ?? []).map((child) => hastToDocumentNode(child, ids)),
    };
  }

  if (node.type === 'text') {
    const baseId = node.position?.start.offset ?? ids.nextText();
    return {
      id: `text-${baseId}`,
      type: 'text',
      value: node.value ?? '',
    };
  }

  if (node.type === 'comment') {
    const baseId = node.position?.start.offset ?? ids.nextComment();
    return {
      id: `comment-${baseId}`,
      type: 'comment',
      value: node.value ?? '',
    };
  }

  return {
    id: ids.nextElement(),
    type: 'element',
    properties: { tagName: 'div' },
    children: [],
  };
};

const documentNodeToHast = (node: DocumentNode): Root | HastElement | HastText | HastComment => {
  if (node.type === 'root') {
    const rootChildren: HastRootContent[] = (node.children ?? []).map(
      (child) => documentNodeToHast(child) as HastRootContent
    );

    return {
      type: 'root',
      children: rootChildren,
    } satisfies Root;
  }

  if (node.type === 'element') {
    const rawProps = { ...(node.properties ?? {}) };
    const tagName = String(rawProps.tagName ?? 'div');
    const { className, ...rest } = rawProps;
    delete (rest as Record<string, unknown>).tagName;

    const properties: HastProperties = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined) {
        continue;
      }
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
      ) {
        properties[key] = value;
        continue;
      }
      if (Array.isArray(value)) {
        const normalizedArray = value.map((item) => {
          if (typeof item === 'string' || typeof item === 'number') {
            return item;
          }
          if (typeof item === 'boolean') {
            return item ? 'true' : 'false';
          }
          return String(item);
        }) as (string | number)[];
        properties[key] = normalizedArray;
        continue;
      }

      properties[key] = String(value);
    }

    const classValue = toClassName(className);
    if (classValue) {
      properties.className = classValue.split(/\s+/).filter(Boolean);
    }

    if (typeof properties.dataId !== 'string') {
      properties.dataId = node.id;
    }

    const elementChildren: ElementContent[] = (node.children ?? []).map(
      (child) => documentNodeToHast(child) as ElementContent
    );

    return {
      type: 'element',
      tagName,
      properties,
      children: elementChildren,
    } satisfies HastElement;
  }

  if (node.type === 'text') {
    return {
      type: 'text',
      value: node.value ?? '',
    } satisfies HastText;
  }

  if (node.type === 'comment') {
    return {
      type: 'comment',
      value: node.value ?? '',
    } satisfies HastComment;
  }

  return {
    type: 'text',
    value: node.value ?? '',
  } satisfies HastText;
};

const documentNodeToHtml = (node: DocumentNode): string => {
  const hast = documentNodeToHast(node);
  if (hast.type !== 'root') {
    throw new Error('Expected root node for serialization');
  }
  return '<!DOCTYPE html>\n' + toHtmlSync(hast);
};

const buildOutlineFromDocument = (node: DocumentNode | null): OutlineNode[] => {
  if (!node || !node.children) {
    return [];
  }

  const mapElement = (child: DocumentNode): OutlineNode | null => {
    if (child.type !== 'element') {
      return null;
    }

    const tagName = String(child.properties?.tagName ?? child.type);
    const className = toClassName(child.properties?.className);
    const label = className ? `${tagName}.${className.trim().split(/\s+/).join('.')}` : tagName;

    const children = (child.children ?? [])
      .map(mapElement)
      .filter((value): value is OutlineNode => Boolean(value));

    return {
      id: child.id,
      label,
      children,
    };
  };

  const elementChildren = (node.children ?? []).filter(
    (child): child is DocumentNode => child.type === 'element'
  );

  const mappedChildren = elementChildren
    .map(mapElement)
    .filter((value): value is OutlineNode => Boolean(value));

  if (node.type === 'root') {
    return [
      {
        id: node.id,
        label: 'html',
        children: mappedChildren,
      },
    ];
  }

  return mappedChildren;
};

const updateTextNodeValue = (
  node: DocumentNode,
  id: string,
  value: string
): { updated: DocumentNode; changed: boolean } => {
  if (node.id === id && node.type === 'text') {
    if (node.value === value) {
      return { updated: node, changed: false };
    }
    return { updated: { ...node, value }, changed: true };
  }

  if (!node.children || node.children.length === 0) {
    return { updated: node, changed: false };
  }

  let childChanged = false;
  const newChildren = node.children.map((child) => {
    const result = updateTextNodeValue(child, id, value);
    if (result.changed) {
      childChanged = true;
    }
    return result.updated;
  });

  if (!childChanged) {
    return { updated: node, changed: false };
  }

  return {
    updated: {
      ...node,
      children: newChildren,
    },
    changed: true,
  };
};

const deriveDocumentFromHtml = (
  html: string,
  fallbackAst: DocumentNode | null
): { ast: DocumentNode | null; outline: OutlineNode[] } => {
  try {
    const root = parseHtml(html) as Root;
    assignIds(root);
    const ast = hastToDocumentNode(root, createIdFactory());
    const outline = buildOutlineFromDocument(ast);
    return { ast, outline };
  } catch (error) {
    console.warn('Failed to parse HTML content', error);
    if (fallbackAst) {
      return {
        ast: fallbackAst,
        outline: buildOutlineFromDocument(fallbackAst),
      };
    }
    return { ast: null, outline: [] };
  }
};

const initialDocument = deriveDocumentFromHtml(initialHtml, null);
const emptyRoot: DocumentNode = { id: 'root', type: 'root', children: [] };
const initialAst = initialDocument.ast ?? emptyRoot;
const initialOutline = initialDocument.outline.length
  ? initialDocument.outline
  : buildOutlineFromDocument(initialAst);

export const useDocumentStore = create<DocumentState>((set, get) => ({
  content: initialHtml,
  ast: initialAst,
  outline: initialOutline,
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
  selectedNodeId: null,
  setContent: (content) => {
    const currentContent = get().content;
    if (currentContent === content) {
      return;
    }

    set((state) => {
      const { ast, outline } = deriveDocumentFromHtml(content, state.ast);
      const newPast = [...state.history.past, state.content].slice(-HISTORY_LIMIT);

      return {
        content,
        ast,
        outline,
        selectedNodeId: null,
        history: {
          past: newPast,
          future: [],
        },
      };
    });
  },
  setSelection: (selection) => set({ selection }),
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
      const { ast, outline } = deriveDocumentFromHtml(previous, state.ast);

      return {
        content: previous,
        ast,
        outline,
        selectedNodeId: null,
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
      const { ast, outline } = deriveDocumentFromHtml(next, state.ast);

      return {
        content: next,
        ast,
        outline,
        selectedNodeId: null,
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
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  updateTextNode: (id, value) =>
    set((state) => {
      if (!state.ast) {
        return state;
      }

      const { updated, changed } = updateTextNodeValue(state.ast, id, value);
      if (!changed) {
        return state;
      }

      const html = documentNodeToHtml(updated);
      const newPast = [...state.history.past, state.content].slice(-HISTORY_LIMIT);

      return {
        ast: updated,
        content: html,
        outline: buildOutlineFromDocument(updated),
        history: {
          past: newPast,
          future: [],
        },
      };
    }),
  moveNode: (nodeId, parentId, index) =>
    set((state) => {
      if (!state.ast) {
        return state;
      }

      try {
        // Convert DocumentNode AST to HAST for moveNodeById
        const hastRoot = documentNodeToHast(state.ast);
        if (hastRoot.type !== 'root') {
          return state;
        }

        // Move the node in HAST
        const updatedHast = moveNodeById(hastRoot, nodeId, parentId, index);

        // Convert back to DocumentNode
        const updated = hastToDocumentNode(updatedHast, createIdFactory());
        const html = documentNodeToHtml(updated);
        const newPast = [...state.history.past, state.content].slice(-HISTORY_LIMIT);

        return {
          ast: updated,
          content: html,
          outline: buildOutlineFromDocument(updated),
          history: {
            past: newPast,
            future: [],
          },
        };
      } catch (error) {
        console.warn('Failed to move node', error);
        return state;
      }
    }),
}));
