import { toHtml as hastToHtml } from 'hast-util-to-html';
import prettier from 'prettier';
import type { Root, ToHtmlOptions } from './types.js';

export async function toHtml(root: Root, options: ToHtmlOptions = {}): Promise<string> {
  const html = hastToHtml(root, {
    allowDangerousCharacters: true,
    allowDangerousHtml: true,
    closeSelfClosing: true,
  });

  if (options.format) {
    return await prettier.format(html, {
      parser: 'html',
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
    });
  }

  return html;
}

export function toHtmlSync(root: Root): string {
  return hastToHtml(root, {
    allowDangerousCharacters: true,
    allowDangerousHtml: true,
    closeSelfClosing: true,
  });
}
