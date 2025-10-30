# Implementation Summary: AST Core (Simplified)

## Overview

Successfully implemented a minimal, robust HTML AST pipeline as the single source of truth for V1.

## Completed Work

### 1. Project Structure

- ✅ Set up monorepo with npm workspaces
- ✅ Created `packages/core-ast` package structure
- ✅ Configured TypeScript with ES modules
- ✅ Set up Vitest for testing
- ✅ Configured Turbo for build orchestration
- ✅ Added .gitignore for proper version control

### 2. Core Functionality

#### Parsing (`src/parse.ts`)

- ✅ `parseHtml(html: string) -> HAST Root` with position info
- ✅ Uses unified + rehype-parse
- ✅ Fragment mode for flexible HTML parsing

#### Serialization (`src/serialize.ts`)

- ✅ `toHtml(root: HAST) -> string` async with formatting support
- ✅ `toHtmlSync(root: HAST) -> string` synchronous version
- ✅ Uses hast-util-to-html
- ✅ Optional Prettier formatting via plugin-html

#### Node Identity (`src/identity.ts`)

- ✅ `assignIds(root)` - Assigns stable data-id to element nodes
- ✅ `buildIndexMaps(root)` - Creates:
  - `byId: Map<string, Element>` for node lookup
  - `byTextRange: Map<string, { start, end }>` for text offsets
- ✅ `findNodeById(root, id)` - Fast node lookup
- ✅ `resetIdCounter()` - Reset for testing

#### Normalizers (`src/normalize.ts`)

- ✅ Remove empty text nodes
- ✅ Merge adjacent text nodes
- ✅ Unwrap redundant spans without attributes (preserves data-id)
- ✅ Trim whitespace in block elements (safe trimming)

#### Diff/Patch (`src/diff.ts`)

- ✅ `replaceNodeById(root, id, newNode)` - Replace by ID
- ✅ `applyPatch(root, id, newNode)` - Apply targeted patch
- ✅ `detectChanges(oldRoot, newRoot)` - Detect structural changes
- ✅ Full reparse fallback acceptable for V1

### 3. Testing

#### Unit Tests (49 tests, all passing)

**parse.test.ts** (6 tests)

- Simple HTML parsing
- Nested elements
- Attributes (handles className array format)
- Multiple root elements
- Self-closing tags
- Whitespace preservation

**serialize.test.ts** (5 tests)

- Simple serialization
- Nested HTML
- Attribute preservation
- Optional formatting
- Synchronous mode

**identity.test.ts** (7 tests)

- ID assignment to all elements
- Unique ID generation
- Existing ID preservation
- Index map building
- Node lookup by ID

**normalize.test.ts** (6 tests)

- Empty text node removal
- Adjacent text merging
- Redundant span unwrapping
- Span preservation with attributes
- Whitespace trimming
- Complex nested structures

**diff.test.ts** (6 tests)

- Node replacement by ID
- Error handling for non-existent IDs
- Patch application
- Change detection (additions/removals)
- No changes scenario

**roundtrip.test.ts** (11 tests)

- Simple HTML round-trips
- Nested element preservation
- Attribute preservation
- Self-closing tags
- Lists
- data-id preservation
- Complex nested structures
- Normalization stability
- Multiple round-trips
- Special characters
- Empty elements

**integration.test.ts** (8 tests)

- Blog post HTML
- Form HTML with inputs
- Navigation menus
- Editing workflows
- Table structures
- Semantic HTML5
- Media content
- Data/ARIA attributes

### 4. Build & Quality

- ✅ TypeScript compilation to ES2022
- ✅ Source maps generated
- ✅ Declaration maps for IDE support
- ✅ Tree-shakeable ES module exports
- ✅ All type checks passing
- ✅ No markdown/AI/plugin code included

### 5. Documentation

- ✅ Package README with API documentation
- ✅ Usage examples
- ✅ Root README updated
- ✅ CHANGELOG created
- ✅ Type exports documented

## Acceptance Criteria Status

### ✅ Round-trip Stability

- All snapshot tests pass
- Semantically equivalent output (normalized differences allowed)
- 11 dedicated round-trip tests + 8 integration tests

### ✅ Stable Node Identity

- Each element node receives stable data-id
- IDs preserved across non-structural edits
- IDs not overwritten when already present
- Fast lookup via index maps

### ✅ Tree-shakeable Build

- ES module exports
- No markdown/AI/plugin code
- Clean dist/ output with only necessary files
- Source maps for debugging

## Technical Highlights

1. **HAST Format**: Uses industry-standard Hypertext AST from unified ecosystem
2. **Position Information**: All nodes include start/end positions and offsets
3. **Attribute Handling**: Properly handles rehype-parse's className array format
4. **Safe Normalization**: Preserves semantic meaning while optimizing tree
5. **Flexible Serialization**: Both sync and async modes supported
6. **Comprehensive Testing**: 49 tests covering all major use cases

## Performance Considerations

- Efficient node lookup via Map-based indexes
- Single-pass normalization
- Minimal tree traversal with unist-util-visit
- Lazy index building (only when needed)

## Dependencies

**Production:**

- unified: ^11.0.4 (AST processor)
- rehype-parse: ^9.0.0 (HTML parser)
- hast-util-to-html: ^9.0.0 (HTML serializer)
- unist-util-visit: ^5.0.0 (Tree traversal)
- prettier: ^3.1.0 (Formatting)

**Development:**

- typescript: ^5.3.0
- vitest: ^1.0.4
- @types/hast: ^3.0.3
- @types/node: ^20.10.0

## Future Enhancements (Post-V1)

- More sophisticated diff algorithm
- Incremental parsing
- Virtual DOM integration
- WYSIWYG editor integration
- Undo/redo support
- Collaborative editing hooks

## Conclusion

The core AST package is complete and production-ready for V1. All acceptance criteria met, comprehensive test coverage achieved, and documentation provided.

# Canvas Editing Core Features - Implementation

## Overview

This implementation provides a complete visual HTML editor with canvas and code views, featuring drag-and-drop editing, undo/redo history, and real-time synchronization.

## Features Implemented

### 1. Node Types

All required node types are fully implemented with TypeScript types in `src/types/ast.ts`:

- **Section**: Container element (section/div tag)
- **Container**: Generic div container
- **Text**: Paragraph or span elements with editable content
- **Heading**: H1, H2, H3 elements with editable content
- **Link**: Anchor elements with href attribute
- **Image**: Image elements with src and alt attributes
- **List**: Unordered (ul) or ordered (ol) lists
- **ListItem**: Individual list items (li)

### 2. Operations

#### Add

- Interactive `AddNodeMenu` component provides a dropdown menu to add new elements
- Menu is context-aware and appears at appropriate insertion points
- Supports adding all node types with sensible defaults

#### Delete

- Delete button (×) in node header
- Removes node and all children from the AST
- Updates both views immediately

#### Move (Drag and Drop)

- Implemented using `@dnd-kit/core` and `@dnd-kit/sortable`
- Visual feedback during drag (overlay, opacity changes)
- Supports reordering within parent and moving between containers
- 8px activation distance to prevent accidental drags

#### Duplicate

- Duplicate button (⎘) in node header
- Recursively clones node with new unique IDs
- Inserts copy adjacent to original

#### Inline Text Editing

- Double-click Text or Heading nodes to enable contentEditable
- Enter to save, Escape to cancel
- Visual outline when editing (blue border)
- Text sanitization on save

#### Attribute Editing

- Inline toolbar appears when node is selected
- **Links**: Edit href attribute
- **Images**: Edit src and alt attributes
- Simple form with Save/Cancel buttons

### 3. History Management

The history system is integrated into the Zustand store (`src/store/editorStore.ts`):

#### Undo/Redo Stack

- Maintains separate `past` and `future` arrays of AST snapshots
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y or Ctrl+Shift+Z (redo)
- Toolbar buttons show enabled/disabled state

#### Edit Coalescing

- Rapid edits within 500ms are coalesced into a single history entry
- Prevents history pollution from typing
- Configurable `coalesceDelay` parameter

#### Behavior

- All operations push to history before executing
- Undo/redo works across both canvas and code views
- Making a new change clears the future (redo) stack

### 4. Visual Cues

#### Selection

- Selected nodes have blue border and light blue background
- Single selection model (one node at a time)
- Click to select, click elsewhere to deselect

#### Hover States

- Nodes show lighter blue border on hover
- Helps identify clickable areas
- Hover state is tracked in store

#### Drop Targets

- dnd-kit provides visual feedback for valid drop targets
- Drag overlay shows what's being dragged
- Insertion indicators show where element will be placed

#### Inline Toolbar

- Fixed position at bottom center of screen
- Shows selected node type
- Contains attribute editing controls
- Dark theme for contrast

### 5. Synchronization

#### Canvas → Code

- AST changes immediately trigger HTML serialization via `astToHtml()`
- Code view updates to reflect canvas changes
- Indented HTML output for readability

#### Code → Canvas

- Code editor updates on blur
- HTML parsed back to AST via `htmlToAst()`
- Uses browser's DOMParser API
- Gracefully handles invalid HTML

#### Both Ways

- Single source of truth: the AST in Zustand store
- Both views are reactive subscribers to the same state
- No data duplication or sync conflicts

## Architecture

### State Management

- **Zustand store**: Single centralized state
- **Immutable updates**: All operations return new AST
- **Pure functions**: AST utilities have no side effects

### AST Design

- Each node has unique string ID
- Nodes are discriminated unions by `type` field
- Type-safe with TypeScript
- Supports hierarchical structures (children arrays)

### Component Structure

```
App
├── Toolbar (undo/redo buttons)
└── Editor Container
    ├── Canvas Pane
    │   └── Canvas
    │       ├── CanvasNode (recursive)
    │       │   ├── Node Header (label, actions)
    │       │   ├── Node Body (content/children)
    │       │   └── AddNodeMenu
    │       └── InlineToolbar
    └── Code Pane
        └── CodeEditor (textarea)
```

### Utilities

- **ast.ts**: Node manipulation (find, insert, delete, update, move, duplicate)
- **html.ts**: Serialization and parsing (AST ↔ HTML)
- **sanitize.ts**: HTML sanitization using DOMPurify

## Security

- All HTML input is sanitized using DOMPurify
- Only allowed tags: p, span, h1-h3, a, div, section, ul, ol, li, img
- Only allowed attributes: href, src, alt, class
- Content is kept (not stripped)

## Limitations (V1)

As specified in the ticket:

- No plugin system
- No AI features
- No markdown support
- Tables will render in HTML view but are not editable in canvas
- No custom components

## Testing the Implementation

### Manual Testing Checklist

1. **Add nodes**: Click "+ Add Element", try each node type
2. **Delete nodes**: Click × button, verify removal
3. **Move nodes**: Drag nodes to reorder
4. **Duplicate nodes**: Click ⎘ button, verify copy appears
5. **Inline edit**: Double-click text/heading, type, press Enter
6. **Attribute edit**: Select link/image, click "Edit Attributes", modify, save
7. **Undo/Redo**: Make changes, press Ctrl+Z to undo, Ctrl+Y to redo
8. **Canvas to Code**: Add element in canvas, check code view updates
9. **Code to Canvas**: Edit HTML in code view, blur textarea, check canvas updates
10. **Selection**: Click nodes, verify blue border appears
11. **Hover**: Hover over nodes, verify hover effect

### Build Verification

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Development server
npm run dev
```

All checks pass successfully! ✓

## Future Enhancements (Not in V1)

The architecture supports future additions:

- Tables editing
- Custom components
- Plugin system
- Markdown support
- AI-assisted editing
- Collaborative editing
- More node types (button, form, etc.)
- CSS editing
- Responsive preview modes
