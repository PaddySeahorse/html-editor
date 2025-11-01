import { useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { CodeEditor } from './components/CodeEditor';
import { Toolbar } from './components/Toolbar';
import { useEditorStore } from './store/editorStore';
import './App.css';

function App() {
  const { undo, redo } = useEditorStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
  
  return (
    <div className="app">
      <Toolbar />
      <div className="editor-container">
        <div className="editor-pane canvas-pane">
          <h2>Canvas View</h2>
          <Canvas />
        </div>
        <div className="editor-pane code-pane">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}

export default App;
