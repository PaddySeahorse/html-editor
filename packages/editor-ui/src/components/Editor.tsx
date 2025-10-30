import { MonacoEditor } from './MonacoEditor.js';
import { VisualCanvas } from './VisualCanvas.js';
import { ErrorBanner } from './ErrorBanner.js';

export interface EditorProps {
  initialHtml?: string;
  debounceMs?: number;
  splitRatio?: number;
}

export function Editor({
  initialHtml = '<div><h1>Hello World</h1><p>Start editing...</p></div>',
  debounceMs = 75,
  splitRatio = 0.5,
}: EditorProps) {
  const leftWidth = `${splitRatio * 100}%`;
  const rightWidth = `${(1 - splitRatio) * 100}%`;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <ErrorBanner />

      <div
        style={{
          width: leftWidth,
          height: '100%',
          borderRight: '1px solid #ccc',
          overflow: 'hidden',
        }}
      >
        <MonacoEditor initialValue={initialHtml} debounceMs={debounceMs} />
      </div>

      <div
        style={{
          width: rightWidth,
          height: '100%',
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          padding: '20px',
        }}
      >
        <VisualCanvas />
      </div>
    </div>
  );
}
