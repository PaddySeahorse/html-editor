# HTML Editor

A modern web-based HTML editor built with performance, testing, and developer ergonomics in mind. The platform is centered around a robust HTML Abstract Syntax Tree (AST) pipeline that powers real-time synchronization between the Monaco code editor and the visual canvas.

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
# Starts the web app dev server on http://localhost:5173
```

## Project Structure

```
html-editor/
├── apps/
│   └── web/                    # Main React application (tri-pane workspace)
│       ├── e2e/                # Playwright smoke tests
│       └── src/                # Canvas, Monaco, outline panes, Zustand store
├── demo/                       # Standalone demo powered by editor packages
├── packages/
│   ├── core-ast/               # HTML AST processing pipeline
│   ├── editor-ui/              # Shared editor UI components + state
│   └── paste/                  # Clipboard utilities
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root scripts and tooling
```

## Root Scripts

- `pnpm dev` - Start the development server for the web app
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:watch` - Run unit tests in watch mode
- `pnpm e2e` - Run Playwright smoke tests
- `pnpm e2e:ui` - Run Playwright tests in UI mode
- `pnpm lint` - Lint all TypeScript files
- `pnpm lint:fix` - Lint and fix TypeScript files
- `pnpm format` - Format files with Prettier
- `pnpm format:check` - Verify formatting
- `pnpm typecheck` - Run TypeScript type checking across the workspace

### Workspace-Specific Scripts

```bash
pnpm --filter @html-editor/web dev
pnpm --filter @html-editor/core-ast test
pnpm --filter @html-editor/editor-ui test
```

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **Editor**: Monaco Editor
- **Testing**: Vitest (unit) & Playwright (e2e)
- **Linting**: ESLint with TypeScript + React plugins
- **Formatting**: Prettier
- **Package Manager**: pnpm with workspaces
- **Automation**: GitHub Actions & Husky

## Packages

### @html-editor/core-ast

The core HTML AST processing library providing:

- Parse HTML to HAST with stable node identity
- Normalize trees for consistent comparison
- Serialize, diff, and patch utilities for efficient updates

See [packages/core-ast/README.md](./packages/core-ast/README.md) for detailed documentation.

### @html-editor/editor-ui

Real-time editor primitives used across the workspace:

- Monaco ↔ canvas synchronization with debounced parsing
- Selection mapping between code and visual panes
- Error handling and performance monitoring helpers

See [packages/editor-ui/README.md](./packages/editor-ui/README.md) for detailed documentation.

### @html-editor/paste

Clipboard handling utilities for ingesting and emitting HTML + text payloads.

## Demo Application

```bash
pnpm --filter html-editor-demo dev
```

Open http://localhost:5173 to try the interactive editor demo.

## Testing & Tooling

The project ships with automated linting, formatting, unit, and end-to-end testing. Husky + lint-staged run the most important checks pre-commit, and GitHub Actions validates every push and pull request.

## Architecture

The HTML Editor is built around a single source of truth: the HTML AST. All parsing, editing, serialization, and diffing operations flow through this representation to maintain consistency, enable undo/redo across code and canvas, and preserve semantic HTML.

## License

See [LICENSE](./LICENSE).
