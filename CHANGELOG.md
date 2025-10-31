# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-beta.1] - 2024-04-27

### Added

- Integrated the V1 tri-pane web workspace, canvas editing core, and AST infrastructure into the `release/v1-beta` branch.
- Promoted `@html-editor/core-ast` to a production-ready package with parsing, serialization, normalization, diff/patch utilities, and extensive Vitest coverage.
- Introduced `@html-editor/editor-ui` primitives for Monaco ↔ canvas synchronization, including selection mapping and error handling.
- Added the drag-and-drop canvas playground app (`@html-editor/canvas`) showcasing AST-backed visual editing, inline attribute editing, history coalescing, and DOMPurify sanitization.
- Hardened `@html-editor/web` with tri-pane layout, toolbar, outline panel, Monaco editor, and Playwright smoke tests.
- Added GitHub Actions workflow that runs lint, typecheck, unit, and E2E suites on pushes/PRs.

### Changed

- Bumped repository, web app, canvas app, and shared package versions to `1.0.0-beta.1` ahead of the beta release.
- Updated root documentation to outline the unified architecture, workspaces, and development scripts.

### Known Limitations

- Table elements render but are not yet editable in the canvas.
- Plugin system, markdown editing, collaborative mode, and AI-assisted features are deferred to post-beta milestones.

---

Previous development notes can be found in the implementation documents inside the repo.
