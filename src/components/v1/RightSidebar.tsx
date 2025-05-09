import React from 'react';
import { EditorState, RichUtils, ContentBlock } from 'draft-js';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RightSidebarProps {
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ editorState, setEditorState }) => {
  const toggleInlineStyle = (style: string) => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const nextContentState = RichUtils.toggleInlineStyle(editorState, style);
      const nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        'change-inline-style'
      );
      setEditorState(EditorState.forceSelection(nextEditorState, selection));
      console.log('Applied Style:', style, 'Selection:', selection.toString()); // Debug
    }
  };

  const toggleBlockType = (blockType: string) => {
    const selection = editorState.getSelection();
    const nextContentState = RichUtils.toggleBlockType(editorState, blockType);
    const nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-block-type'
    );
    setEditorState(EditorState.forceSelection(nextEditorState, selection));
    console.log('Toggled Block Type:', blockType); // Debug: Log block type
  };

  const exportToDocx = () => {
    const contentState = editorState.getCurrentContent();
    const blocks = contentState.getBlocksAsArray();

    const doc = new Document({
      sections: [
        {
          properties: {
            page: { size: { width: 12240, height: 15840 } }, // A4 in twips
          },
          children: blocks.map((block: ContentBlock) => {
            const text = block.getText();
            const inlineStyles = [];
            let currentStyles = block.getInlineStyleAt(0);
            let start = 0;

            // Group text by inline styles
            for (let i = 1; i <= text.length; i++) {
              const nextStyles = i < text.length ? block.getInlineStyleAt(i) : null;
              if (nextStyles !== currentStyles || i === text.length) {
                inlineStyles.push({
                  text: text.slice(start, i),
                  bold: currentStyles?.has('BOLD'),
                  italic: currentStyles?.has('ITALIC'),
                  color:
                    currentStyles?.has('COLOR_RED') ? 'FF0000' :
                    currentStyles?.has('COLOR_BLUE') ? '0000FF' : '000000', // Default black
                  fontSize:
                    currentStyles?.has('FONT_SIZE_16') ? 32 : // 16px = 32 half-points
                    currentStyles?.has('FONT_SIZE_20') ? 40 : undefined, // 20px = 40 half-points
                });
                start = i;
                currentStyles = nextStyles;
              }
            }

            console.log('Block Type for DOCX:', block.getType()); // Debug: Log block type
            return new Paragraph({
              children: inlineStyles.map(style => new TextRun({
                text: style.text,
                bold: style.bold,
                italics: style.italic,
                color: style.color,
                size: style.fontSize,
              })),
              alignment:
                block.getType() === 'align-center' ? AlignmentType.CENTER :
                block.getType() === 'align-right' ? AlignmentType.RIGHT :
                AlignmentType.LEFT,
            });
          }),
        },
      ],
    });

    Packer.toBlob(doc)
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.docx';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error generating DOCX:', error);
        alert('Failed to export DOCX.');
      });
  };

  const exportToPdf = () => {
    const editorElement = document.querySelector('.DraftEditor-root') as HTMLElement;
    if (!editorElement) {
      alert('Editor not found.');
      return;
    }
    html2canvas(editorElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('document.pdf');
    });
  };

  return (
    <div
      style={{
        width: '20%',
        backgroundColor: '#f4f4f9',
        borderLeft: '1px solid #ddd',
        padding: '10px',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ color: '#333', marginBottom: '10px' }}>Styling</h3>
      <button onClick={() => toggleInlineStyle('BOLD')} style={buttonStyle}>Bold</button>
      <button onClick={() => toggleInlineStyle('ITALIC')} style={buttonStyle}>Italic</button>
      <button onClick={() => toggleInlineStyle('COLOR_RED')} style={buttonStyle}>Red Text</button>
      <button onClick={() => toggleInlineStyle('COLOR_BLUE')} style={buttonStyle}>Blue Text</button>
      <button onClick={() => toggleInlineStyle('BG_YELLOW')} style={buttonStyle}>Yellow Background</button>
      <button onClick={() => toggleInlineStyle('FONT_SIZE_16')} style={buttonStyle}>Font Size 16</button>
      <button onClick={() => toggleInlineStyle('FONT_SIZE_20')} style={buttonStyle}>Font Size 20</button>
      <h3 style={{ color: '#333', margin: '10px 0' }}>Alignment</h3>
      <button onClick={() => toggleBlockType('align-left')} style={buttonStyle}>Left Align</button>
      <button onClick={() => toggleBlockType('align-center')} style={buttonStyle}>Center Align</button>
      <button onClick={() => toggleBlockType('align-right')} style={buttonStyle}>Right Align</button>
      <h3 style={{ color: '#333', margin: '10px 0' }}>Export</h3>
      <button onClick={exportToDocx} style={buttonStyle}>Export to DOCX</button>
      <button onClick={exportToPdf} style={buttonStyle}>Export to PDF</button>
    </div>
  );
};

const buttonStyle = {
  display: 'block',
  width: '100%',
  padding: '8px',
  margin: '5px 0',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

export default RightSidebar;