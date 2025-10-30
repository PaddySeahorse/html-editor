import { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore.js';
import type { Element as HastElement, RootContent } from '@html-editor/core-ast';

export interface VisualCanvasProps {
  className?: string;
}

export function VisualCanvas({ className = '' }: VisualCanvasProps) {
  const { ast, selectedNodeId, selectNode, error } = useEditorStore();
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
        {ast && <CanvasContent ast={ast} selectedNodeId={selectedNodeId} onSelectNode={selectNode} />}
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
      <CanvasContent ast={ast} selectedNodeId={selectedNodeId} onSelectNode={selectNode} />
    </div>
  );
}

interface CanvasContentProps {
  ast: { children: RootContent[] };
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

function CanvasContent({ ast, selectedNodeId, onSelectNode }: CanvasContentProps) {
  return (
    <div className="canvas-root">
      {ast.children.map((child, index) => (
        <RenderNode
          key={index}
          node={child}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
        />
      ))}
    </div>
  );
}

interface RenderNodeProps {
  node: RootContent;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

function RenderNode({ node, selectedNodeId, onSelectNode }: RenderNodeProps) {
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
      />
    );
  }

  return null;
}

interface ElementNodeProps {
  element: HastElement;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

function ElementNode({ element, selectedNodeId, onSelectNode }: ElementNodeProps) {
  const nodeId = element.properties?.dataId as string | undefined;
  const isSelected = nodeId === selectedNodeId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      onSelectNode(nodeId);
    }
  };

  const className = [
    'canvas-element',
    `canvas-element-${element.tagName}`,
    isSelected ? 'canvas-element-selected' : '',
    element.properties?.className ? `${element.properties.className}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    border: isSelected ? '2px solid #007acc' : '1px solid transparent',
    padding: '4px',
    margin: '2px',
    cursor: 'pointer',
    transition: 'border-color 0.1s ease',
    position: 'relative',
  };

  const props: Record<string, any> = {};
  if (element.properties) {
    Object.entries(element.properties).forEach(([key, value]) => {
      if (key !== 'dataId' && key !== 'className') {
        props[key] = value;
      }
    });
  }

  const children = element.children.map((child: RootContent, index: number) => (
    <RenderNode
      key={index}
      node={child}
      selectedNodeId={selectedNodeId}
      onSelectNode={onSelectNode}
    />
  ));

  if (element.tagName === 'img') {
    return (
      <img
        {...props}
        className={className}
        style={style}
        onClick={handleClick}
        alt={props.alt || 'Image'}
      />
    );
  }

  if (element.tagName === 'input') {
    return (
      <input
        {...props}
        className={className}
        style={style}
        onClick={handleClick}
      />
    );
  }

  if (element.tagName === 'br') {
    return <br {...props} className={className} onClick={handleClick} />;
  }

  if (element.tagName === 'hr') {
    return <hr {...props} className={className} style={style} onClick={handleClick} />;
  }

  const Tag = element.tagName as keyof JSX.IntrinsicElements;

  return (
    <Tag {...props} className={className} style={style} onClick={handleClick}>
      {children}
    </Tag>
  );
}
