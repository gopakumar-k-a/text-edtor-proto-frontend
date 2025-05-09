// src/TextEditor.jsx
import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/RichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from 'lexical';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faAlignLeft, faAlignCenter, faAlignRight, faFilePdf, faFileWord } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import './TextEditor.css';

const initialConfig = {
  namespace: 'MyEditor',
  theme: {
    paragraph: 'editor-paragraph',
    text: {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
      underline: 'editor-text-underline',
    },
  },
  onError: (error) => console.error(error),
};

const pageSizes = {
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
};

// Toolbar component to access editor context
const Toolbar = ({ editorState, pageSize, setPageSize, fontSize, setFontSize }) => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    const updateToolbar = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
        }
      });
    };
    return editor.registerUpdateListener(({ editorState }) => {
      updateToolbar();
    });
  }, [editor]);

  const applyTextFormat = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const applyAlignment = (alignment) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const applyFontSize = (size) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if (node.getType() === 'text') {
            node.setStyle(`font-size: ${size}px`);
          }
        });
      }
    });
    setFontSize(size);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize.toLowerCase(),
    });
    let content = '';
    editorState.read(() => {
      content = $getRoot().getTextContent();
    });
    doc.text(content, 10, 10);
    doc.save('document.pdf');
  };

  const exportToDOCX = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: pageSizes[pageSize].width * 56.69291339, // mm to twips
                height: pageSizes[pageSize].height * 56.69291339,
              },
            },
          },
          children: [],
        },
      ],
    });

    editorState.read(() => {
      const root = $getRoot();
      root.getChildren().forEach((node) => {
        if (node.getType() === 'paragraph') {
          const textRuns = [];
          node.getChildren().forEach((child) => {
            if (child.getType() === 'text') {
              textRuns.push(
                new TextRun({
                  text: child.getTextContent(),
                  bold: child.hasFormat('bold'),
                  italics: child.hasFormat('italic'),
                  underline: child.hasFormat('underline') ? { type: 'single' } : undefined,
                  size: fontSize * 2, // pt to half-points
                })
              );
            }
          });
          doc.sections[0].children.push(new Paragraph({ children: textRuns }));
        }
      });
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'document.docx');
  };

  return (
    <div className="toolbar">
      <button
        className={clsx('toolbar-btn', isBold && 'active')}
        onClick={() => applyTextFormat('bold')}
      >
        <FontAwesomeIcon icon={faBold} />
      </button>
      <button
        className={clsx('toolbar-btn', isItalic && 'active')}
        onClick={() => applyTextFormat('italic')}
      >
        <FontAwesomeIcon icon={faItalic} />
      </button>
      <button
        className={clsx('toolbar-btn', isUnderline && 'active')}
        onClick={() => applyTextFormat('underline')}
      >
        <FontAwesomeIcon icon={faUnderline} />
      </button>
      <select
        onChange={(e) => applyFontSize(parseInt(e.target.value))}
        value={fontSize}
      >
        <option value="12">12</option>
        <option value="16">16</option>
        <option value="20">20</option>
        <option value="24">24</option>
      </select>
      <button
        className="toolbar-btn"
        onClick={() => applyAlignment('left')}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <button
        className="toolbar-btn"
        onClick={() => applyAlignment('center')}
      >
        <FontAwesomeIcon icon={faAlignCenter} />
      </button>
      <button
        className="toolbar-btn"
        onClick={() => applyAlignment('right')}
      >
        <FontAwesomeIcon icon={faAlignRight} />
      </button>
      <select onChange={(e) => setPageSize(e.target.value)} value={pageSize}>
        <option value="A3">A3</option>
        <option value="A4">A4</option>
        <option value="A5">A5</option>
      </select>
      <button className="toolbar-btn" onClick={exportToPDF}>
        <FontAwesomeIcon icon={faFilePdf} /> PDF
      </button>
      <button className="toolbar-btn" onClick={exportToDOCX}>
        <FontAwesomeIcon icon={faFileWord} /> DOCX
      </button>
    </div>
  );
};

const TextEditor = () => {
  const [editorState, setEditorState] = useState(null);
  const [pageSize, setPageSize] = useState('A4');
  const [fontSize, setFontSize] = useState(16);

  const onChange = (editorState) => {
    setEditorState(editorState);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <Toolbar
          editorState={editorState}
          pageSize={pageSize}
          setPageSize={setPageSize}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
        <div className={`editor-wrapper ${pageSize}`}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor" />}
            placeholder={<div className="placeholder">Enter some text...</div>}
          />
        </div>
        <HistoryPlugin />
        <OnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
};

export default TextEditor;