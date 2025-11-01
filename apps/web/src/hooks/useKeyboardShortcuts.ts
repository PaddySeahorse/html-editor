import { useEffect } from 'react';
import { useDocumentStore } from '../store/document';

export const useKeyboardShortcuts = (): void => {
  const undo = useDocumentStore((state) => state.undo);
  const redo = useDocumentStore((state) => state.redo);
  const deleteSelection = useDocumentStore((state) => state.deleteSelection);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMac = navigator.platform?.toUpperCase().includes('MAC');
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toLowerCase();

      if (modKey && !event.shiftKey && key === 'z') {
        event.preventDefault();
        undo();
        return;
      }

      if (modKey && (key === 'y' || (event.shiftKey && key === 'z'))) {
        event.preventDefault();
        redo();
        return;
      }

      if (event.key === 'Delete') {
        event.preventDefault();
        deleteSelection();
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [undo, redo, deleteSelection]);
};
