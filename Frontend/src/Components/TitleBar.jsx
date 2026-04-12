// ================================================
// TitleBar.jsx — VS Code Title Bar with Menu Items
// ================================================
import { VscMenu } from 'react-icons/vsc';

const menuItems = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

function TitleBar({ socketStatus, backendStatus }) {
  return (
    <div className="vscode-titlebar">
      {/* Left: Menu items */}
      <div className="vscode-titlebar-menu">
        {menuItems.map((item) => (
          <button key={item} className="vscode-titlebar-menu-item">
            {item}
          </button>
        ))}
      </div>

      {/* Center: App title */}
      <div className="vscode-titlebar-center">
        CodeTogether
      </div>

      {/* Right: Connection status */}
      <div className="vscode-titlebar-controls">
        <div className="vscode-statusbar-item" style={{ height: 'auto', padding: '2px 6px' }}>
          <span
            className={`vscode-connection-dot ${backendStatus === 'connected' ? 'connected' : 'disconnected'}`}
          />
          <span style={{ fontSize: 11 }}>API</span>
        </div>
        <div className="vscode-statusbar-item" style={{ height: 'auto', padding: '2px 6px' }}>
          <span
            className={`vscode-connection-dot ${
              socketStatus === 'connected' ? 'connected' : socketStatus === 'disconnected' ? 'disconnected' : 'connecting'
            }`}
          />
          <span style={{ fontSize: 11 }}>Live</span>
        </div>
      </div>
    </div>
  );
}

export default TitleBar;
