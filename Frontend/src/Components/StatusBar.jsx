// ================================================
// StatusBar.jsx — VS Code Status Bar
// ================================================
import {
  VscSourceControl,
  VscError,
  VscWarning,
  VscBell,
  VscFeedback,
  VscBroadcast,
} from 'react-icons/vsc';

function StatusBar({ language, socketStatus, lineNumber, columnNumber }) {
  return (
    <div className="vscode-statusbar">
      {/* Left side */}
      <div className="vscode-statusbar-left">
        {/* Git branch */}
        <div className="vscode-statusbar-item">
          <VscSourceControl />
          <span>main</span>
        </div>

        {/* Errors & Warnings */}
        <div className="vscode-statusbar-item">
          <VscError style={{ fontSize: 14 }} />
          <span>0</span>
          <VscWarning style={{ fontSize: 14, marginLeft: 2 }} />
          <span>0</span>
        </div>
      </div>

      {/* Right side */}
      <div className="vscode-statusbar-right">
        {/* Live sync status */}
        <div className="vscode-statusbar-item">
          <VscBroadcast style={{ fontSize: 14 }} />
          <span
            className={`vscode-connection-dot ${
              socketStatus === 'connected' ? 'connected' : 'disconnected'
            }`}
            style={{ width: 6, height: 6, marginRight: 2 }}
          />
          <span>{socketStatus === 'connected' ? 'Live' : 'Offline'}</span>
        </div>

        {/* Cursor position */}
        <div className="vscode-statusbar-item">
          <span>Ln {lineNumber}, Col {columnNumber}</span>
        </div>

        {/* Tab size */}
        <div className="vscode-statusbar-item">
          <span>Spaces: 2</span>
        </div>

        {/* Encoding */}
        <div className="vscode-statusbar-item">
          <span>UTF-8</span>
        </div>

        {/* Language */}
        <div className="vscode-statusbar-item">
          <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
        </div>

        {/* Notification bell */}
        <div className="vscode-statusbar-item">
          <VscBell style={{ fontSize: 14 }} />
        </div>
      </div>
    </div>
  );
}

export default StatusBar;