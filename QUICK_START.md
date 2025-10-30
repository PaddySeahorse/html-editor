# Quick Start Guide

Get up and running with the HTML Editor in 5 minutes.

## Prerequisites

- Node.js 18+ 
- npm 9+

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd html-editor

# Install dependencies
npm install

# Build all packages
npm run build
```

## Run Tests

```bash
npm test
```

Expected output: **77 tests passing** ✅

## Run the Demo

```bash
cd demo
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Try the Editor

The demo shows:

1. **Code Editor** (left): Monaco editor with HTML code
2. **Visual Canvas** (right): Live preview of your HTML

### Interactive Features

- ✏️ **Type in Monaco**: Changes appear in canvas within 75ms
- 🖱️ **Click canvas elements**: Code highlights automatically
- 📍 **Position cursor in code**: Canvas element highlights
- ❌ **Error handling**: Try invalid HTML - editor keeps working

### Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo (hook ready for history implementation)
- `Ctrl/Cmd + Shift + Z`: Redo (hook ready for history implementation)

## Use in Your Project

### Install Packages

```bash
npm install @html-editor/core-ast @html-editor/editor-ui
```

### Basic Usage

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

### Advanced Usage

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

  // Your custom logic here
}
```

## Core AST Usage

```typescript
import {
  parseHtml,
  toHtmlSync,
  assignIds,
  normalize,
  buildIndexMaps,
} from '@html-editor/core-ast';

// Parse HTML
const tree = parseHtml('<div><p>Hello</p></div>');

// Assign stable IDs
assignIds(tree);

// Normalize AST
normalize(tree);

// Build index maps
const maps = buildIndexMaps(tree);

// Serialize back to HTML
const html = toHtmlSync(tree);
```

## Performance Tips

### Debounce Timing

```tsx
// Faster updates (more CPU usage)
<Editor debounceMs={50} />

// Balanced (recommended)
<Editor debounceMs={75} />

// Slower updates (less CPU usage)
<Editor debounceMs={100} />
```

### Monitor Performance

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

## Common Recipes

### Custom Initial Content

```tsx
const initialHtml = `
<article>
  <h1>My Document</h1>
  <p>Start editing here...</p>
</article>
`;

<Editor initialHtml={initialHtml} />
```

### Split Ratio Adjustment

```tsx
// More space for code
<Editor splitRatio={0.7} />

// More space for canvas
<Editor splitRatio={0.3} />

// Equal split
<Editor splitRatio={0.5} />
```

### Handle Errors

```tsx
import { useEditorStore } from '@html-editor/editor-ui';

function ErrorHandler() {
  const { error, clearError } = useEditorStore();
  
  if (error) {
    console.error('Parse error:', error);
    // Handle error
  }
}
```

## Troubleshooting

### Build Errors

```bash
# Clean build
rm -rf packages/*/dist packages/*/node_modules
npm install
npm run build
```

### Test Failures

```bash
# Run tests with verbose output
npm test -- --reporter=verbose
```

### Monaco Not Loading

Make sure you have the peer dependencies:

```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

## Project Structure

```
html-editor/
├── packages/
│   ├── core-ast/          # Core AST library
│   └── editor-ui/         # Editor components
├── demo/                  # Demo application
├── SUMMARY.md            # Project overview
├── IMPLEMENTATION.md     # V1 details
└── IMPLEMENTATION_V2.md  # V2 details
```

## Documentation

- [Main README](./README.md) - Project overview
- [Core AST README](./packages/core-ast/README.md) - AST library docs
- [Editor UI README](./packages/editor-ui/README.md) - Editor component docs
- [Summary](./SUMMARY.md) - Complete feature list
- [Implementation V1](./IMPLEMENTATION.md) - AST core details
- [Implementation V2](./IMPLEMENTATION_V2.md) - Editor linkage details

## Next Steps

1. ✅ **Explore the demo** - See all features in action
2. 📖 **Read the docs** - Understand the architecture
3. 🧪 **Run the tests** - See comprehensive coverage
4. 🔨 **Build something** - Use the editor in your project

## Support

- Check [SUMMARY.md](./SUMMARY.md) for feature details
- Review test files for usage examples
- See demo app for integration patterns

## Performance Targets

| Metric | Target | Typical |
|--------|--------|---------|
| Parse latency | <100ms | 50-75ms |
| Update latency | <100ms | 50-75ms |
| Document size | 500 nodes | ✅ Tested |
| Memory usage | <100KB | ~65KB |

All targets met! ✅

---

**Ready to build?** Start with the demo and explore the examples!
