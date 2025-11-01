import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore.js';
import type { RootContent } from '@html-editor/core-ast';

export interface PerformanceMetrics {
  parseTime: number;
  renderTime: number;
  totalTime: number;
  nodeCount: number;
}

export function usePerformanceMonitor(enabled: boolean = true) {
  const { ast, isProcessing } = useEditorStore();
  const metricsRef = useRef<PerformanceMetrics>({
    parseTime: 0,
    renderTime: 0,
    totalTime: 0,
    nodeCount: 0,
  });
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    if (isProcessing) {
      startTimeRef.current = performance.now();
    } else if (startTimeRef.current > 0) {
      const totalTime = performance.now() - startTimeRef.current;

      const nodeCount = ast ? countNodes(ast.children) : 0;

      metricsRef.current = {
        parseTime: totalTime,
        renderTime: 0,
        totalTime,
        nodeCount,
      };

      if (totalTime > 100) {
        console.warn(
          `Performance warning: Processing took ${totalTime.toFixed(2)}ms for ${nodeCount} nodes`
        );
      }

      startTimeRef.current = 0;
    }
  }, [isProcessing, ast, enabled]);

  return metricsRef.current;
}

function countNodes(children: RootContent[]): number {
  let count = 0;

  for (const child of children) {
    count++;

    if (child.type === 'element' && Array.isArray(child.children)) {
      count += countNodes(child.children as RootContent[]);
    }
  }

  return count;
}
