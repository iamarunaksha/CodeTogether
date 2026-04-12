// ================================================
// Frontend/src/Components/CodeEditor.jsx
// Monaco Editor — The VS Code Heart
// ================================================
import Editor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import { yText, provider } from '../lib/collaboration';

function CodeEditor({ language = 'javascript', onMount }) {

  // const handleEditorChange = (newValue) => {
  //   if (onChange) {
  //     onChange(newValue);
  //   }
  // };

  const handleEditorMount = (editor, monaco) => {

    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // Pass the editor instance up to App.jsx for cursor tracking
    if (onMount) {
      onMount(editor, monaco);
    }
    // Focus the editor immediately
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