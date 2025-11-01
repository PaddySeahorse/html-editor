import React, { memo, useCallback } from 'react';
import { useDocumentStore, type DocumentNode } from '../store/document';

interface RenderContext {
  selectedNodeId: string | null;
  onSelect: (id: string | null) => void;
  onTextChange: (id: string, value: string) => void;
}

const CanvasPaneComponent = () => {
  const { ast, selectedNodeId, setSelectedNode, updateTextNode } = useDocumentStore((state) => ({
    ast: state.ast,
    selectedNodeId: state.selectedNodeId,
    setSelectedNode: state.setSelectedNode,
    updateTextNode: state.updateTextNode,
  }));

  const handleClearSelection = useCallback(() => setSelectedNode(null), [setSelectedNode]);

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
      />
    );
  }, [ast, selectedNodeId, setSelectedNode, updateTextNode]);

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
}: {
  node: DocumentNode;
  selectedNodeId: string | null;
  onSelect: (id: string | null) => void;
  onTextChange: (id: string, value: string) => void;
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
}: RenderContext & { node: DocumentNode }) => {
  if (node.type === 'root') {
    return (
      <CanvasTree
        node={node}
        selectedNodeId={selectedNodeId}
        onSelect={onSelect}
        onTextChange={onTextChange}
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
}: RenderContext & { node: DocumentNode }) => {
  const tagName = String(node.properties?.tagName ?? 'div');
  const classNameValue =
    typeof node.properties?.className === 'string' ? node.properties?.className : undefined;
  const isSelected = selectedNodeId === node.id;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(node.id);
  };

  const childElements = (node.children ?? []).map((child) => (
    <RenderNode
      key={child.id}
      node={child}
      selectedNodeId={selectedNodeId}
      onSelect={onSelect}
      onTextChange={onTextChange}
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
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement(
    tagName,
    {
      ...elementProps,
      className: combinedClassName,
      onClick: handleClick,
      'data-node-id': node.id,
    },
    childElements.length > 0 ? childElements : undefined
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
