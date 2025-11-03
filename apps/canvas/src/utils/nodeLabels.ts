import { ASTNode } from '../types/ast';

export function getNodeLabel(node: ASTNode): string {
  switch (node.type) {
    case 'section':
      return 'Section';
    case 'container':
      return 'Container';
    case 'text':
      return 'Text';
    case 'heading':
      return `Heading (${node.tag})`;
    case 'link':
      return 'Link';
    case 'image':
      return 'Image';
    case 'list':
      return node.tag === 'ul' ? 'Unordered List' : 'Ordered List';
    case 'listItem':
      return 'List Item';
    default:
      return node.type;
  }
}
