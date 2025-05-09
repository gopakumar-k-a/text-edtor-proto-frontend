import React, { useRef, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, ContentBlock } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './editor.css';

interface EditorComponentProps {
  onSave: (content: any) => void;
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ onSave, editorState, setEditorState }) => {
  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus(); // Auto-focus on mount
    }
  }, []);

  const handleKeyCommand = (command: string): 'handled' | 'not-handled' => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    onSave(rawContent);
  };

  const blockStyleFn = (contentBlock: ContentBlock): string => {
    const type = contentBlock.getType();
    console.log('Block Type in Editor:', type); // Debug: Log block types
    switch (type) {
      case 'align-left':
        return 'align-left';
      case 'align-center':
        return 'align-center';
      case 'align-right':
        return 'align-right';
      default:
        return 'align-left'; // Default to left alignment
    }
  };

  return (
    <div
      style={{
        width: '60%',
        padding: '20px',
        backgroundColor: '#fff',
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          border: '1px solid #ddd',
          minHeight: '500px',
          padding: '10px',
          borderRadius: '4px',
          color: 'black', // Default text color
        }}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={{
            COLOR_RED: { color: 'red' },
            COLOR_BLUE: { color: 'blue' },
            BG_YELLOW: { backgroundColor: 'yellow' },
            FONT_SIZE_16: { fontSize: '16px' },
            FONT_SIZE_20: { fontSize: '20px' },
          }}
          blockStyleFn={blockStyleFn}
          readOnly={false}
        />
      </div>
      <button
        onClick={saveContent}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Save Template
      </button>
    </div>
  );
};

export default EditorComponent;