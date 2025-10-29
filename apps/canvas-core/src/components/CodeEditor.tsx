import { useState, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';

export function CodeEditor() {
  const { getHtml, updateFromHtml, ast } = useEditorStore();
  const [code, setCode] = useState('');
  
  useEffect(() => {
    const html = getHtml();
    setCode(html);
  }, [ast, getHtml]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  const handleBlur = () => {
    const currentHtml = getHtml();
    if (code !== currentHtml) {
      updateFromHtml(code);
    }
  };
  
  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <h3>HTML Code</h3>
      </div>
      <textarea
        className="code-editor-textarea"
        value={code}
        onChange={handleChange}
        onBlur={handleBlur}
        spellCheck={false}
      />
    </div>
  );
}
