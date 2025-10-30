# Changelog

All notable changes to @html-editor/core-ast will be documented in this file.

## [0.0.1] - 2024-10-28

### Added

- Initial implementation of core HTML AST pipeline
- `parseHtml()` - Parse HTML to HAST with position information using unified + rehype-parse
- `toHtml()` - Serialize HAST to HTML with optional Prettier formatting
- `toHtmlSync()` - Synchronous HTML serialization
- `assignIds()` - Assign stable data-id attributes to element nodes
- `buildIndexMaps()` - Build index maps for fast node lookup by ID and text range
- `findNodeById()` - Find element node by data-id
- `normalize()` - Normalize AST by:
  - Removing empty text nodes
  - Merging adjacent text nodes
  - Unwrapping redundant spans without attributes
  - Trimming whitespace in block elements
- `replaceNodeById()` / `applyPatch()` - Replace node by ID for targeted updates
- `detectChanges()` - Detect structural changes between trees
- Comprehensive unit tests with 49 test cases
- Integration tests with real-world HTML samples
- Full TypeScript definitions
- Tree-shakeable ES module exports
- Documentation and usage examples

### Technical Details

- Built on unified/rehype ecosystem (HAST format)
- ES2022 module output
- Source maps for debugging
- Declaration maps for IDE support
