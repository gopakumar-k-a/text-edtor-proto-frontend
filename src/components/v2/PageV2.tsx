import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { MegadraftEditor, editorStateFromRaw } from "megadraft";

// Import megadraft.css
import "megadraft/dist/css/megadraft.css";

const App = () => {
  const [editorState, setEditorState] = useState(editorStateFromRaw(null));

  const onChange = newEditorState => {
    setEditorState(newEditorState);
  };

  return (
    <div style={{ marginLeft: 80 }}>
      <MegadraftEditor
        editorState={editorState}
        onChange={onChange}
        placeholder="Add some text"
      />
    </div>
  );
};