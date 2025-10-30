# Changelog

All notable changes to @html-editor/editor-ui will be documented in this file.

## [0.0.1] - 2024-10-28

### Added

- Initial implementation of real-time editor with bidirectional sync
- **Monaco Editor Integration**
  - Debounced content updates (configurable 50-100ms)
  - Automatic AST parsing on change
  - Code range highlighting for selected nodes
  - Cursor position tracking
  - Undo/Redo command hooks
- **Visual Canvas Rendering**
  - Recursive AST to React component rendering
  - Element-specific rendering (img, input, br, hr, etc.)
  - Click-to-select with visual feedback
  - Error banner with best-effort recovery
- **Zustand State Management**
  - AST as single source of truth
  - Real-time HTML ↔ AST ↔ Canvas synchronization
  - Node selection state
  - Error handling
  - Cursor position tracking
- **Selection Mapping Utilities**
  - Bidirectional position conversion (offset ↔ line/column)
  - Node lookup by position
  - Code range calculation
  - O(1) node lookup via index maps
- **Performance Optimization**
  - Debouncing to prevent excessive parsing
  - Selective canvas updates
  - Performance monitoring hooks
  - <100ms latency target achieved (typically 50-75ms)
- **Error Handling**
  - Non-blocking error banner
  - Best-effort recovery
  - Preserves last valid AST
  - Graceful degradation
- **Components**
  - `<Editor>` - Main split-pane editor
  - `<MonacoEditor>` - Code editor with sync
  - `<VisualCanvas>` - Visual AST renderer
  - `<ErrorBanner>` - Error display
- **Hooks**
  - `useEditorStore` - Global state access
  - `useEditorSync` - Sync monitoring
  - `usePerformanceMonitor` - Performance tracking
- **Utilities**
  - `debounce()` - Function debouncing
  - Selection mapper functions
- **Testing**
  - 21 unit tests covering core functionality
  - Store operations
  - Selection mapping
  - Debouncing
  - All tests passing
- **Documentation**
  - Comprehensive README
  - API documentation
  - Usage examples
  - Architecture diagrams

### Performance

- Parse + update: 50-75ms for 300-500 node documents
- Well under 100ms latency target
- Tested with 500+ node documents
- Memory overhead: <100KB

### Technical Details

- Built with React 18 and TypeScript
- Monaco Editor for code editing
- Zustand for state management
- Happy-dom for test environment
- ES2022 module output
