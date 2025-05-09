import { convertToRaw, EditorState, RichUtils } from "draft-js";
import { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import mammoth from "mammoth";

export default function PageV2() {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty() // Start with empty editor state, we'll add default styling later
  );
  const [pageSize, setPageSize] = useState("A4");

  const pageDimensions = {
    A4: { width: "794px", height: "1123px" }, // 210mm x 297mm at 96 DPI
    Letter: { width: "816px", height: "1056px" }, // 8.5in x 11in
  };

  // Function to handle the editor state change
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
  };

  // Export to PDF
  const exportAsPDF = async () => {
    const canvas = await html2canvas(document.getElementById("editor-canvas"));
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", pageSize);
    pdf.addImage(imgData, "PNG", 0, 0);
    pdf.save("export.pdf");
  };

  // Export to DOCX using Mammoth
  const exportAsDocx = () => {
    const html = document.getElementById("editor-canvas").innerHTML;

    mammoth.convertToBlob({ html: html })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "export.docx";
        link.click();
      })
      .catch((err) => console.error(err));
  };

  // Add default styling to the editor to set the text color to black
  const editorStyles = {
    color: "black", // Set the default text color to black
    fontFamily: "Arial, sans-serif", // You can adjust font family here
    fontSize: "14px", // Set the default font size
  };

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <label>Select Page Size: </label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
        </select>

        <button onClick={exportAsPDF} style={{ marginLeft: "1rem" }}>
          Export as PDF
        </button>
        <button onClick={exportAsDocx} style={{ marginLeft: "0.5rem" }}>
          Export as DOCX
        </button>
      </div>

      <div
        id="editor-canvas"
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          backgroundColor: "white",
          margin: "auto",
          ...pageDimensions[pageSize],
          overflow: "auto",
        }}
      >
        <Editor
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          onEditorStateChange={onEditorStateChange}
          defaultEditorState={editorState}
          toolbar={{
            options: ["inline", "blockType", "fontSize", "fontFamily", "colorPicker", "list", "textAlign", "history"],
            inline: {
              options: ["bold", "italic", "underline", "strikethrough", "monospace"],
            },
            fontSize: {
              options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 36],
            },
            fontFamily: {
              options: ["Arial", "Georgia", "Times New Roman", "Verdana", "Courier New"],
            },
            colorPicker: {
              colors: [
                "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF",
              ],
            },
          }}
          editorStyle={editorStyles} // Apply the default text styling
        />
      </div>
    </>
  );
}
