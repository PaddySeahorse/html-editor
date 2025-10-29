export type NodeType = 
  | 'section'
  | 'container'
  | 'text'
  | 'heading'
  | 'link'
  | 'image'
  | 'list'
  | 'listItem';

export interface BaseNode {
  id: string;
  type: NodeType;
  children?: ASTNode[];
}

export interface SectionNode extends BaseNode {
  type: 'section';
  tag: 'div' | 'section';
  className?: string;
}

export interface ContainerNode extends BaseNode {
  type: 'container';
  tag: 'div';
  className?: string;
}

export interface TextNode extends BaseNode {
  type: 'text';
  tag: 'p' | 'span';
  content: string;
  children?: never;
}

export interface HeadingNode extends BaseNode {
  type: 'heading';
  tag: 'h1' | 'h2' | 'h3';
  content: string;
  children?: never;
}

export interface LinkNode extends BaseNode {
  type: 'link';
  tag: 'a';
  href: string;
  content: string;
  children?: never;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  tag: 'img';
  src: string;
  alt: string;
  children?: never;
}

export interface ListNode extends BaseNode {
  type: 'list';
  tag: 'ul' | 'ol';
  children: ListItemNode[];
}

export interface ListItemNode extends BaseNode {
  type: 'listItem';
  tag: 'li';
  content: string;
  children?: never;
}

export type ASTNode =
  | SectionNode
  | ContainerNode
  | TextNode
  | HeadingNode
  | LinkNode
  | ImageNode
  | ListNode
  | ListItemNode;

export interface EditorState {
  ast: ASTNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
}

export interface HistoryState {
  past: ASTNode[][];
  present: ASTNode[];
  future: ASTNode[][];
}
