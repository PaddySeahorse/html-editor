# HTML Editor

<<<<<<< HEAD
A modern HTML editing platform that pairs a real-time code editor with a visual canvas, all synchronized through a shared AST pipeline. The workspace is optimized for performance, testing, and developer ergonomics.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- [pnpm](https://pnpm.io/) (recommended package manager)

### Installation

```bash
pnpm install
```

### Development

```bash
# Start the main web workspace
pnpm dev

# Or target specific workspaces
pnpm --filter @html-editor/web dev
pnpm --filter demo dev
```

## Project Structure

```
html-editor/
├── apps/
│   └── web/                    # Main React workspace (Monaco + canvas panes)
├── demo/                       # Lightweight showcase wired to core packages
├── packages/
│   ├── core-ast/               # AST processing, diffing, and identity helpers
│   ├── editor-ui/              # Shared editor primitives (Monaco + Canvas)
│   └── paste/                  # Clipboard helpers for HTML/text flows
├── .github/workflows/          # CI pipeline (lint, test, e2e)
├── turbo.json                  # Turborepo pipeline definition
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root scripts and tooling
```

## Packages

### `@html-editor/core-ast`

- Parse HTML into rich HAST nodes with positional data
- Serialize HAST back to HTML with formatting controls
- Stable node identity + index maps for selection synchronization
- Normalizers that keep markup well-formed
- Diff/Patch utilities for applying granular updates

See [packages/core-ast/README.md](./packages/core-ast/README.md) for the full API.

### `@html-editor/editor-ui`

- Real-time synchronization between Monaco and the visual canvas (<100ms target)
- Bidirectional selection mapping (canvas ↔ code)
- Debounced parsing with resilient error boundaries
- Instrumentation hooks for performance insights on large documents

See [packages/editor-ui/README.md](./packages/editor-ui/README.md) for details.

### `@html-editor/paste`

Clipboard integration shims for HTML editing pipelines:

- `readClipboard()` – read HTML + plain text payloads
- `writeClipboard(data)` – write HTML + text payloads

## Applications

### `@html-editor/web`

Tri-pane workspace featuring toolbar, outline, visual canvas, and Monaco editor panes. Powered by Zustand with undo/redo history, selection mapping stubs, keyboard shortcuts, and responsive theming.

### `demo`

A minimal showcase wired directly to the shared packages. Run it locally with:

```bash
pnpm --filter demo dev
```

## Root Scripts

- `pnpm dev` – Start development servers (defaults to `@html-editor/web`)
- `pnpm build` – Build every workspace
- `pnpm test` / `pnpm test:watch` – Run Vitest suites across packages
- `pnpm e2e` / `pnpm e2e:ui` – Execute Playwright smoke tests
- `pnpm lint` / `pnpm lint:fix` – ESLint across the repo
- `pnpm format` / `pnpm format:check` – Prettier formatting
- `pnpm typecheck` – TypeScript project references

## Testing & Quality

- Vitest for unit and integration coverage (happy-dom/jsdom environments)
- Playwright smoke coverage for the web workspace
- ESLint + Prettier enforced via Husky and lint-staged
- Turborepo orchestrates cache-aware builds and type checks

## Architecture

Everything converges on the HTML Abstract Syntax Tree (AST). The AST is parsed once, normalized, diffed, and fanned out to:

1. Monaco editor (code view)
2. Canvas renderer (visual view)
3. Selection/identity maps shared across both

Stable node IDs keep history, selections, and undo/redo coherent across interactions.

## License

See [LICENSE](./LICENSE).
=======
A visual HTML editor with canvas and code views, featuring drag-and-drop editing, undo/redo history, and real-time synchronization between views.

## Features

### Core Editing
- **Visual Canvas**: Edit HTML elements visually with drag-and-drop
- **Code View**: Direct HTML code editing with real-time sync
- **Node Types**: Section, Container, Text, Heading (h1-h3), Link, Image, List (ul/ol) with ListItem

### Operations
- **Add**: Insert new elements via inline menu
- **Delete**: Remove elements with delete button
- **Move**: Drag-and-drop reordering using dnd-kit
- **Duplicate**: Clone elements with all properties
- **Inline Editing**: Double-click text/heading elements for contentEditable editing
- **Attribute Editing**: Edit href (links) and alt/src (images) via inline toolbar

### History
- **Undo/Redo**: Full history stack with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **Edit Coalescing**: Rapid edits are grouped together for cleaner history

### Visual Feedback
- Selection highlighting
- Hover states
- Drag overlays
- Inline toolbars

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **dnd-kit** for drag-and-drop
- **Zustand** for state management
- **DOMPurify** for HTML sanitization

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Architecture

### AST-based Model
The editor uses an Abstract Syntax Tree (AST) representation of HTML:
- Each node has a unique ID, type, and properties
- Changes to the AST are immediately reflected in both views
- History is maintained at the AST level

### State Management
- Single source of truth in Zustand store
- All operations are atomic and go through the store
- History is maintained separately from current state

### Synchronization
- Canvas → Code: AST is serialized to HTML on every change
- Code → HTML: HTML is parsed back to AST on blur
- Both views always show the same underlying data

## Usage

### Canvas View
1. Click to select elements
2. Double-click text/headings to edit inline
3. Drag elements to reorder
4. Use "+ Add Element" to insert new elements
5. Use inline toolbar to edit link/image attributes
6. Click duplicate/delete buttons in node headers

### Code View
1. Edit HTML directly in the textarea
2. Changes sync to canvas on blur
3. Invalid HTML is gracefully handled

### Keyboard Shortcuts
- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+Y` / `Cmd+Y` / `Ctrl+Shift+Z`: Redo
- `Enter`: Save inline edit
- `Escape`: Cancel inline edit

## Limitations (V1)
- No plugin system
- No AI features
- No markdown support
- Tables render but are not editable
- No custom components
>>>>>>> origin/feat-canvas-editing-core
