# HTML Editor

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
