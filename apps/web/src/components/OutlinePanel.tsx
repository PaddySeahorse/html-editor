import { memo } from 'react';
import { OutlineNode, useDocumentStore } from '../store/document';

const OutlineTree = ({ nodes }: { nodes: OutlineNode[] }) => (
  <ul className="outline__list">
    {nodes.map((node) => (
      <li key={node.id}>
        <div className="outline__item">{node.label}</div>
        {node.children && node.children.length > 0 ? <OutlineTree nodes={node.children} /> : null}
      </li>
    ))}
  </ul>
);

const OutlinePanelComponent = () => {
  const { nodes, isCollapsed, toggleOutline } = useDocumentStore((state) => ({
    nodes: state.outline,
    isCollapsed: state.ui.isOutlineCollapsed,
    toggleOutline: state.toggleOutline,
  }));

  return (
    <aside className="panel outline-panel" aria-label="Document outline">
      <div className="panel__header">
        <span>Outline</span>
        <button type="button" onClick={toggleOutline}>
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      <div className="panel__body outline__body">
        {isCollapsed ? (
          <p className="outline__placeholder">Outline collapsed</p>
        ) : (
          <OutlineTree nodes={nodes} />
        )}
      </div>
    </aside>
  );
};

export const OutlinePanel = memo(OutlinePanelComponent);
