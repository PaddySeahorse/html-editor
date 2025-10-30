import { useEditorStore } from '../store/editorStore';

export function Toolbar() {
  const { undo, redo, canUndo, canRedo } = useEditorStore();

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h1 className="app-title">HTML Editor</h1>
      </div>
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={() => undo()}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          className="toolbar-button"
          onClick={() => redo()}
          disabled={!canRedo()}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>
    </div>
  );
}
