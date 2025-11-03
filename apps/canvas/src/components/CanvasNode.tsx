import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ASTNode } from '../types/ast';
import { useEditorStore } from '../store/editorStore';
import { canAcceptChildren } from '../utils/ast';
import { AddNodeMenu } from './AddNodeMenu';
import { getNodeLabel } from '../utils/nodeLabels';

interface DropState {
  isActive: boolean;
  isValid: boolean;
}

type RenderChildrenFn = (
  parentId: string | null,
  parentNode: ASTNode | null,
  nodes: ASTNode[]
) => ReactNode;

interface CanvasNodeProps {
  node: ASTNode;
  index: number;
  parentId: string | null;
  renderChildren: RenderChildrenFn;
  dropState?: DropState;
  isRecentlyMoved?: boolean;
}

export function CanvasNode({
  node,
  index,
  parentId,
  renderChildren,
  dropState,
  isRecentlyMoved,
}: CanvasNodeProps) {
  const {
    selectedNodeId,
    hoveredNodeId,
    editingNodeId,
    setSelectedNode,
    setHoveredNode,
    setEditingNode,
    deleteNodeById,
    duplicateNodeById,
    updateNodeById,
  } = useEditorStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: 'canvas-node',
      parentId,
      index,
    },
  });
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const isEditing = editingNodeId === node.id;
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };
  
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(node.id);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'text' || node.type === 'heading') {
      setEditingNode(node.id);
    }
  };
  
  const handleBlur = () => {
    if (isEditing && contentRef.current) {
      const newContent = contentRef.current.textContent || '';
      if ('content' in node && newContent !== node.content) {
        updateNodeById(node.id, { content: newContent } as Partial<ASTNode>);
      }
      setEditingNode(null);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      contentRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setEditingNode(null);
      if (contentRef.current) {
        contentRef.current.textContent = 'content' in node ? node.content : '';
      }
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNodeById(node.id);
  };
  
  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNodeById(node.id);
  };
  
  const renderContent = () => {
    if (node.type === 'image') {
      return (
        <img
          src={node.src || 'https://via.placeholder.com/150'}
          alt={node.alt}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      );
    }
    
    if (node.type === 'text' || node.type === 'heading') {
      return (
        <div
          ref={contentRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`node-content ${isEditing ? 'editing' : ''}`}
          style={{
            outline: isEditing ? '2px solid #0066ff' : 'none',
            padding: '4px',
            minHeight: '1em',
          }}
        >
          {node.content}
        </div>
      );
    }
    
    if (node.type === 'link') {
      return (
        <a href={node.href} onClick={(e) => e.preventDefault()}>
          {node.content}
        </a>
      );
    }
    
    if (node.type === 'list') {
      const ListTag = node.tag as keyof JSX.IntrinsicElements;
      const children = node.children ?? [];
      return (
        <ListTag className="node-children node-children--list">
          {renderChildren(node.id, node, children)}
        </ListTag>
      );
    }
    
    if (node.type === 'listItem') {
      return <span>{node.content}</span>;
    }
    
    if (node.type === 'section' || node.type === 'container') {
      const children = node.children ?? [];
      return (
        <>
          <div className="node-children node-children--container">
            {renderChildren(node.id, node, children)}
          </div>
          {canAcceptChildren(node) && (
            <AddNodeMenu parentId={node.id} index={children.length} />
          )}
        </>
      );
    }
    
    return null;
  };
  
  const classes = ['canvas-node', node.type];
  
  if (isSelected) {
    classes.push('selected');
  }
  
  if (isHovered) {
    classes.push('hovered');
  }
  
  if (isDragging) {
    classes.push('dragging');
  }
  
  if (dropState?.isActive) {
    classes.push('drop-target');
    if (!dropState.isValid) {
      classes.push('drop-target-invalid');
    }
  }
  
  if (isRecentlyMoved) {
    classes.push('recently-moved');
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classes.join(' ')}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredNode(node.id)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      <div className="node-header">
        <div className="node-header__main">
          <button
            type="button"
            className="node-drag-handle"
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            aria-label={`Drag ${getNodeLabel(node)}`}
          >
            <span className="node-drag-handle__icon" aria-hidden="true">
              ⋮⋮
            </span>
          </button>
          <span className="node-label">{getNodeLabel(node)}</span>
        </div>
        <div className="node-actions">
          <button type="button" onClick={handleDuplicate} title="Duplicate">
            ⎘
          </button>
          <button type="button" onClick={handleDelete} title="Delete">
            ×
          </button>
        </div>
      </div>
      <div className="node-body">
        {renderContent()}
      </div>
    </div>
  );
}
