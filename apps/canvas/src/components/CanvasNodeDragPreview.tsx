import { ASTNode } from '../types/ast';
import { getNodeLabel } from '../utils/nodeLabels';

interface CanvasNodeDragPreviewProps {
  node: ASTNode;
}

export function CanvasNodeDragPreview({ node }: CanvasNodeDragPreviewProps) {
  return (
    <div className="drag-overlay-node">
      <div className="drag-overlay-node__header">{getNodeLabel(node)}</div>
      <div className="drag-overlay-node__body">{renderPreviewContent(node)}</div>
    </div>
  );
}

function renderPreviewContent(node: ASTNode): JSX.Element | null {
  switch (node.type) {
    case 'text': {
      const Tag = node.tag as keyof JSX.IntrinsicElements;
      return <Tag>{node.content}</Tag> as JSX.Element;
    }
    case 'heading': {
      const HeadingTag = node.tag as keyof JSX.IntrinsicElements;
      return <HeadingTag>{node.content}</HeadingTag> as JSX.Element;
    }
    case 'link':
      return (
        <a href={node.href} onClick={(e) => e.preventDefault()}>
          {node.content}
        </a>
      );
    case 'image':
      return <img src={node.src} alt={node.alt} />;
    case 'list': {
      const ListTag = node.tag as keyof JSX.IntrinsicElements;
      return (
        <ListTag>
          {node.children?.map(child => (
            <li key={child.id}>
              {'content' in child ? child.content : getNodeLabel(child)}
            </li>
          ))}
        </ListTag>
      );
    }
    case 'listItem':
      return <span>{node.content}</span>;
    case 'section':
    case 'container':
      return (
        <div className="drag-overlay-node__children">
          {node.children && node.children.length > 0 ? (
            node.children.map(child => (
              <div key={child.id} className="drag-overlay-node__child">
                {renderPreviewContent(child)}
              </div>
            ))
          ) : (
            <div className="drag-overlay-node__placeholder">Empty {node.type}</div>
          )}
        </div>
      );
    default:
      return null;
  }
}
