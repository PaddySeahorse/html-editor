import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import type { Root } from './types.js';

export function parseHtml(html: string): Root {
  const processor = unified().use(rehypeParse, {
    fragment: true,
    emitParseErrors: false,
    duplicateAttribute: false,
  });

  const tree = processor.parse(html);
  return tree as Root;
}
