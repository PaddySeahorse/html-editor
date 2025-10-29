export { Editor } from './components/Editor.js';
export { MonacoEditor } from './components/MonacoEditor.js';
export { VisualCanvas } from './components/VisualCanvas.js';
export { ErrorBanner } from './components/ErrorBanner.js';

export { useEditorStore } from './store/editorStore.js';
export type { EditorState } from './store/editorStore.js';

export { useEditorSync } from './hooks/useEditorSync.js';
export { usePerformanceMonitor } from './hooks/usePerformanceMonitor.js';

export {
  getNodeRange,
  findNodeAtPosition,
  findNodeAtOffset,
  offsetToLineColumn,
  lineColumnToOffset,
} from './utils/selectionMapper.js';
export type { CodeRange } from './utils/selectionMapper.js';

export { debounce } from './utils/debounce.js';
