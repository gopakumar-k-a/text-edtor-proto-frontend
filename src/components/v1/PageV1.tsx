import React, { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import EditorComponent from './EditorComponent';
import RightSidebar from './RightSidebar';
import { EditorState, convertFromRaw } from 'draft-js';
import axios from 'axios';

function PageV1() {
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
    const handleSelectTemplate = (template: any) => {
      setSelectedTemplate(template);
      try {
        const contentState = convertFromRaw(template.content);
        setEditorState(EditorState.createWithContent(contentState));
      } catch (error) {
        console.error('Error loading template:', error);
        alert('Failed to load template content.');
        setEditorState(EditorState.createEmpty());
      }
    };
  
    const handleSave = async (content: any) => {
      const name = prompt('Enter unique template name:');
      if (name) {
        try {
          await axios.post('http://localhost:5000/templates', { name, content });
          alert('Template saved successfully!');
        } catch (error) {
          alert('Failed to save template. Ensure the name is unique.');
        }
      }
    };
  
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <LeftSidebar onSelect={handleSelectTemplate} />
        <EditorComponent onSave={handleSave} editorState={editorState} setEditorState={setEditorState} />
        <RightSidebar editorState={editorState} setEditorState={setEditorState} />
      </div>
    );
}

export default PageV1
