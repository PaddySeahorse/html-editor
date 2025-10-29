import { useState, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { findNodeById } from '../utils/ast';
import { ASTNode } from '../types/ast';

export function InlineToolbar() {
  const { ast, selectedNodeId, updateNodeById } = useEditorStore();
  const [showAttributeEditor, setShowAttributeEditor] = useState(false);
  const [href, setHref] = useState('');
  const [alt, setAlt] = useState('');
  const [src, setSrc] = useState('');
  
  const selectedNode = selectedNodeId ? findNodeById(ast, selectedNodeId) : null;
  
  useEffect(() => {
    if (selectedNode) {
      if (selectedNode.type === 'link') {
        setHref(selectedNode.href);
      }
      if (selectedNode.type === 'image') {
        setAlt(selectedNode.alt);
        setSrc(selectedNode.src);
      }
    }
  }, [selectedNode]);
  
  if (!selectedNode) return null;
  
  const canEditAttributes = selectedNode.type === 'link' || selectedNode.type === 'image';
  
  const handleSaveAttributes = () => {
    if (!selectedNodeId) return;
    
    if (selectedNode.type === 'link') {
      updateNodeById(selectedNodeId, { href } as Partial<ASTNode>);
    }
    
    if (selectedNode.type === 'image') {
      updateNodeById(selectedNodeId, { alt, src } as Partial<ASTNode>);
    }
    
    setShowAttributeEditor(false);
  };
  
  return (
    <div className="inline-toolbar">
      <div className="toolbar-info">
        Selected: <strong>{selectedNode.type}</strong>
      </div>
      
      {canEditAttributes && (
        <button
          className="toolbar-button"
          onClick={() => setShowAttributeEditor(!showAttributeEditor)}
        >
          Edit Attributes
        </button>
      )}
      
      {showAttributeEditor && selectedNode.type === 'link' && (
        <div className="attribute-editor">
          <label>
            URL:
            <input
              type="text"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <button onClick={handleSaveAttributes}>Save</button>
          <button onClick={() => setShowAttributeEditor(false)}>Cancel</button>
        </div>
      )}
      
      {showAttributeEditor && selectedNode.type === 'image' && (
        <div className="attribute-editor">
          <label>
            Image URL:
            <input
              type="text"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </label>
          <label>
            Alt Text:
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Image description"
            />
          </label>
          <button onClick={handleSaveAttributes}>Save</button>
          <button onClick={() => setShowAttributeEditor(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
