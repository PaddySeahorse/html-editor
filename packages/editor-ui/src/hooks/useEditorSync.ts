import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore.js';

export interface SyncOptions {
  onAstUpdate?: (html: string) => void;
  onSelectionChange?: (nodeId: string | null) => void;
  performanceThreshold?: number;
}

export function useEditorSync(options: SyncOptions = {}) {
  const { onAstUpdate, onSelectionChange, performanceThreshold = 100 } = options;

  const { htmlContent, selectedNodeId, ast } = useEditorStore();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (ast && startTimeRef.current > 0) {
      const elapsed = performance.now() - startTimeRef.current;

      if (elapsed > performanceThreshold) {
        console.warn(
          `AST update took ${elapsed.toFixed(2)}ms (threshold: ${performanceThreshold}ms)`
        );
      }
    }

    if (ast) {
      onAstUpdate?.(htmlContent);
    }
  }, [ast, htmlContent, onAstUpdate, performanceThreshold]);

  useEffect(() => {
    onSelectionChange?.(selectedNodeId);
  }, [selectedNodeId, onSelectionChange]);

  const startTracking = () => {
    startTimeRef.current = performance.now();
  };

  return {
    startTracking,
    htmlContent,
    selectedNodeId,
    ast,
  };
}
