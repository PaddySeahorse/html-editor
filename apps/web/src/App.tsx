import { Editor } from '@monaco-editor/react';
import { useDocumentStore } from './store/document';

function App() {
  const { content, setContent } = useDocumentStore();

  const handleEditorChange = (value: string | undefined) => {
    setContent(value || '');
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #ccc',
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid #ccc',
            background: '#f5f5f5',
          }}
        >
          <h3 style={{ margin: 0 }}>Editor</h3>
        </div>
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            defaultLanguage="html"
            value={content}
            onChange={handleEditorChange}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid #ccc',
            background: '#f5f5f5',
          }}
        >
          <h3 style={{ margin: 0 }}>Canvas</h3>
        </div>
        <div
          id="canvas"
          style={{
            flex: 1,
            padding: '16px',
            background: '#fff',
            overflow: 'auto',
          }}
        >
          <p style={{ color: '#666' }}>Canvas placeholder - rendered output will appear here</p>
        </div>
      </div>
    </div>
  );
}

export default App;
