// ================================================
// WelcomeTab.jsx — VS Code Welcome Screen
// Now with working Create Room and Join Room buttons
// ================================================
import {
  VscNewFile,
  VscFolderOpened,
  VscRemote,
  VscLiveShare,
  VscCodeOss,
  VscLightbulb,
} from 'react-icons/vsc';

function WelcomeTab({ onNewFile, onCreateRoom, onJoinRoom, recentItems = [] }) {
  return (
    <div className="vscode-welcome">
      {/* Header — "CodeTogether" with subtitle */}
      <div className="vscode-welcome-header">
        <h1>CodeTogether</h1>
        <p>Collaborative coding, simplified</p>
      </div>

      {/* Two-column layout matching VS Code */}
      <div className="vscode-welcome-content">
        {/* Left Column: Start */}
        <div className="vscode-welcome-column">
          <div className="vscode-welcome-section-title">Start</div>

          <button className="vscode-welcome-link" onClick={onNewFile}>
            <VscNewFile /> New File...
          </button>
          <button className="vscode-welcome-link">
            <VscFolderOpened /> Open...
          </button>
          <button className="vscode-welcome-link" onClick={onCreateRoom}>
            <VscLiveShare /> Create Room...
          </button>
          <button className="vscode-welcome-link" onClick={onJoinRoom}>
            <VscRemote /> Join Room...
          </button>

          {/* Recent section — prepared for future phases */}
          {recentItems.length > 0 && (
            <div className="vscode-welcome-recent">
              <div className="vscode-welcome-section-title">Recent</div>
              {recentItems.map((item, i) => (
                <div key={i} className="vscode-welcome-recent-item">
                  <span className="vscode-recent-name">{item.name}</span>
                  <span className="vscode-recent-path">{item.path}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Walkthroughs */}
        <div className="vscode-welcome-column">
          <div className="vscode-welcome-section-title">Walkthroughs</div>

          <div className="vscode-welcome-walkthrough">
            <div className="vscode-welcome-walkthrough-icon">
              <VscCodeOss />
            </div>
            <div className="vscode-welcome-walkthrough-text">
              <h3>Get started with CodeTogether</h3>
              <p>Set up your editor, learn the basics, and start coding</p>
            </div>
          </div>

          <div className="vscode-welcome-walkthrough">
            <div className="vscode-welcome-walkthrough-icon">
              <VscLightbulb />
            </div>
            <div className="vscode-welcome-walkthrough-text">
              <h3>Learn collaborative editing</h3>
              <p>Create rooms, invite peers, and code together in real-time</p>
            </div>
          </div>

          <button className="vscode-welcome-link" style={{ marginTop: 8 }}>
            More...
          </button>
        </div>
      </div>

      {/* Bottom: Show welcome page checkbox */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: 40, 
        gap: 8, 
        alignItems: 'center',
        color: 'var(--vscode-text-secondary)',
        fontSize: 13,
      }}>
        <input type="checkbox" defaultChecked id="showWelcome" style={{ accentColor: 'var(--vscode-accent)' }} />
        <label htmlFor="showWelcome">Show welcome page on startup</label>
      </div>
    </div>
  );
}

export default WelcomeTab;