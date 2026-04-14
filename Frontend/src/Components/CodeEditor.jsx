// ================================================
// Frontend/src/Components/CodeEditor.jsx
// Monaco Editor — The VS Code Heart
// ================================================
import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';

function CodeEditor({ language = 'javascript', onMount, yText, provider }) {

  // const handleEditorChange = (newValue) => {
  //   if (onChange) {
  //     onChange(newValue);
  //   }
  // };

  // Store the binding so we can clean it up when the component unmounts
  const bindingRef = useRef(null);

  // Clean up the binding when the component unmounts or when yText/provider changes
  useEffect(() => {
    return () => {
      if(bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [yText, provider]);

  const handleEditorMount = (editor, monaco) => {

    //Destroy any existing binding first (in case of hot reload)
    if(bindingRef.current) {
      bindingRef.current.destroy();
    }

    // Create the MonacoBinding — same as Phase 4, but now using
    // the room-specific yText and provider passed as props
    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // FIX: When a user first joins, their cursor doesn't appear for others
    // because no selection event has fired yet. We simulate a selection change
    // after a short delay so our initial cursor position is broadcasted.
    setTimeout(() => {
      const position = editor.getPosition();
      if (position && monaco) {
        editor.setSelection(new monaco.Selection(
          position.lineNumber, position.column,
          position.lineNumber, position.column
        ));
      }
    }, 50);

    // Pass editor instance to parent for cursor tracking
    if(onMount) {
      onMount(editor, monaco);
    }
    editor.focus();
  };

  return (
    <Editor
      height="100%"
      language={language}
      // value={value}
      theme="vs-dark"
      // onChange={handleEditorChange}
      onMount={handleEditorMount}
      options={{
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        fontLigatures: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        padding: { top: 16 },
      }}
    />
  );
}

export default CodeEditor;