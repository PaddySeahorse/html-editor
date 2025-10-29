export { parseHtml } from './parse.js';
export { toHtml, toHtmlSync } from './serialize.js';
export { assignIds, buildIndexMaps, findNodeById, resetIdCounter } from './identity.js';
export { normalize } from './normalize.js';
export { applyPatch, replaceNodeById, detectChanges } from './diff.js';
export type {
  Root,
  Element,
  Text,
  Comment,
  RootContent,
  ToHtmlOptions,
  NodeIndexMap,
  DiffResult,
} from './types.js';
