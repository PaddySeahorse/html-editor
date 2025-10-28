# HTML Editor

A modern web-based HTML editor built with performance, testing, and developer ergonomics in mind.

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
# Start the development server
pnpm dev

# The app will be available at http://localhost:5173
```

## Project Structure

```
html-editor/
├── apps/
│   └── web/                    # Main React application
│       ├── e2e/                # E2E tests (Playwright)
│       ├── src/
│       │   ├── store/          # Zustand state management
│       │   ├── App.tsx         # Main app component
│       │   └── main.tsx        # Entry point
│       └── package.json
├── packages/
│   ├── core-ast/               # HTML AST utilities (unified/rehype/hast)
│   │   ├── src/
│   │   │   ├── index.ts        # parse, toHtml, addIds functions
│   │   │   └── tests/
│   │   └── package.json
│   └── paste/                  # Clipboard handling utilities
│       ├── src/
│       │   └── index.ts        # readClipboard, writeClipboard functions
│       └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml              # CI pipeline (lint, test, e2e)
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── package.json                # Root package with scripts
```

## Available Scripts

### Root Scripts

- `pnpm dev` - Start the development server for the web app
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:watch` - Run unit tests in watch mode
- `pnpm e2e` - Run E2E tests with Playwright
- `pnpm e2e:ui` - Run E2E tests with Playwright UI
- `pnpm lint` - Lint all TypeScript files
- `pnpm lint:fix` - Lint and fix all TypeScript files
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting with Prettier
- `pnpm typecheck` - Run TypeScript type checking for all packages

### Workspace-Specific Scripts

```bash
# Run scripts in specific workspaces
pnpm --filter @html-editor/web dev
pnpm --filter @html-editor/core-ast build
```

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **Editor**: Monaco Editor
- **Testing**: Vitest (unit), Playwright (e2e), Testing Library
- **Linting**: ESLint with TypeScript and React plugins
- **Formatting**: Prettier
- **Package Manager**: pnpm with workspaces
- **CI/CD**: GitHub Actions

## Package Details

### @html-editor/web

The main React application featuring:

- Split layout with Monaco editor and canvas preview
- Zustand store for document state management
- Selection model types

### @html-editor/core-ast

HTML AST manipulation utilities:

- `parse(html: string)`: Parse HTML to HAST (Hypertext Abstract Syntax Tree)
- `toHtml(tree: Root)`: Convert HAST back to HTML string
- `addIds(tree: Root)`: Add unique `data-editor-id` attributes to elements

Built with unified, rehype, and hast utilities.

### @html-editor/paste

Clipboard handling utilities (skeleton for future integration):

- `readClipboard()`: Read HTML and text from clipboard
- `writeClipboard(data)`: Write HTML and text to clipboard

## CI/CD

The project includes a GitHub Actions workflow that runs on PRs and pushes to main:

1. **Lint**: ESLint and Prettier checks
2. **Typecheck**: TypeScript type checking across all packages
3. **Unit Tests**: Vitest unit tests
4. **E2E Tests**: Playwright smoke tests

## Git Hooks

The project uses Husky and lint-staged for pre-commit hooks:

- Lints and formats staged TypeScript files
- Formats staged JSON and Markdown files

## Development Guidelines

- Follow existing code conventions and patterns
- Write tests for new features
- Ensure all CI checks pass before merging
- Use meaningful commit messages

## License

See [LICENSE](./LICENSE) file for details.
