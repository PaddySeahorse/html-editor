import {
  parseHtml,
  toHtmlSync,
  assignIds,
  normalize,
  buildIndexMaps,
  replaceNodeById,
} from '../src/index.js';
import type { Element } from '../src/types.js';

// Example 1: Parse and serialize HTML
const html = '<div><p>Hello <strong>World</strong></p></div>';
const tree = parseHtml(html);
console.log('Parsed tree:', JSON.stringify(tree, null, 2));

const output = toHtmlSync(tree);
console.log('Serialized HTML:', output);

// Example 2: Assign IDs and build index
assignIds(tree);
const maps = buildIndexMaps(tree);
console.log('Number of elements:', maps.byId.size);

// Example 3: Find and replace a node
const firstElement = Array.from(maps.byId.values())[0];
if (firstElement) {
  const nodeId = firstElement.properties?.dataEditorId as string;
  console.log('First element ID:', nodeId);

  const newNode: Element = {
    type: 'element',
    tagName: 'div',
    properties: { dataEditorId: nodeId, className: ['updated'] },
    children: [{ type: 'text', value: 'Updated content' }],
  };

  replaceNodeById(tree, nodeId, newNode);
  console.log('After replacement:', toHtmlSync(tree));
}

// Example 4: Normalize HTML
const messyHtml = '<div>  <span>Text</span>  </div>';
const messyTree = parseHtml(messyHtml);
normalize(messyTree);
console.log('Normalized:', toHtmlSync(messyTree));
