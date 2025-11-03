import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { CanvasNode } from './CanvasNode';
import { AddNodeMenu } from './AddNodeMenu';
import { InlineToolbar } from './InlineToolbar';
import { getParentInfo } from '../utils/ast';

export function Canvas() {
  const { ast, moveNodeById, selectedNodeId } = useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const overId = String(over.id);
    const currentActiveId = String(active.id);

    if (currentActiveId !== overId) {
      const activeInfo = getParentInfo(ast, currentActiveId);
      const overInfo = getParentInfo(ast, overId);
      
      if (activeInfo && overInfo) {
        if (activeInfo.parentId === overInfo.parentId && activeInfo.index !== overInfo.index) {
          moveNodeById(currentActiveId, activeInfo.parentId, overInfo.index);
        }
      }
    }
    
    setActiveId(null);
  };
  
  return (
    <div className="canvas">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="canvas-content">
          <SortableContext
            items={ast.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            {ast.map((node, index) => (
              <CanvasNode
                key={node.id}
                node={node}
                index={index}
                parentId={null}
              />
            ))}
          </SortableContext>
          <AddNodeMenu parentId={null} index={ast.length} />
        </div>
        <DragOverlay>
          {activeId ? <div className="drag-overlay">Dragging...</div> : null}
        </DragOverlay>
      </DndContext>
      {selectedNodeId && <InlineToolbar />}
    </div>
  );
}
