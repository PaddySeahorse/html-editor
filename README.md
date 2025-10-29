# html-editor

A minimal, robust HTML editor foundation built around a clean AST (Abstract Syntax Tree) pipeline.

## Project Structure

```
html-editor/
├── packages/
│   ├── core-ast/          # Core HTML AST processing library
│   └── editor-ui/         # Real-time Monaco + Canvas editor
├── demo/                  # Demo application
└── ...
```

## Packages

### @html-editor/core-ast

The core HTML AST processing library providing:

- **Parse HTML** to HAST with position information
- **Serialize** HAST back to HTML with optional formatting
- **Node Identity** system for stable element tracking
- **Normalizers** for AST optimization
- **Diff/Patch** utilities for efficient updates

See [packages/core-ast/README.md](./packages/core-ast/README.md) for detailed documentation.

### @html-editor/editor-ui

Real-time bidirectional editor with Monaco and visual canvas:

- **Real-time Sync** between code and visual representation (<100ms latency)
- **Selection Mapping** - click canvas → highlight code, and vice versa
- **Debounced Parsing** for optimal performance
- **Error Handling** with non-blocking UI
- **Performance Monitoring** for large documents

See [packages/editor-ui/README.md](./packages/editor-ui/README.md) for detailed documentation.

## Development

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

### Demo Application

Run the interactive demo:

```bash
cd demo
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Architecture

The html-editor project is built around a single source of truth: the HTML Abstract Syntax Tree (AST). All operations - parsing, editing, serialization - flow through this central representation, ensuring consistency and enabling powerful features like:

- Stable node identity across edits
- Efficient incremental updates
- Semantic HTML preservation
- Tree-shakeable, modular design

## License

See [LICENSE](./LICENSE) file.
