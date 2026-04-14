// ================================================
// Frontend/src/Components/TerminalPanel.jsx
// VS Code-style integrated terminal panel
// ================================================
import { useRef, useEffect, useState, useCallback } from 'react';
import { VscClose, VscTrash, VscPlay } from 'react-icons/vsc';

function TerminalPanel({ output = [], onRun, onClear, onClose }) {
  const outputEndRef = useRef(null);
  const [height, setHeight] = useState(200);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  // Terminal drag-to-resize logic
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent) => {
      // Dragging UP means smaller clientY, so delta is positive -> height increases
      const deltaY = startY - moveEvent.clientY;
      let newHeight = startHeight + deltaY;
      
      // Clamp the height between 100px and 80% of window height
      if (newHeight < 100) newHeight = 100;
      if (newHeight > window.innerHeight * 0.8) newHeight = window.innerHeight * 0.8;
      
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Change cursor during drag to show it's working anywhere on the screen
    document.body.style.cursor = 'ns-resize';
  }, [height]);

  // Map console methods to colors (VS Code terminal style)
  const getLineStyle = (type) => {
    switch (type) {
      case 'error':
        return { color: '#f48771' };   // Red (VS Code error color)
      case 'warn':
        return { color: '#cca700' };   // Yellow
      case 'info':
        return { color: '#75beff' };   // Blue
      case 'system':
        return { color: '#858585', fontStyle: 'italic' };
      default:
        return { color: '#cccccc' };   // White (default log)
    }
  };

  return (
    <div className="vscode-terminal-panel" style={{ height: `${height}px` }}>
      {/* Invisible drag handle at the top */}
      <div 
        className="vscode-terminal-resize-handle" 
        onMouseDown={handleMouseDown} 
        title="Drag to resize"
      />
      
      {/* Terminal Header */}
      <div className="vscode-terminal-header">
        <div className="vscode-terminal-tabs">
          <span className="vscode-terminal-tab active">TERMINAL</span>
          <span className="vscode-terminal-tab">PROBLEMS</span>
          <span className="vscode-terminal-tab">OUTPUT</span>
          <span className="vscode-terminal-tab">DEBUG CONSOLE</span>
        </div>
        <div className="vscode-terminal-actions">
          <button
            className="vscode-terminal-action-btn"
            onClick={onRun}
            title="Run Code (Ctrl+Enter)"
          >
            <VscPlay />
          </button>
          <button
            className="vscode-terminal-action-btn"
            onClick={onClear}
            title="Clear Terminal"
          >
            <VscTrash />
          </button>
          <button
            className="vscode-terminal-action-btn"
            onClick={onClose}
            title="Close Panel"
          >
            <VscClose />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="vscode-terminal-output">
        {output.length === 0 ? (
          <div style={{ color: '#858585', fontStyle: 'italic', padding: '8px 12px' }}>
            Press ▶ Run or Ctrl+Enter to execute your code.
          </div>
        ) : (
          output.map((line, index) => (
            <div
              key={index}
              className="vscode-terminal-line"
              style={getLineStyle(line.type)}
            >
              {line.type === 'error' && <span style={{ marginRight: 4 }}>✗</span>}
              {line.type === 'warn' && <span style={{ marginRight: 4 }}>⚠</span>}
              {line.args.join(' ')}
            </div>
          ))
        )}
        <div ref={outputEndRef} />
      </div>
    </div>
  );
}

export default TerminalPanel;