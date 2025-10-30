import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../src/store/editorStore.js';
import { resetIdCounter } from '@html-editor/core-ast';

describe('editorStore', () => {
  beforeEach(() => {
    resetIdCounter();
    useEditorStore.setState({
      htmlContent: '',
      ast: null,
      indexMaps: null,
      selectedNodeId: null,
      error: null,
      isProcessing: false,
      cursorPosition: null,
    });
  });

  it('should initialize with empty state', () => {
    const state = useEditorStore.getState();
    expect(state.htmlContent).toBe('');
    expect(state.ast).toBeNull();
    expect(state.selectedNodeId).toBeNull();
  });

  it('should update HTML and parse AST', () => {
    const { updateHtml } = useEditorStore.getState();
    const html = '<div><p>Test</p></div>';

    updateHtml(html);

    const state = useEditorStore.getState();
    expect(state.htmlContent).toBe(html);
    expect(state.ast).toBeDefined();
    expect(state.ast?.type).toBe('root');
    expect(state.indexMaps).toBeDefined();
  });

  it('should assign IDs to elements', () => {
    const { updateHtml } = useEditorStore.getState();
    const html = '<div><p>Test</p></div>';

    updateHtml(html);

    const state = useEditorStore.getState();
    expect(state.indexMaps?.byId.size).toBeGreaterThan(0);
  });

  it('should handle parse errors gracefully', () => {
    const { updateHtml } = useEditorStore.getState();

    updateHtml('<div><p>Unclosed');

    const state = useEditorStore.getState();
    expect(state.ast).toBeDefined();
  });

  it('should select nodes', () => {
    const { selectNode } = useEditorStore.getState();

    selectNode('node-1');

    const state = useEditorStore.getState();
    expect(state.selectedNodeId).toBe('node-1');
  });

  it('should clear selection', () => {
    const { selectNode } = useEditorStore.getState();

    selectNode('node-1');
    selectNode(null);

    const state = useEditorStore.getState();
    expect(state.selectedNodeId).toBeNull();
  });

  it('should clear errors', () => {
    const { clearError } = useEditorStore.getState();

    useEditorStore.setState({ error: 'Test error' });
    clearError();

    const state = useEditorStore.getState();
    expect(state.error).toBeNull();
  });

  it('should update cursor position', () => {
    const { setCursorPosition } = useEditorStore.getState();

    setCursorPosition({ line: 5, column: 10 });

    const state = useEditorStore.getState();
    expect(state.cursorPosition).toEqual({ line: 5, column: 10 });
  });

  it('should initialize with HTML content', () => {
    const { initialize } = useEditorStore.getState();
    const html = '<div>Initial content</div>';

    initialize(html);

    const state = useEditorStore.getState();
    expect(state.htmlContent).toBe(html);
    expect(state.ast).toBeDefined();
  });
});
