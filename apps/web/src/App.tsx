import { Toolbar } from './components/Toolbar';
import { OutlinePanel } from './components/OutlinePanel';
import { CanvasPane } from './components/CanvasPane';
import { CodeEditorPane } from './components/CodeEditorPane';
import { useDocumentStore } from './store/document';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const theme = useDocumentStore((state) => state.ui.theme);
  useKeyboardShortcuts();

  return (
    <div className={`app ${theme}`}>
      <Toolbar />
      <div className="workspace">
        <OutlinePanel />
        <CanvasPane />
        <CodeEditorPane />
      </div>
    </div>
  );
}

export default App;
