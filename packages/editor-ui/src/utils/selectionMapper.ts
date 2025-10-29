import type { NodeIndexMap } from '@html-editor/core-ast';

export interface CodeRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export function getNodeRange(
  nodeId: string,
  indexMaps: NodeIndexMap,
  htmlContent: string
): CodeRange | null {
  const range = indexMaps.byTextRange.get(nodeId);
  if (!range) return null;

  const startPos = offsetToLineColumn(htmlContent, range.start);
  const endPos = offsetToLineColumn(htmlContent, range.end);

  return {
    startLine: startPos.line,
    startColumn: startPos.column,
    endLine: endPos.line,
    endColumn: endPos.column,
  };
}

export function offsetToLineColumn(
  content: string,
  offset: number
): { line: number; column: number } {
  const lines = content.slice(0, offset).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function lineColumnToOffset(
  content: string,
  line: number,
  column: number
): number {
  const lines = content.split('\n');
  let offset = 0;

  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    offset += lines[i].length + 1;
  }

  offset += Math.min(column - 1, lines[line - 1]?.length || 0);
  return offset;
}

export function findNodeAtOffset(
  offset: number,
  indexMaps: NodeIndexMap
): string | null {
  for (const [nodeId, range] of indexMaps.byTextRange.entries()) {
    if (offset >= range.start && offset <= range.end) {
      return nodeId;
    }
  }
  return null;
}

export function findNodeAtPosition(
  line: number,
  column: number,
  indexMaps: NodeIndexMap,
  htmlContent: string
): string | null {
  const offset = lineColumnToOffset(htmlContent, line, column);
  return findNodeAtOffset(offset, indexMaps);
}
