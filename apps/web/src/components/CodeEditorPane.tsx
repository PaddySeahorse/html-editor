import { memo, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { useDocumentStore } from '../store/document';

const CodeEditorPaneComponent = () => {
  const { content, setContent, theme } = useDocumentStore((state) => ({
    content: state.content,
    setContent: state.setContent,
    theme: state.ui.theme,
  }));

  const handleChange = useCallback(
    (value?: string) => {
      setContent(value ?? '');
    },
    [setContent]
  );

  return (
    <aside className="panel code-pane" aria-label="Code editor">
      <div className="panel__header">
        <span>Code</span>
      </div>
      <div className="panel__body code-pane__body">
        <Editor
          height="100%"
          language="html"
          value={content}
          onChange={handleChange}
          theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </aside>
  );
};

export const CodeEditorPane = memo(CodeEditorPaneComponent);
