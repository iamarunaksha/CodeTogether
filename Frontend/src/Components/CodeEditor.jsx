// ================================================
// Frontend/src/Components/CodeEditor.jsx
// Monaco Editor — The VS Code Heart
// ================================================
import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

function CodeEditor({ language = 'javascript', onMount, yText, provider }) {

  // Store the binding so we can clean it up when the component unmounts
  const bindingRef = useRef(null);
  const cleanupRef = useRef(null);

  // Clean up the binding when the component unmounts or when yText/provider changes
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if(bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [yText, provider]);

  const handleEditorMount = (editor, monaco) => {

    // Destroy any existing binding first (in case of hot reload)
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if(bindingRef.current) {
      bindingRef.current.destroy();
    }

    // Create the MonacoBinding
    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // =========================================================
    // FIX 1: "Left-sticky" cursor stabilization
    // ---------------------------------------------------------
    // y-monaco uses Yjs relative positions (assoc=0) to save and
    // restore cursors during remote edits. At the END of the
    // document, assoc=0 means "I belong to the right side",
    // but there IS no right side, so every remote insert pushes
    // the cursor forward. We wrap y-monaco's observer with our
    // own logic that uses simple offset arithmetic with strict
    // less-than comparison, giving us "left-sticky" behavior:
    // remote inserts AT our cursor position don't move us.
    // =========================================================
    const binding = bindingRef.current;
    const doc = yText.doc;
    const model = editor.getModel();

    let preTxOffset = null;

    const saveCursor = () => {
      const pos = editor.getPosition();
      if (pos) {
        preTxOffset = model.getOffsetAt(pos);
      }
    };

    // Register our save handler BEFORE transactions
    doc.on('beforeAllTransactions', saveCursor);

    // Unwrap y-monaco's observer and wrap it with our cursor fix
    const origObserver = binding._ytextObserver;
    yText.unobserve(origObserver);

    const wrappedObserver = (event) => {
      const wasRemote = event.transaction.origin !== binding;

      // Let y-monaco apply edits to Monaco model + its own cursor restore
      origObserver(event);

      // After y-monaco finishes, override cursor position for remote edits
      if (wasRemote && preTxOffset !== null) {
        let newOffset = preTxOffset;
        let yIndex = 0;

        for (const op of event.delta) {
          if (op.retain != null) {
            yIndex += op.retain;
          } else if (op.insert != null) {
            const len = typeof op.insert === 'string' ? op.insert.length : 1;
            // KEY: strict less-than. Insert AT our position → no shift.
            if (yIndex < preTxOffset) {
              newOffset += len;
            }
            yIndex += len;
          } else if (op.delete != null) {
            const delEnd = yIndex + op.delete;
            if (delEnd <= preTxOffset) {
              newOffset -= op.delete;
            } else if (yIndex < preTxOffset) {
              newOffset = yIndex;
            }
          }
        }

        const newPos = model.getPositionAt(Math.max(0, newOffset));
        editor.setPosition(newPos);
      }
      preTxOffset = null;
    };

    yText.observe(wrappedObserver);
    binding._ytextObserver = wrappedObserver;

    // =========================================================
    // FIX 2: Immediate presence visibility
    // ---------------------------------------------------------
    // When a new user joins, existing users' awareness states
    // may have already synced before MonacoBinding was created.
    // y-monaco only renders decorations on awareness 'change'
    // events, so existing cursors are invisible. We force a
    // re-render of decorations + broadcast our own cursor after
    // a short delay to ensure the awareness channel is ready.
    // =========================================================
    editor.setPosition({ lineNumber: 1, column: 1 });

    // Repeatedly try to render remote decorations until awareness syncs
    let presenceAttempts = 0;
    const presenceTimer = setInterval(() => {
      presenceAttempts++;

      // Broadcast our own cursor position
      const sel = editor.getSelection();
      if (sel) {
        const anchor = model.getOffsetAt(sel.getStartPosition());
        const head = model.getOffsetAt(sel.getEndPosition());
        provider.awareness.setLocalStateField('selection', {
          anchor: Y.createRelativePositionFromTypeIndex(yText, anchor),
          head: Y.createRelativePositionFromTypeIndex(yText, head),
        });
      }

      // Force y-monaco to re-render decorations for remote users
      if (binding._rerenderDecorations) {
        binding._rerenderDecorations();
      }

      // Stop after 3 seconds (6 attempts × 500ms)
      if (presenceAttempts >= 6) {
        clearInterval(presenceTimer);
      }
    }, 500);

    // Store cleanup for our custom handlers
    cleanupRef.current = () => {
      clearInterval(presenceTimer);
      doc.off('beforeAllTransactions', saveCursor);
    };

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
      theme="vs-dark"
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
        padding: { top: 28 },
      }}
    />
  );
}

export default CodeEditor;