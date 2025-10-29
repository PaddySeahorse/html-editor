import { useEffect, useRef, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEditorStore } from '../store/editorStore.js';
import { debounce } from '../utils/debounce.js';
import { getNodeRange, findNodeAtPosition } from '../utils/selectionMapper.js';

export interface MonacoEditorProps {
  initialValue?: string;
  debounceMs?: number;
  onReady?: () => void;
}

export function MonacoEditor({
  initialValue = '',
  debounceMs = 75,
  onReady,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  
  const {
    htmlContent,
    selectedNodeId,
    indexMaps,
    updateHtml,
    selectNode,
    setCursorPosition,
    initialize,
  } = useEditorStore();

  const debouncedUpdate = useCallback(
    debounce((value: string) => {
      updateHtml(value);
    }, debounceMs),
    [updateHtml, debounceMs]
  );

  useEffect(() => {
    if (initialValue) {
      initialize(initialValue);
    }
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      setCursorPosition({ line: position.lineNumber, column: position.column });

      if (indexMaps && htmlContent) {
        const nodeId = findNodeAtPosition(
          position.lineNumber,
          position.column,
          indexMaps,
          htmlContent
        );
        if (nodeId && nodeId !== selectedNodeId) {
          selectNode(nodeId);
        }
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      // Undo hook - will be implemented in history task
    });

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
      () => {
        // Redo hook - will be implemented in history task
      }
    );

    onReady?.();
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      debouncedUpdate(value);
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !selectedNodeId || !indexMaps || !htmlContent) {
      if (editor && decorationsRef.current.length > 0) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    const range = getNodeRange(selectedNodeId, indexMaps, htmlContent);
    if (!range) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: {
          startLineNumber: range.startLine,
          startColumn: range.startColumn,
          endLineNumber: range.endLine,
          endColumn: range.endColumn,
        },
        options: {
          className: 'selected-node-highlight',
          isWholeLine: false,
          inlineClassName: 'selected-node-inline',
        },
      },
    ]);
  }, [selectedNodeId, indexMaps, htmlContent]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="html"
        defaultValue={initialValue}
        value={htmlContent}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
        theme="vs-dark"
      />
    </div>
  );
}
