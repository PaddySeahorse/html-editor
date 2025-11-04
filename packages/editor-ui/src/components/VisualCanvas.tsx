import { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore.js';
import { useDragDrop } from '../hooks/useDragDrop.js';
import type { Element as HastElement, RootContent } from '@html-editor/core-ast';

type ElementPropValue = string | number | boolean | null | undefined;
type SanitizedProps = Record<string, ElementPropValue>;

export interface VisualCanvasProps {
  className?: string;
}

export function VisualCanvas({ className = '' }: VisualCanvasProps) {
  const { ast, selectedNodeId, selectNode, error, isDragging, draggedNodeId, dragOffset } =
    useEditorStore();
  const { handleDragHandleMouseDown } = useDragDrop();
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [ast]);

  if (error) {
    return (
      <div className={`visual-canvas ${className}`}>
        <div className="error-banner">
          <strong>Parse Error:</strong> {error}
          <p>Showing last valid content or best-effort recovery.</p>
        </div>
        {ast && (
          <CanvasContent
            ast={ast}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
            isDragging={isDragging}
            draggedNodeId={draggedNodeId}
            dragOffset={dragOffset}
            onDragHandleMouseDown={handleDragHandleMouseDown}
            parentId={null}
          />
        )}
      </div>
    );
  }

  if (!ast) {
    return (
      <div className={`visual-canvas ${className}`}>
        <div className="placeholder">No content to display</div>
      </div>
    );
  }

  return (
    <div className={`visual-canvas ${className}`} key={renderKey}>
      <CanvasContent
        ast={ast}
        selectedNodeId={selectedNodeId}
        onSelectNode={selectNode}
        isDragging={isDragging}
        draggedNodeId={draggedNodeId}
        dragOffset={dragOffset}
        onDragHandleMouseDown={handleDragHandleMouseDown}
        parentId={null}
      />
    </div>
  );
}

interface CanvasContentProps {
  ast: { children: RootContent[] };
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  isDragging: boolean;
  draggedNodeId: string | null;
  dragOffset: { x: number; y: number };
  onDragHandleMouseDown: (
    e: React.MouseEvent<HTMLElement>,
    nodeId: string,
    parentId: string,
    index: number
  ) => void;
  parentId: string | null;
}

function CanvasContent({
  ast,
  selectedNodeId,
  onSelectNode,
  isDragging,
  draggedNodeId,
  dragOffset,
  onDragHandleMouseDown,
  parentId,
}: CanvasContentProps) {
  return (
    <div className="canvas-root">
      {ast.children.map((child, index) => (
        <RenderNode
          key={index}
          node={child}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          isDragging={isDragging}
          draggedNodeId={draggedNodeId}
          dragOffset={dragOffset}
          onDragHandleMouseDown={onDragHandleMouseDown}
          parentId={parentId}
          nodeIndex={index}
        />
      ))}
    </div>
  );
}

interface RenderNodeProps {
  node: RootContent;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  isDragging: boolean;
  draggedNodeId: string | null;
  dragOffset: { x: number; y: number };
  onDragHandleMouseDown: (
    e: React.MouseEvent<HTMLElement>,
    nodeId: string,
    parentId: string,
    index: number
  ) => void;
  parentId: string | null;
  nodeIndex: number;
}

function RenderNode({
  node,
  selectedNodeId,
  onSelectNode,
  isDragging,
  draggedNodeId,
  dragOffset,
  onDragHandleMouseDown,
  parentId,
  nodeIndex,
}: RenderNodeProps) {
  if (node.type === 'text') {
    return <span className="canvas-text">{node.value}</span>;
  }

  if (node.type === 'comment') {
    return <span className="canvas-comment">{`<!-- ${node.value} -->`}</span>;
  }

  if (node.type === 'element') {
    return (
      <ElementNode
        element={node}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
        isDragging={isDragging}
        draggedNodeId={draggedNodeId}
        dragOffset={dragOffset}
        onDragHandleMouseDown={onDragHandleMouseDown}
        parentId={parentId}
        nodeIndex={nodeIndex}
      />
    );
  }

  return null;
}

interface ElementNodeProps {
  element: HastElement;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  isDragging: boolean;
  draggedNodeId: string | null;
  dragOffset: { x: number; y: number };
  onDragHandleMouseDown: (
    e: React.MouseEvent<HTMLElement>,
    nodeId: string,
    parentId: string,
    index: number
  ) => void;
  parentId: string | null;
  nodeIndex: number;
}

function ElementNode({
  element,
  selectedNodeId,
  onSelectNode,
  isDragging,
  draggedNodeId,
  dragOffset,
  onDragHandleMouseDown,
  parentId,
  nodeIndex,
}: ElementNodeProps) {
  const nodeId = element.properties?.dataId as string | undefined;
  const isSelected = nodeId === selectedNodeId;
  const isDraggedNode = isDragging && nodeId === draggedNodeId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      onSelectNode(nodeId);
    }
  };

  const handleDragMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (nodeId && parentId !== undefined) {
      onDragHandleMouseDown(e, nodeId, parentId || 'root', nodeIndex);
    }
  };

  const classTokens = element.properties?.className;
  const className = [
    'canvas-element',
    `canvas-element-${element.tagName}`,
    isSelected ? 'canvas-element-selected' : '',
    isDraggedNode ? 'canvas-element-dragged' : '',
    Array.isArray(classTokens) ? classTokens.join(' ') : (classTokens ?? ''),
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    border: isSelected ? '2px solid #007acc' : '1px solid transparent',
    padding: '4px',
    margin: '2px',
    cursor: 'pointer',
    transition: isDragging && !isDraggedNode ? 'all 0.2s ease' : 'border-color 0.1s ease',
    position: 'relative',
    opacity: isDraggedNode ? 0.5 : 1,
    transform: isDraggedNode ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : undefined,
  };

  const elementProps: SanitizedProps = {};
  if (element.properties) {
    Object.entries(element.properties).forEach(([key, value]) => {
      if (key === 'dataId' || key === 'className') {
        return;
      }

      if (Array.isArray(value)) {
        elementProps[key] = value.join(' ');
        return;
      }

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined
      ) {
        elementProps[key] = value;
      }
    });
  }

  const children = element.children.map((child: RootContent, index: number) => (
    <RenderNode
      key={index}
      node={child}
      selectedNodeId={selectedNodeId}
      onSelectNode={onSelectNode}
      isDragging={isDragging}
      draggedNodeId={draggedNodeId}
      dragOffset={dragOffset}
      onDragHandleMouseDown={onDragHandleMouseDown}
      parentId={nodeId || null}
      nodeIndex={index}
    />
  ));

  const dragHandle = (
    <div
      className="canvas-drag-handle"
      style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '16px',
        height: '16px',
        backgroundColor: '#007acc',
        border: '1px solid #005a9c',
        borderRadius: '2px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        zIndex: 10,
      }}
      onMouseDown={handleDragMouseDown}
      title="Drag to move element"
    >
      <span style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>⋮</span>
    </div>
  );

  if (element.tagName === 'img') {
    const altValue = typeof elementProps.alt === 'string' ? elementProps.alt : undefined;

    return (
      <img
        {...elementProps}
        className={className}
        style={style}
        onClick={handleClick}
        alt={altValue ?? 'Image'}
        data-element-node="true"
        data-id={nodeId}
        data-parent-id={parentId || 'null'}
        data-index={nodeIndex}
      />
    );
  }

  if (element.tagName === 'input') {
    return (
      <input
        {...elementProps}
        className={className}
        style={style}
        onClick={handleClick}
        data-element-node="true"
        data-id={nodeId}
        data-parent-id={parentId || 'null'}
        data-index={nodeIndex}
      />
    );
  }

  if (element.tagName === 'br') {
    return (
      <br
        {...elementProps}
        className={className}
        onClick={handleClick}
        data-element-node="true"
        data-id={nodeId}
        data-parent-id={parentId || 'null'}
        data-index={nodeIndex}
      />
    );
  }

  if (element.tagName === 'hr') {
    return (
      <hr
        {...elementProps}
        className={className}
        style={style}
        onClick={handleClick}
        data-element-node="true"
        data-id={nodeId}
        data-parent-id={parentId || 'null'}
        data-index={nodeIndex}
      />
    );
  }

  const Tag = element.tagName as keyof JSX.IntrinsicElements;

  return (
    <Tag
      {...elementProps}
      className={className}
      style={style}
      onClick={handleClick}
      data-element-node="true"
      data-id={nodeId}
      data-parent-id={parentId || 'null'}
      data-index={nodeIndex}
    >
      {!isDraggedNode && dragHandle}
      {children}
    </Tag>
  );
}
