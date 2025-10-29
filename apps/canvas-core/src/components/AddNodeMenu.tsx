import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { generateId } from '../utils/ast';
import { ASTNode } from '../types/ast';

interface AddNodeMenuProps {
  parentId: string | null;
  index: number;
}

export function AddNodeMenu({ parentId, index }: AddNodeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addNode } = useEditorStore();
  
  const handleAddNode = (type: string) => {
    let node: ASTNode;
    
    switch (type) {
      case 'section':
        node = {
          id: generateId(),
          type: 'section',
          tag: 'section',
          children: [],
        };
        break;
      case 'container':
        node = {
          id: generateId(),
          type: 'container',
          tag: 'div',
          children: [],
        };
        break;
      case 'text':
        node = {
          id: generateId(),
          type: 'text',
          tag: 'p',
          content: 'New text',
        };
        break;
      case 'heading-h1':
        node = {
          id: generateId(),
          type: 'heading',
          tag: 'h1',
          content: 'New Heading',
        };
        break;
      case 'heading-h2':
        node = {
          id: generateId(),
          type: 'heading',
          tag: 'h2',
          content: 'New Heading',
        };
        break;
      case 'heading-h3':
        node = {
          id: generateId(),
          type: 'heading',
          tag: 'h3',
          content: 'New Heading',
        };
        break;
      case 'link':
        node = {
          id: generateId(),
          type: 'link',
          tag: 'a',
          href: '#',
          content: 'New Link',
        };
        break;
      case 'image':
        node = {
          id: generateId(),
          type: 'image',
          tag: 'img',
          src: 'https://via.placeholder.com/150',
          alt: 'Placeholder image',
        };
        break;
      case 'list-ul':
        node = {
          id: generateId(),
          type: 'list',
          tag: 'ul',
          children: [
            {
              id: generateId(),
              type: 'listItem',
              tag: 'li',
              content: 'List item 1',
            },
          ],
        };
        break;
      case 'list-ol':
        node = {
          id: generateId(),
          type: 'list',
          tag: 'ol',
          children: [
            {
              id: generateId(),
              type: 'listItem',
              tag: 'li',
              content: 'List item 1',
            },
          ],
        };
        break;
      default:
        return;
    }
    
    addNode(node, parentId, index);
    setIsOpen(false);
  };
  
  return (
    <div className="add-node-menu">
      {!isOpen ? (
        <button
          className="add-node-button"
          onClick={() => setIsOpen(true)}
        >
          + Add Element
        </button>
      ) : (
        <div className="add-node-dropdown">
          <div className="menu-section">
            <div className="menu-title">Layout</div>
            <button onClick={() => handleAddNode('section')}>Section</button>
            <button onClick={() => handleAddNode('container')}>Container</button>
          </div>
          <div className="menu-section">
            <div className="menu-title">Text</div>
            <button onClick={() => handleAddNode('text')}>Paragraph</button>
            <button onClick={() => handleAddNode('heading-h1')}>Heading 1</button>
            <button onClick={() => handleAddNode('heading-h2')}>Heading 2</button>
            <button onClick={() => handleAddNode('heading-h3')}>Heading 3</button>
          </div>
          <div className="menu-section">
            <div className="menu-title">Elements</div>
            <button onClick={() => handleAddNode('link')}>Link</button>
            <button onClick={() => handleAddNode('image')}>Image</button>
            <button onClick={() => handleAddNode('list-ul')}>Unordered List</button>
            <button onClick={() => handleAddNode('list-ol')}>Ordered List</button>
          </div>
          <button
            className="close-menu"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
