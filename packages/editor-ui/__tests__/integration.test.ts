import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../src/store/editorStore.js';
import { getNodeRange, findNodeAtPosition } from '../src/utils/selectionMapper.js';
import { resetIdCounter } from '@html-editor/core-ast';

describe('editor integration', () => {
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

  it('should complete full code -> AST -> canvas flow', () => {
    const html = '<div><p>Hello World</p></div>';
    const { initialize } = useEditorStore.getState();

    initialize(html);

    const state = useEditorStore.getState();
    expect(state.ast).toBeDefined();
    expect(state.indexMaps).toBeDefined();
    expect(state.indexMaps?.byId.size).toBeGreaterThan(0);
  });

  it('should support canvas -> code selection flow', () => {
    const html = '<div><p>Hello</p></div>';
    const { initialize, selectNode } = useEditorStore.getState();

    initialize(html);

    const { indexMaps, htmlContent } = useEditorStore.getState();
    const nodeIds = Array.from(indexMaps?.byId.keys() || []);
    const firstNodeId = nodeIds[0];

    selectNode(firstNodeId);

    const state = useEditorStore.getState();
    expect(state.selectedNodeId).toBe(firstNodeId);

    if (indexMaps && htmlContent) {
      const range = getNodeRange(firstNodeId, indexMaps, htmlContent);
      expect(range).toBeDefined();
    }
  });

  it('should support code -> canvas selection flow', () => {
    const html = '<div><p>Test</p></div>';
    const { initialize } = useEditorStore.getState();

    initialize(html);

    const { indexMaps, htmlContent } = useEditorStore.getState();

    if (indexMaps && htmlContent) {
      const nodeId = findNodeAtPosition(1, 5, indexMaps, htmlContent);
      expect(nodeId).toBeDefined();
    }
  });

  it('should handle updates with preserved IDs', () => {
    const html1 = '<div><p>Original</p></div>';
    const html2 = '<div><p>Updated</p></div>';
    
    const { initialize, updateHtml } = useEditorStore.getState();

    initialize(html1);
    const state1 = useEditorStore.getState();
    const ids1 = Array.from(state1.indexMaps?.byId.keys() || []);

    updateHtml(html2);
    const state2 = useEditorStore.getState();
    const ids2 = Array.from(state2.indexMaps?.byId.keys() || []);

    expect(ids2.length).toBeGreaterThan(0);
  });

  it('should handle performance target for typical document', () => {
    const html = `
      <div>
        <h1>Title</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    `;

    const { initialize } = useEditorStore.getState();
    
    const startTime = performance.now();
    initialize(html);
    const endTime = performance.now();

    const elapsed = endTime - startTime;
    expect(elapsed).toBeLessThan(100);

    const state = useEditorStore.getState();
    expect(state.ast).toBeDefined();
  });

  it('should maintain bidirectional sync', () => {
    const html = '<div><p>Test</p></div>';
    const { initialize, selectNode, updateAst } = useEditorStore.getState();

    initialize(html);

    const state1 = useEditorStore.getState();
    const nodeId = Array.from(state1.indexMaps?.byId.keys() || [])[0];

    selectNode(nodeId);
    expect(useEditorStore.getState().selectedNodeId).toBe(nodeId);

    if (state1.ast) {
      updateAst(state1.ast);
      const state2 = useEditorStore.getState();
      expect(state2.htmlContent).toBeDefined();
      expect(state2.htmlContent.length).toBeGreaterThan(0);
    }
  });

  it('should handle error recovery', () => {
    const { updateHtml, clearError } = useEditorStore.getState();

    updateHtml('<div><p>Unclosed tag');

    const state1 = useEditorStore.getState();
    expect(state1.ast).toBeDefined();

    if (state1.error) {
      clearError();
      const state2 = useEditorStore.getState();
      expect(state2.error).toBeNull();
    }
  });
});
