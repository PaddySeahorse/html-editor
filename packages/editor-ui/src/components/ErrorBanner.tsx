import { useEditorStore } from '../store/editorStore.js';

export function ErrorBanner() {
  const { error, clearError } = useEditorStore();

  if (!error) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ff6b6b',
        color: 'white',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div>
        <strong>Error:</strong> {error}
      </div>
      <button
        onClick={clearError}
        style={{
          background: 'transparent',
          border: '1px solid white',
          color: 'white',
          padding: '4px 12px',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
