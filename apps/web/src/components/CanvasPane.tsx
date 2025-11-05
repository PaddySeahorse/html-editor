import React, { memo, useCallback, useState, useRef } from 'react';
import { useDocumentStore, type DocumentNode } from '../store/document';

interface RenderContext {
  selectedNodeId: string | null;
  onSelect: (id: string | null) => void;
  onTextChange: (id: string, value: string) => void;
  onDragStart?: (
    id: string,
    parentId: string | null,
    index: number,
    clientX: number,
    clientY: number
  ) => void;
  isDragging?: boolean;
  draggedNodeId?: string | null;
  dragOffset?: { x: number; y: number };
}

const DRAG_THRESHOLD = 5;

const CanvasPaneComponent = () => {
  const { ast, selectedNodeId, setSelectedNode, updateTextNode, moveNode } = useDocumentStore(
    (state) => ({
      ast: state.ast,
      selectedNodeId: state.selectedNodeId,
      setSelectedNode: state.setSelectedNode,
      updateTextNode: state.updateTextNode,
      moveNode: state.moveNode,
    })
  );

  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragStartThresholdRef = useRef(false);

  const handleClearSelection = useCallback(() => setSelectedNode(null), [setSelectedNode]);

  const handleDragStart = useCallback(
    (
      nodeId: string,
      _parentId: string | null,
      _index: number,
      clientX: number,
      clientY: number
    ) => {
      dragStartPosRef.current = { x: clientX, y: clientY };
      dragStartThresholdRef.current = false;
      setDraggedNodeId(nodeId);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - dragStartPosRef.current.x;
        const deltaY = moveEvent.clientY - dragStartPosRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance >= DRAG_THRESHOLD && !dragStartThresholdRef.current) {
          dragStartThresholdRef.current = true;
          setIsDragging(true);
        }

        if (dragStartThresholdRef.current) {
          setDragOffset({
            x: moveEvent.clientX - dragStartPosRef.current.x,
            y: moveEvent.clientY - dragStartPosRef.current.y,
          });
        }
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        if (dragStartThresholdRef.current && nodeId) {
          // Find the closest target element
          const allElements = document.querySelectorAll('[data-node-id]');
          let closestElement: Element | null = null;
          let closestDistance = Infinity;
          let isAbove = true;

          allElements.forEach((el) => {
            const elId = el.getAttribute('data-node-id');
            if (elId === nodeId) return;

            const rect = el.getBoundingClientRect();
            const elementCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(elementCenterY - upEvent.clientY);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestElement = el;
              isAbove = upEvent.clientY < elementCenterY;
            }
          });

          if (closestElement && moveNode) {
            const targetParentId = (closestElement as HTMLElement).getAttribute('data-parent-id');
            const targetIndex = parseInt(
              (closestElement as HTMLElement).getAttribute('data-index') || '0',
              10
            );
            const finalIndex = isAbove ? targetIndex : targetIndex + 1;

            moveNode(nodeId, targetParentId === 'null' ? null : targetParentId, finalIndex);
          }
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        setIsDragging(false);
        setDraggedNodeId(null);
        setDragOffset({ x: 0, y: 0 });
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [moveNode]
  );

  const renderContent = useCallback(() => {
    if (!ast) {
      return <p className="canvas__placeholder">No document loaded.</p>;
    }

    return (
      <CanvasTree
        node={ast}
        selectedNodeId={selectedNodeId}
        onSelect={setSelectedNode}
        onTextChange={updateTextNode}
        onDragStart={handleDragStart}
        isDragging={isDragging}
        draggedNodeId={draggedNodeId}
        dragOffset={dragOffset}
        parentId={null}
      />
    );
  }, [
    ast,
    selectedNodeId,
    setSelectedNode,
    updateTextNode,
    handleDragStart,
    isDragging,
    draggedNodeId,
    dragOffset,
  ]);

  return (
    <section className="panel canvas-pane" aria-label="Rendered canvas">
      <div className="panel__header">
        <span>Canvas</span>
      </div>
      <div className="panel__body canvas__body">
        <div className="canvas__surface" onClick={handleClearSelection} role="presentation">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

const CanvasTree = ({
  node,
  selectedNodeId,
  onSelect,
  onTextChange,
  onDragStart,
  isDragging,
  draggedNodeId,
  dragOffset,
}: RenderContext & {
  node: DocumentNode;
  parentId?: string | null;
}) => {
  if (!node.children || node.children.length === 0) {
    return null;
  }

  return (
    <>
      {node.children.map((child) => (
        <RenderNode
          key={child.id}
          node={child}
          selectedNodeId={selectedNodeId}
          onSelect={onSelect}
          onTextChange={onTextChange}
          onDragStart={onDragStart}
          isDragging={isDragging}
          draggedNodeId={draggedNodeId}
          dragOffset={dragOffset}
          parentId={node.id}
        />
      ))}
    </>
  );
};

const RenderNode = ({
  node,
  selectedNodeId,
  onSelect,
  onTextChange,
  onDragStart,
  isDragging,
  draggedNodeId,
  dragOffset,
  parentId,
}: RenderContext & { node: DocumentNode; parentId: string | null }) => {
  // Find the index of this node in its parent
  const nodeIndex = 0;

  if (node.type === 'root') {
    return (
      <CanvasTree
        node={node}
        selectedNodeId={selectedNodeId}
        onSelect={onSelect}
        onTextChange={onTextChange}
        onDragStart={onDragStart}
        isDragging={isDragging}
        draggedNodeId={draggedNodeId}
        dragOffset={dragOffset}
        parentId={parentId}
      />
    );
  }

  if (node.type === 'element') {
    return (
      <ElementNode
        node={node}
        selectedNodeId={selectedNodeId}
        onSelect={onSelect}
        onTextChange={onTextChange}
        onDragStart={onDragStart}
        isDragging={isDragging}
        draggedNodeId={draggedNodeId}
        dragOffset={dragOffset}
        parentId={parentId}
        nodeIndex={nodeIndex}
      />
    );
  }

  if (node.type === 'text') {
    return (
      <CanvasTextNode
        node={node}
        isSelected={selectedNodeId === node.id}
        onSelect={onSelect}
        onTextChange={onTextChange}
      />
    );
  }

  if (node.type === 'comment') {
    return (
      <span className="canvas-comment" data-node-id={node.id}>
        {/* eslint-disable-next-line react/no-danger */}
        {`<!-- ${node.value ?? ''} -->`}
      </span>
    );
  }

  return null;
};

const ElementNode = ({
  node,
  selectedNodeId,
  onSelect,
  onTextChange,
  onDragStart,
  isDragging,
  draggedNodeId,
  dragOffset,
  parentId,
  nodeIndex,
}: RenderContext & {
  node: DocumentNode;
  parentId: string | null;
  nodeIndex: number;
}) => {
  const tagName = String(node.properties?.tagName ?? 'div');
  const classNameValue =
    typeof node.properties?.className === 'string' ? node.properties?.className : undefined;
  const isSelected = selectedNodeId === node.id;
  const isDraggedNode = isDragging && node.id === draggedNodeId;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(node.id);
  };

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (onDragStart) {
      onDragStart(node.id, parentId, nodeIndex, event.clientX, event.clientY);
    }
  };

  const childElements = (node.children ?? []).map((child) => (
    <RenderNode
      key={child.id}
      node={child}
      selectedNodeId={selectedNodeId}
      onSelect={onSelect}
      onTextChange={onTextChange}
      onDragStart={onDragStart}
      isDragging={isDragging}
      draggedNodeId={draggedNodeId}
      dragOffset={dragOffset}
      parentId={node.id}
    />
  ));

  const elementProps: Record<string, unknown> = {};
  if (node.properties) {
    for (const [key, value] of Object.entries(node.properties)) {
      if (key === 'tagName' || key === 'className') {
        continue;
      }
      elementProps[key] = value;
    }
  }

  const combinedClassName = [
    'canvas-node',
    classNameValue,
    isSelected ? 'canvas-node--selected' : '',
    isDraggedNode ? 'canvas-node-dragged' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const nodeStyle: React.CSSProperties = isDraggedNode
    ? {
        opacity: 0.5,
        transform: `translate(${dragOffset?.x || 0}px, ${dragOffset?.y || 0}px)`,
      }
    : {};

  const dragHandle = !isDraggedNode && (
    <div
      className="canvas-drag-handle"
      onMouseDown={handleDragStart}
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
      title="Drag to move element"
    >
      <span style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>⋮</span>
    </div>
  );

  return React.createElement(
    tagName,
    {
      ...elementProps,
      className: combinedClassName,
      style: nodeStyle,
      onClick: handleClick,
      'data-node-id': node.id,
      'data-element-node': 'true',
      'data-parent-id': parentId || 'null',
      'data-index': nodeIndex,
    },
    [dragHandle, ...(childElements.length > 0 ? childElements : [])]
  );
};

const CanvasTextNode = ({
  node,
  isSelected,
  onSelect,
  onTextChange,
}: {
  node: DocumentNode;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onTextChange: (id: string, value: string) => void;
}) => {
  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onSelect(node.id);
  };

  const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    const nextValue = event.currentTarget.textContent ?? '';
    const currentValue = node.value ?? '';
    if (nextValue !== currentValue) {
      onTextChange(node.id, nextValue);
    }
  };

  return (
    <span
      className={`canvas-text-node${isSelected ? ' canvas-text-node--selected' : ''}`}
      onClick={handleClick}
      contentEditable={isSelected}
      suppressContentEditableWarning
      onBlur={handleBlur}
      spellCheck={false}
      data-node-id={node.id}
    >
      {node.value ?? ''}
    </span>
  );
};

export const CanvasPane = memo(CanvasPaneComponent);
