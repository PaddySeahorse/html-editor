# @html-editor/core-ast

A minimal, robust HTML AST pipeline as the single source of truth for HTML editing operations.

## Features

- **Parse HTML** to HAST (Hypertext Abstract Syntax Tree) with position information
- **Serialize** HAST back to HTML with optional Prettier formatting
- **Node Identity** system with stable `data-id` attributes for tracking elements
- **Normalizers** to clean up and optimize AST structure
- **Diff/Patch** utilities for efficient tree updates

## Installation

```bash
npm install @html-editor/core-ast
```

## Usage

### Parsing HTML

```typescript
import { parseHtml } from '@html-editor/core-ast';

const html = '<div><p>Hello World</p></div>';
const tree = parseHtml(html);
```

### Serializing to HTML

```typescript
import { toHtml, toHtmlSync } from '@html-editor/core-ast';

// Async with optional formatting
const html = await toHtml(tree, { format: true });

// Synchronous
const html = toHtmlSync(tree);
```

### Node Identity

Assign stable IDs to track elements across edits:

```typescript
import { assignIds, buildIndexMaps, findNodeById } from '@html-editor/core-ast';

const tree = parseHtml(html);
assignIds(tree);

// Build index maps for fast lookups
const maps = buildIndexMaps(tree);
const node = maps.byId.get('node-1');

// Find node by ID
const found = findNodeById(tree, 'node-1');
```

### Normalization

Clean up and optimize the AST:

```typescript
import { normalize } from '@html-editor/core-ast';

const tree = parseHtml(html);
normalize(tree); // Removes empty text nodes, merges adjacent text, etc.
```

### Diff & Patch

Apply targeted updates to the tree:

```typescript
import { replaceNodeById, detectChanges } from '@html-editor/core-ast';

// Replace a specific node
replaceNodeById(tree, 'node-1', newNode);

// Detect structural changes between trees
const changes = detectChanges(oldTree, newTree);
```

## API

### `parseHtml(html: string): Root`

Parses HTML string into a HAST root node with position information.

### `toHtml(root: Root, options?: ToHtmlOptions): Promise<string>`

Serializes HAST to HTML string. Options:
- `format?: boolean` - Format output with Prettier

### `toHtmlSync(root: Root): string`

Synchronous version of `toHtml` without formatting.

### `assignIds(root: Root): Root`

Assigns stable `data-id` to all element nodes. IDs are preserved when already present.

### `buildIndexMaps(root: Root): NodeIndexMap`

Creates index maps for fast node lookups:
- `byId: Map<string, Element>` - Map from data-id to node
- `byTextRange: Map<string, { start, end }>` - Map from data-id to text offsets

### `findNodeById(root: Root, id: string): Element | undefined`

Finds an element node by its `data-id`.

### `normalize(root: Root): Root`

Normalizes the AST by:
- Removing empty text nodes
- Merging adjacent text nodes
- Unwrapping redundant spans without attributes
- Trimming whitespace in block elements

### `replaceNodeById(root: Root, nodeId: string, newNode: Element): Root`

Replaces a node identified by `data-id` with a new node.

### `detectChanges(oldRoot: Root, newRoot: Root): DiffResult[]`

Detects structural changes between two trees. Returns array of changes.

## Type Exports

```typescript
import type {
  Root,
  Element,
  Text,
  Comment,
  RootContent,
  ToHtmlOptions,
  NodeIndexMap,
  DiffResult,
} from '@html-editor/core-ast';
```

## Tree Structure

The package uses HAST (Hypertext Abstract Syntax Tree) format from the unified ecosystem:

- **Root**: Top-level container with `children` array
- **Element**: HTML element with `tagName`, `properties`, and `children`
- **Text**: Text content with `value` string
- **Comment**: HTML comment

All nodes include position information when parsed.

## License

See repository LICENSE file.
