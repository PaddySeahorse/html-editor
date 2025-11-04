import { useRef } from 'react';
import { useEditorStore } from '../store/editorStore.js';

const DRAG_THRESHOLD = 5;

export function useDragDrop() {
  const {
    isDragging,
    draggedNodeId,
    dragOffset,
    startDrag,
    updateDragOffset,
    setDropTarget,
    completeDrag,
    cancelDrag,
  } = useEditorStore();

  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartThreshold = useRef(false);
  const draggedElement = useRef<Element | null>(null);

  const handleDragHandleMouseDown = (
    e: React.MouseEvent<HTMLElement>,
    nodeId: string,
    parentId: string,
    index: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartThreshold.current = false;
    draggedElement.current = e.currentTarget.closest('[data-element-node]');

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartPos.current.x;
      const deltaY = moveEvent.clientY - dragStartPos.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance >= DRAG_THRESHOLD && !dragStartThreshold.current) {
        dragStartThreshold.current = true;
        startDrag(nodeId, parentId, index, deltaX, deltaY);
      }

      if (dragStartThreshold.current) {
        const offsetX = moveEvent.clientX - dragStartPos.current.x;
        const offsetY = moveEvent.clientY - dragStartPos.current.y;
        updateDragOffset(offsetX, offsetY);

        const target = findDropTargetAtPosition(moveEvent.clientX, moveEvent.clientY, nodeId);
        if (target) {
          setDropTarget(target.parentId, target.index);
        }
      }
    };

    const handleMouseUp = () => {
      if (dragStartThreshold.current) {
        completeDrag();
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const findDropTargetAtPosition = (
    _clientX: number,
    clientY: number,
    draggedNodeId: string
  ): { parentId: string | null; index: number } | null => {
    const elements = document.querySelectorAll('[data-element-node]');
    type ClosestType = { element: HTMLElement; distance: number; isAbove: boolean };
    let closest: ClosestType | null = null;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      const dataId = el.getAttribute('data-id');
      if (dataId === draggedNodeId) continue;

      const rect = el.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenterY - clientY);
      const isAbove = clientY < elementCenterY;

      if (!closest || distance < closest.distance) {
        closest = { element: el, distance, isAbove };
      }
    }

    if (closest === null) return null;

    const element = closest.element;
    const parentId = element.getAttribute('data-parent-id');
    const indexStr = element.getAttribute('data-index') || '0';
    const index = parseInt(indexStr, 10);

    return {
      parentId: parentId === 'null' ? null : parentId,
      index: closest.isAbove ? index : index + 1,
    };
  };

  return {
    isDragging,
    draggedNodeId,
    dragOffset,
    handleDragHandleMouseDown,
    cancelDrag,
  };
}
