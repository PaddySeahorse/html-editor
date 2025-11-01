import { memo, useCallback } from 'react';
import { OutlineNode, useDocumentStore } from '../store/document';

interface OutlineTreeProps {
  nodes: OutlineNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const OutlineTree = ({ nodes, selectedId, onSelect }: OutlineTreeProps) => (
  <ul className="outline__list">
    {nodes.map((node) => {
      const isActive = node.id === selectedId;
      const handleClick = (event: React.MouseEvent | React.KeyboardEvent) => {
        event.stopPropagation();
        onSelect(node.id);
      };

      const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick(event);
        }
      };

      return (
        <li key={node.id}>
          <div
            className={`outline__item${isActive ? ' outline__item--active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            {node.label}
          </div>
          {node.children && node.children.length > 0 ? (
            <OutlineTree nodes={node.children} selectedId={selectedId} onSelect={onSelect} />
          ) : null}
        </li>
      );
    })}
  </ul>
);

const OutlinePanelComponent = () => {
  const { nodes, isCollapsed, toggleOutline, selectedNodeId, setSelectedNode } = useDocumentStore(
    (state) => ({
      nodes: state.outline,
      isCollapsed: state.ui.isOutlineCollapsed,
      toggleOutline: state.toggleOutline,
      selectedNodeId: state.selectedNodeId,
      setSelectedNode: state.setSelectedNode,
    })
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedNode(id);
    },
    [setSelectedNode]
  );

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
          <OutlineTree nodes={nodes} selectedId={selectedNodeId} onSelect={handleSelect} />
        )}
      </div>
    </aside>
  );
};

export const OutlinePanel = memo(OutlinePanelComponent);
