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
