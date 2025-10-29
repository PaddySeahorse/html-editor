import { ASTNode } from '../types/ast';

export function astToHtml(nodes: ASTNode[], indent = 0): string {
  const indentStr = '  '.repeat(indent);
  
  return nodes
    .map(node => {
      const attrs: string[] = [];
      
      if ('className' in node && node.className) {
        attrs.push(`class="${node.className}"`);
      }
      
      if (node.type === 'link' && 'href' in node) {
        attrs.push(`href="${node.href}"`);
      }
      
      if (node.type === 'image' && 'src' in node) {
        attrs.push(`src="${node.src}"`);
        attrs.push(`alt="${node.alt}"`);
      }
      
      const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
      
      if (node.type === 'image') {
        return `${indentStr}<${node.tag}${attrStr} />`;
      }
      
      const openTag = `<${node.tag}${attrStr}>`;
      const closeTag = `</${node.tag}>`;
      
      if ('content' in node && typeof node.content === 'string') {
        return `${indentStr}${openTag}${node.content}${closeTag}`;
      }
      
      if (node.children && node.children.length > 0) {
        const childrenHtml = astToHtml(node.children, indent + 1);
        return `${indentStr}${openTag}\n${childrenHtml}\n${indentStr}${closeTag}`;
      }
      
      return `${indentStr}${openTag}${closeTag}`;
    })
    .join('\n');
}

export function htmlToAst(html: string): ASTNode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;
  
  if (!container) return [];
  
  return Array.from(container.children).map(parseElement).filter((n): n is ASTNode => n !== null);
}

function parseElement(element: Element): ASTNode | null {
  const tagName = element.tagName.toLowerCase();
  const id = `node-${Math.random().toString(36).substr(2, 9)}`;
  const className = element.className || undefined;
  
  switch (tagName) {
    case 'section':
    case 'div': {
      const type = tagName === 'section' ? 'section' : 
                   (element.children.length > 0 ? 'container' : 'container');
      const children = Array.from(element.children)
        .map(parseElement)
        .filter((n): n is ASTNode => n !== null);
      
      if (type === 'section') {
        return {
          id,
          type: 'section',
          tag: 'section',
          className,
          children,
        };
      }
      
      return {
        id,
        type: 'container',
        tag: 'div',
        className,
        children,
      };
    }
    
    case 'p':
    case 'span':
      return {
        id,
        type: 'text',
        tag: tagName,
        content: element.textContent || '',
      };
    
    case 'h1':
    case 'h2':
    case 'h3':
      return {
        id,
        type: 'heading',
        tag: tagName,
        content: element.textContent || '',
      };
    
    case 'a':
      return {
        id,
        type: 'link',
        tag: 'a',
        href: (element as HTMLAnchorElement).href || '#',
        content: element.textContent || '',
      };
    
    case 'img':
      return {
        id,
        type: 'image',
        tag: 'img',
        src: (element as HTMLImageElement).src || '',
        alt: (element as HTMLImageElement).alt || '',
      };
    
    case 'ul':
    case 'ol': {
      const children = Array.from(element.children)
        .filter(el => el.tagName.toLowerCase() === 'li')
        .map(el => ({
          id: `node-${Math.random().toString(36).substr(2, 9)}`,
          type: 'listItem' as const,
          tag: 'li' as const,
          content: el.textContent || '',
        }));
      
      return {
        id,
        type: 'list',
        tag: tagName,
        children,
      };
    }
    
    default:
      return null;
  }
}
