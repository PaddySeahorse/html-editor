import { memo, useMemo } from 'react';
import { useDocumentStore } from '../store/document';

const sanitizeHtml = (html: string): string => html;

const CanvasPaneComponent = () => {
  const content = useDocumentStore((state) => state.content);

  const markup = useMemo(() => ({ __html: sanitizeHtml(content) }), [content]);

  return (
    <section className="panel canvas-pane" aria-label="Rendered canvas">
      <div className="panel__header">
        <span>Canvas</span>
      </div>
      <div className="panel__body canvas__body">
        <div className="canvas__surface" dangerouslySetInnerHTML={markup} />
      </div>
    </section>
  );
};

export const CanvasPane = memo(CanvasPaneComponent);
