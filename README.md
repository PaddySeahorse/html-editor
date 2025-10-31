# HTML Editor

The HTML Editor project delivers a unified editing platform that keeps a real-time code view and a visual canvas in sync via a shared HTML AST pipeline. V1 beta bundles together the productionized AST core, synchronized editor UI primitives, and two front-end workspaces (tri-pane web app and drag-and-drop canvas playground).

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
# Launch the main tri-pane workspace (apps/web)
pnpm dev

# Launch the canvas playground workspace (apps/canvas)
pnpm dev:canvas

# Target a specific workspace manually
pnpm --filter @html-editor/web dev
pnpm --filter @html-editor/canvas dev
pnpm --filter demo dev
```

## Project Structure

```
html-editor/
├── apps/
│   ├── web/        # Tri-pane workspace (toolbar, outline, canvas, code editor)
│   └── canvas/     # Drag-and-drop canvas playground demo
├── demo/           # Lightweight showcase wired to shared packages
├── packages/
│   ├── core-ast/   # AST parsing, normalization, diffing, node identity
│   ├── editor-ui/  # Monaco + canvas primitives backed by AST index maps
│   └── paste/      # HTML/text clipboard utilities
├── .github/workflows/  # CI pipeline (lint, typecheck, unit, e2e)
├── pnpm-workspace.yaml # Workspace configuration
├── turbo.json          # Turborepo pipeline definition
└── package.json        # Root scripts and tooling
```

## Packages

### `@html-editor/core-ast`

- Parse HTML into rich HAST nodes (unified + rehype-parse)
- Serialize back to HTML with sync/async helpers and optional formatting
- Stable node identity, index maps, and diff/patch helpers
- Normalizers to keep markup well-formed while preserving semantics

See [packages/core-ast/README.md](./packages/core-ast/README.md) for full API and tests.

### `@html-editor/editor-ui`

- Real-time Monaco ↔ canvas synchronization powered by the AST core
- Bidirectional selection mapping and cursor telemetry
- Debounced parsing with resilient error handling and performance monitoring hooks

Documentation lives in [packages/editor-ui/README.md](./packages/editor-ui/README.md).

### `@html-editor/paste`

Clipboard helpers for reading/writing HTML + plaintext payloads (future integration target for the editor apps).

## Applications

### `@html-editor/web`

Tri-pane React workspace with toolbar controls, outline explorer, live canvas, and Monaco editor. Features undo/redo history, selection mapping stubs, keyboard shortcuts, and light/dark theming.

### `@html-editor/canvas`

Drag-and-drop visual editor playground showcasing AST-driven canvas interactions:

- Section/container/text/heading/link/image/list/listItem node types
- Inline editing, attribute editing, duplication, and history coalescing
- dnd-kit powered reordering with contextual insertion targets
- DOMPurify-backed sanitization when syncing with the HTML code view

### `demo`

A lightweight playground wired directly to the shared packages for experimentation.

## Core Features (V1 Beta)

- Visual canvas and Monaco code view stay in sync via a single AST source of truth
- Drag-and-drop editing, inline text editing, attribute editing, and undo/redo
- Stable node identity maps enable accurate selection and history tracking
- Clipboard helpers and paste infrastructure scaffold future workflows
- Comprehensive AST unit/integration tests plus Playwright smoke coverage for the tri-pane app

## Root Scripts

- `pnpm dev` – Start the tri-pane workspace
- `pnpm dev:canvas` – Start the canvas playground workspace
- `pnpm build` – Build every workspace/package
- `pnpm test` / `pnpm test:watch` – Run Vitest suites
- `pnpm e2e` / `pnpm e2e:ui` – Execute Playwright smoke tests
- `pnpm lint` / `pnpm lint:fix` – ESLint checks
- `pnpm format` / `pnpm format:check` – Prettier formatting
- `pnpm typecheck` – Project-wide TypeScript checks

## Quality & Tooling

- Husky + lint-staged enforce formatting and linting on commits
- Turborepo orchestrates cache-aware builds and checks across workspaces
- GitHub Actions CI runs lint, typecheck, unit, and E2E stages on pushes/PRs

## Architecture Overview

Everything centers on the HTML AST:

1. Incoming HTML is parsed once into a normalized tree with stable IDs
2. Monaco editor edits update the AST and re-render the canvas
3. Canvas operations mutate the AST, which serializes back into Monaco
4. Selection and index maps keep UI regions synchronized

This V1 beta lays the groundwork for future enhancements like collaborative editing, plugin systems, responsive previews, and advanced diffing.

## License

[MIT](./LICENSE)
