# Changelog

## 1.0.0-beta.1 (V1 Beta) - 2025-10-30

Highlights

- Tri-pane web app (toolbar, outline, canvas, Monaco code editor)
- Core HTML AST library with parse, serialize, identity, normalize, and diff utilities
- Real-time sync between code and visual canvas; selection mapping and error handling
- Canvas editing core: add/delete/move/duplicate, inline text edits, attribute editing, undo/redo
- E2E smoke tests (Playwright) and unit tests (Vitest) across packages

Known limitations (V1)

- No plugin system or AI features
- No markdown support
- Tables render but are not editable in canvas
- No custom components yet

Packages

- @html-editor/web: Tri-pane workspace with Monaco + visual canvas integration
- @html-editor/core-ast: Robust HTML AST pipeline (parseHtml, toHtml/toHtmlSync, assignIds, normalize, diff)
- @html-editor/editor-ui: Editor primitives (Monaco binding, visual canvas, selection mapping, performance monitor)
- @html-editor/canvas-core: Visual editing application showcasing canvas operations and history
- @html-editor/paste: Clipboard utilities (initial scaffolding)

Tooling

- pnpm workspaces with Turbo, ESLint, Prettier
- TypeScript builds per package; GitHub Actions run lint, typecheck, unit, and e2e
