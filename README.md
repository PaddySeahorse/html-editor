# HTML Editor

A modern web-based HTML editor built with performance, ergonomics, and reliability in mind. The workspace pairs a visual canvas with a Monaco-powered code editor, all backed by a robust HTML Abstract Syntax Tree (AST) pipeline that keeps the two views perfectly in sync.

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- pnpm (recommended package manager)

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
# Starts the main web app at http://localhost:5173
```

### Workspace Scripts
```bash
pnpm --filter @html-editor/web dev        # Run the tri-pane editor
pnpm --filter @html-editor/web preview    # Preview a production build
pnpm --filter html-editor-demo dev        # Run the demo app
pnpm --filter @html-editor/core-ast test  # Core AST test suite
pnpm --filter @html-editor/editor-ui test # Editor UI test suite
```

## Project Structure
```
html-editor/
├── apps/
│   └── web/                    # Main React application (tri-pane workspace)
│       ├── e2e/                # Playwright smoke tests
│       └── src/                # Canvas, Monaco, outline panes, Zustand store
├── packages/
│   ├── core-ast/               # HTML AST processing pipeline
│   ├── editor-ui/              # Shared editor UI components + state
│   └── paste/                  # Clipboard utilities
├── demo/                       # Standalone demo powered by editor packages
├── turbo.json                  # Turbo build pipeline
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root tooling & scripts
```

## Features

### Visual Canvas & Code Sync
- **Visual Canvas** – Drag-and-drop editing with contextual insertion points
- **Code View** – Monaco editor kept in sync with the canvas in < 100 ms
- **Node Library** – Sections, containers, headings, text, links, images, lists, and list items
- **Attribute Editing** – Inline toolbar for editing link (href) and image (src/alt) attributes
- **Inline Text Editing** – Double-click to edit text or headings directly on the canvas

### Operations & History
- **Add / Delete / Duplicate** elements from the canvas
- **Reorder** elements with dnd-kit powered drag-and-drop
- **Undo / Redo** with keyboard shortcuts (Ctrl/Cmd + Z / Y) and toolbar buttons
- **Edit Coalescing** groups rapid edits to keep history clean

### Visual Feedback
- Selection highlighting with single-selection model
- Hover states, drop targets, and drag overlays for precise editing
- Error banner with graceful fallbacks when HTML parsing fails

## Usage

### Canvas View
1. Click nodes to select them (blue outline)
2. Drag nodes to reorder or move between containers
3. Use "+ Add Element" to insert new content
4. Double-click headings or text to edit inline
5. Use the inline toolbar to edit link/image attributes
6. Duplicate (⎘) or delete (×) nodes from their headers

### Code View
1. Edit the generated HTML directly
2. Blurring the editor re-parses the HTML into the AST
3. Invalid markup is sanitized and surfaces errors without crashing the UI

### Keyboard Shortcuts
- `Ctrl`/`Cmd` + `Z`: Undo
- `Ctrl`/`Cmd` + `Y` or `Ctrl`/`Cmd` + `Shift` + `Z`: Redo
- `Enter`: Commit inline edits
- `Escape`: Cancel inline edits

## Packages

### @html-editor/core-ast
- Parse HTML into HAST with stable node identities
- Normalize, diff, and serialize trees
- Comprehensive unit test coverage and detailed documentation

### @html-editor/editor-ui
- Monaco ↔ canvas synchronization primitives
- Selection mapping, debounced parsing, error handling, and performance helpers
- React components consumable by the web app and demo

### @html-editor/paste
- Clipboard utilities for ingesting and emitting HTML/text payloads

## Demo Application
```bash
pnpm --filter html-editor-demo dev
```
Open http://localhost:5173 to explore the editor packages in isolation.

## Testing & Tooling
- Automated linting, formatting, unit, and end-to-end tests via GitHub Actions
- Husky + lint-staged enforce formatting and lint rules on commit
- Playwright smoke tests cover the tri-pane UI

## Technology Stack
- React 18 + TypeScript
- Vite + pnpm workspace tooling
- Zustand for state management
- Monaco Editor for code editing
- dnd-kit for drag-and-drop interactions
- DOMPurify for sanitization
- Vitest & Playwright for automated testing
- ESLint & Prettier for linting/formatting

## License
See [LICENSE](./LICENSE).
