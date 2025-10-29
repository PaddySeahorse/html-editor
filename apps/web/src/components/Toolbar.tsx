import { memo } from 'react';
import { useDocumentStore } from '../store/document';

const ToolbarComponent = () => {
  const { undo, redo, enqueueInsert, toggleTheme, canUndo, canRedo, theme } = useDocumentStore(
    (state) => ({
      undo: state.undo,
      redo: state.redo,
      enqueueInsert: state.enqueueInsert,
      toggleTheme: state.toggleTheme,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      theme: state.ui.theme,
    })
  );

  return (
    <header className="toolbar" role="banner">
      <div className="toolbar__group">
        <button type="button" onClick={undo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={redo} disabled={!canRedo}>
          Redo
        </button>
      </div>
      <div className="toolbar__group toolbar__group--insert" aria-label="Insert elements">
        <span className="toolbar__label">Insert:</span>
        <button type="button" onClick={() => enqueueInsert('div')}>
          Div
        </button>
        <button type="button" onClick={() => enqueueInsert('p')}>
          Paragraph
        </button>
        <button type="button" onClick={() => enqueueInsert('h2')}>
          Heading
        </button>
      </div>
      <div className="toolbar__group">
        <button type="button" onClick={toggleTheme}>
          Theme: {theme === 'light' ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  );
};

export const Toolbar = memo(ToolbarComponent);
