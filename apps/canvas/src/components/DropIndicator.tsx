import { useDroppable } from '@dnd-kit/core';
import { ASTNode } from '../types/ast';
import { canDropIntoParent, createDropId } from '../utils/dnd';

interface DropIndicatorProps {
  parentId: string | null;
  parentNode: ASTNode | null;
  index: number;
  activeNode: ASTNode | null;
  activeDropId: string | null;
  currentDropTarget: { parentId: string | null; index: number } | null;
  isDragging: boolean;
  isEmpty?: boolean;
}

export function DropIndicator({
  parentId,
  parentNode,
  index,
  activeNode,
  activeDropId,
  currentDropTarget,
  isDragging,
  isEmpty = false,
}: DropIndicatorProps) {
  const dropId = createDropId(parentId, index);
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      type: 'drop-indicator',
      parentId,
      index,
    },
  });

  const matchesCurrentTarget =
    currentDropTarget?.parentId === parentId && currentDropTarget?.index === index;
  const shouldHighlight = isOver || activeDropId === dropId || matchesCurrentTarget;
  const isValid = canDropIntoParent(activeNode, parentNode);

  const classes = ['drop-indicator'];

  if (isEmpty) {
    classes.push('drop-indicator--empty');
  }

  if (isDragging) {
    classes.push('drop-indicator--visible');
  }

  if (shouldHighlight) {
    classes.push('drop-indicator--active');
  }

  const highlightInvalid = !isValid && (shouldHighlight || (isEmpty && isDragging));

  if (highlightInvalid) {
    classes.push('drop-indicator--invalid');
  }

  return (
    <div
      ref={setNodeRef}
      className={classes.join(' ')}
      data-valid={isValid}
      data-drop-id={dropId}
    >
      {isEmpty && isDragging ? (
        <span className="drop-indicator__label">
          {isValid ? 'Drop elements here' : 'Cannot drop here'}
        </span>
      ) : null}
    </div>
  );
}
