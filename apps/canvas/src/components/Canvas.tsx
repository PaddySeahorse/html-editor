import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEditorStore } from '../store/editorStore';
import { CanvasNode } from './CanvasNode';
import { AddNodeMenu } from './AddNodeMenu';
import { InlineToolbar } from './InlineToolbar';
import { DropIndicator } from './DropIndicator';
import { CanvasNodeDragPreview } from './CanvasNodeDragPreview';
import { ASTNode } from '../types/ast';
import { findNodeById, findParentNode } from '../utils/ast';
import {
  ParsedDropId,
  canDropIntoParent,
  createDropId,
  parseDropId,
} from '../utils/dnd';

export function Canvas() {
  const { ast, moveNodeById, selectedNodeId } = useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDropId, setActiveDropId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ParsedDropId | null>(null);
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);

  useEffect(() => {
    if (!recentlyMovedId) return;

    const timeout = setTimeout(() => setRecentlyMovedId(null), 700);
    return () => clearTimeout(timeout);
  }, [recentlyMovedId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const activeNode = useMemo(
    () => (activeId ? findNodeById(ast, activeId) : null),
    [activeId, ast]
  );

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setActiveDropId(null);
    setDropTarget(null);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setActiveDropId(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setActiveDropId(null);
      setDropTarget(null);
      return;
    }

    const overId = String(over.id);
    setActiveDropId(overId);

    const parsed = parseDropId(overId);
    if (parsed) {
      setDropTarget(parsed);
    } else {
      setDropTarget(null);
    }
  }, []);

  const handleDragCancel = useCallback((_: DragCancelEvent) => {
    resetDragState();
  }, [resetDragState]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    const dropInfo = parseDropId(String(over.id));
    if (!dropInfo) {
      resetDragState();
      return;
    }

    const activeNodeId = String(active.id);
    const currentActiveNode = findNodeById(ast, activeNodeId);

    if (!currentActiveNode) {
      resetDragState();
      return;
    }

    const targetParentId = dropInfo.parentId;
    const targetParentNode = targetParentId ? findNodeById(ast, targetParentId) : null;

    if (!canDropIntoParent(currentActiveNode, targetParentNode)) {
      resetDragState();
      return;
    }

    const parentInfo = findParentNode(ast, activeNodeId);
    const originParentId = parentInfo?.parent ? parentInfo.parent.id : null;
    const originSiblings = parentInfo?.parentArray ?? ast;
    const originIndex = originSiblings.findIndex(node => node.id === activeNodeId);

    let targetIndex = dropInfo.index;

    if (originParentId === targetParentId && originIndex !== -1 && dropInfo.index > originIndex) {
      targetIndex = dropInfo.index - 1;
    }

    if (originParentId === targetParentId && originIndex === targetIndex) {
      resetDragState();
      return;
    }

    moveNodeById(activeNodeId, targetParentId, targetIndex);
    setRecentlyMovedId(activeNodeId);
    resetDragState();
  }, [ast, moveNodeById, resetDragState]);

  const renderNodes = useCallback(
    (parentId: string | null, parentNode: ASTNode | null, nodes: ASTNode[]) => {
      const contextId = parentId ?? 'root';
      const isDragging = Boolean(activeId);

      if (nodes.length === 0) {
        return (
          <SortableContext id={contextId} items={[]} strategy={verticalListSortingStrategy}>
            <DropIndicator
              key={createDropId(parentId, 0)}
              parentId={parentId}
              parentNode={parentNode}
              index={0}
              activeNode={activeNode}
              activeDropId={activeDropId}
              currentDropTarget={dropTarget}
              isDragging={isDragging}
              isEmpty
            />
          </SortableContext>
        );
      }

      return (
        <SortableContext
          id={contextId}
          items={nodes.map(node => node.id)}
          strategy={verticalListSortingStrategy}
        >
          {nodes.map((node, index) => {
            const isActiveDropParent = dropTarget?.parentId === node.id;
            const canAcceptActive = canDropIntoParent(activeNode, node);
            const dropState = {
              isActive: Boolean(isActiveDropParent),
              isValid: !isActiveDropParent || canAcceptActive,
            };

            return (
              <Fragment key={node.id}>
                <DropIndicator
                  key={createDropId(parentId, index)}
                  parentId={parentId}
                  parentNode={parentNode}
                  index={index}
                  activeNode={activeNode}
                  activeDropId={activeDropId}
                  currentDropTarget={dropTarget}
                  isDragging={isDragging}
                />
                <CanvasNode
                  node={node}
                  index={index}
                  parentId={parentId}
                  renderChildren={renderNodes}
                  dropState={dropState}
                  isRecentlyMoved={recentlyMovedId === node.id}
                />
              </Fragment>
            );
          })}
          <DropIndicator
            key={createDropId(parentId, nodes.length)}
            parentId={parentId}
            parentNode={parentNode}
            index={nodes.length}
            activeNode={activeNode}
            activeDropId={activeDropId}
            currentDropTarget={dropTarget}
            isDragging={isDragging}
          />
        </SortableContext>
      );
    },
    [activeDropId, activeId, activeNode, dropTarget, recentlyMovedId]
  );

  return (
    <div className="canvas">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="canvas-content">
          {renderNodes(null, null, ast)}
          <AddNodeMenu parentId={null} index={ast.length} />
        </div>
        <DragOverlay>
          {activeNode ? <CanvasNodeDragPreview node={activeNode} /> : null}
        </DragOverlay>
      </DndContext>
      {selectedNodeId && <InlineToolbar />}
    </div>
  );
}
