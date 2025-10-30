import type { Root, Element, Text, Comment, RootContent } from 'hast';

export type { Root, Element, Text, Comment, RootContent };

export interface ToHtmlOptions {
  format?: boolean;
}

export interface NodeIndexMap {
  byId: Map<string, Element>;
  byTextRange: Map<string, { start: number; end: number }>;
}

export interface DiffResult {
  type: 'replace' | 'reparse';
  nodeId?: string;
  newNode?: Element;
}
