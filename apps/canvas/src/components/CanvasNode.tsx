import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef } from 'react';
import { ASTNode } from '../types/ast';
import { useEditorStore } from '../store/editorStore';
import { canAcceptChildren } from '../utils/ast';
import { AddNodeMenu } from './AddNodeMenu';

interface CanvasNodeProps {
  node: ASTNode;
  index: number;
  parentId: string | null;
}

export function CanvasNode({ node }: CanvasNodeProps) {
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
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const isEditing = editingNodeId === node.id;
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    
    if (node.type === 'list' && node.children) {
      const ListTag = node.tag;
      return (
        <ListTag>
          <SortableContext
            items={node.children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {node.children.map((child, i) => (
              <CanvasNode key={child.id} node={child} index={i} parentId={node.id} />
            ))}
          </SortableContext>
        </ListTag>
      );
    }
    
    if (node.type === 'listItem') {
      return <span>{node.content}</span>;
    }
    
    if ((node.type === 'section' || node.type === 'container') && node.children) {
      return (
        <>
          <SortableContext
            items={node.children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {node.children.map((child, i) => (
              <CanvasNode key={child.id} node={child} index={i} parentId={node.id} />
            ))}
          </SortableContext>
          {canAcceptChildren(node) && (
            <AddNodeMenu parentId={node.id} index={node.children.length} />
          )}
        </>
      );
    }
    
    return null;
  };
  
  const getNodeLabel = () => {
    const labels: Record<string, string> = {
      section: 'Section',
      container: 'Container',
      text: 'Text',
      heading: `Heading (${node.tag})`,
      link: 'Link',
      image: 'Image',
      list: node.tag === 'ul' ? 'Unordered List' : 'Ordered List',
      listItem: 'List Item',
    };
    return labels[node.type] || node.type;
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-node ${node.type} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredNode(node.id)}
      onMouseLeave={() => setHoveredNode(null)}
      {...attributes}
      {...listeners}
    >
      <div className="node-header">
        <span className="node-label">{getNodeLabel()}</span>
        <div className="node-actions">
          <button onClick={handleDuplicate} title="Duplicate">⎘</button>
          <button onClick={handleDelete} title="Delete">×</button>
        </div>
      </div>
      <div className="node-body">
        {renderContent()}
      </div>
    </div>
  );
}
