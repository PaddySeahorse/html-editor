# @html-editor/editor-ui

Real-time bidirectional linkage between Monaco editor and visual canvas via AST as the single source of truth.

## Features

- **Real-time Sync**: Code ↔ AST ↔ Canvas synchronization with <100ms latency
- **Debounced Parsing**: 50-100ms debounce on content changes to optimize performance
- **Selection Mapping**: Click canvas node → highlight code range, and vice versa
- **Error Handling**: Non-blocking error banner with best-effort recovery
- **Performance Monitoring**: Built-in tracking for ~300-500 node documents
- **Undo/Redo Hooks**: Ready for history implementation

## Installation

```bash
npm install @html-editor/editor-ui
```

## Usage

### Basic Editor

```tsx
import { Editor } from '@html-editor/editor-ui';

function App() {
  return (
    <Editor
      initialHtml="<div><h1>Hello World</h1></div>"
      debounceMs={75}
      splitRatio={0.5}
    />
  );
}
```

### Using Components Separately

```tsx
import { MonacoEditor, VisualCanvas, ErrorBanner } from '@html-editor/editor-ui';

function CustomLayout() {
  return (
    <div>
      <ErrorBanner />
      <MonacoEditor initialValue="<div>Content</div>" />
      <VisualCanvas />
    </div>
  );
}
```

### Using the Store Directly

```tsx
import { useEditorStore } from '@html-editor/editor-ui';

function CustomComponent() {
  const {
    htmlContent,
    ast,
    selectedNodeId,
    updateHtml,
    selectNode,
  } = useEditorStore();

  return (
    <div>
      <p>Selected: {selectedNodeId}</p>
      <button onClick={() => updateHtml('<div>New content</div>')}>
        Update
      </button>
    </div>
  );
}
```

### Performance Monitoring

```tsx
import { usePerformanceMonitor } from '@html-editor/editor-ui';

function PerformanceDisplay() {
  const metrics = usePerformanceMonitor(true);

  return (
    <div>
      Parse time: {metrics.parseTime.toFixed(2)}ms
      Node count: {metrics.nodeCount}
    </div>
  );
}
```

## Architecture

### Data Flow

#### Code → AST → Canvas
1. User types in Monaco editor
2. Change is debounced (50-100ms)
3. HTML is parsed to AST via `@html-editor/core-ast`
4. AST is normalized and IDs assigned
5. Index maps rebuilt
6. Canvas selectively updates nodes
7. Falls back to full re-render if needed

#### Canvas → AST → Code
1. User clicks canvas node
2. Node ID selected in store
3. AST mutations applied
4. HTML regenerated from AST
5. Monaco content updated
6. Cursor/selection preserved using offset maps

### Selection Mapping

- **Canvas to Code**: Node click → find text range via `byTextRange` map → highlight in Monaco
- **Code to Canvas**: Cursor position → convert to offset → find node at offset → highlight in canvas

## API

### Components

#### `<Editor>`
Main editor component with split view.

Props:
- `initialHtml?: string` - Initial HTML content
- `debounceMs?: number` - Debounce delay (default: 75ms)
- `splitRatio?: number` - Split ratio between code and canvas (default: 0.5)

#### `<MonacoEditor>`
Monaco editor wrapper with AST sync.

Props:
- `initialValue?: string` - Initial content
- `debounceMs?: number` - Debounce delay
- `onReady?: () => void` - Callback when editor is ready

#### `<VisualCanvas>`
Visual representation of the AST.

Props:
- `className?: string` - Additional CSS class

#### `<ErrorBanner>`
Non-blocking error display.

### Store

#### `useEditorStore`

State:
- `htmlContent: string` - Current HTML
- `ast: Root | null` - Current AST
- `indexMaps: NodeIndexMap | null` - ID and range maps
- `selectedNodeId: string | null` - Currently selected node
- `error: string | null` - Error message
- `isProcessing: boolean` - Processing state
- `cursorPosition: { line, column } | null` - Cursor position

Actions:
- `updateHtml(html: string)` - Update from HTML source
- `updateAst(ast: Root)` - Update from AST
- `selectNode(nodeId: string | null)` - Select/deselect node
- `replaceNode(nodeId: string, newNode: Element)` - Replace specific node
- `clearError()` - Clear error state
- `setCursorPosition(position)` - Update cursor position
- `initialize(html: string)` - Initialize editor

### Utilities

#### `getNodeRange(nodeId, indexMaps, htmlContent): CodeRange | null`
Get code range for a node.

#### `findNodeAtPosition(line, column, indexMaps, htmlContent): string | null`
Find node at cursor position.

#### `offsetToLineColumn(content, offset): { line, column }`
Convert offset to line/column.

#### `lineColumnToOffset(content, line, column): number`
Convert line/column to offset.

### Hooks

#### `useEditorSync(options)`
Monitor sync operations and performance.

Options:
- `onAstUpdate?: (html: string) => void`
- `onSelectionChange?: (nodeId: string | null) => void`
- `performanceThreshold?: number` - Warning threshold in ms

#### `usePerformanceMonitor(enabled)`
Track performance metrics.

Returns:
- `parseTime: number` - Parse duration
- `renderTime: number` - Render duration
- `totalTime: number` - Total duration
- `nodeCount: number` - Number of nodes

## Performance

### Targets
- **Typical edit latency**: <100ms
- **Document size**: 300-500 nodes
- **Debounce**: 50-100ms

### Optimization Strategies
- Debounced parsing to reduce parse frequency
- Selective canvas updates when possible
- Index maps for O(1) node lookup
- Lazy AST normalization

### Monitoring
Use `usePerformanceMonitor` to track actual performance and identify bottlenecks.

## Error Handling

### Parse Errors
- Non-blocking error banner displayed
- Last valid AST preserved
- Best-effort recovery attempted
- User can dismiss error and continue editing

### Invalid HTML
- Parser is permissive (fragment mode)
- Most HTML errors auto-corrected
- Unclosed tags handled gracefully

## Future Enhancements

- Undo/Redo with history stack (next task)
- Incremental parsing for large documents
- Virtual scrolling for canvas
- Custom node renderers
- Collaborative editing support

## License

See repository LICENSE file.
