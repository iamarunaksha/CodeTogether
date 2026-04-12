// ================================================
// Sidebar.jsx — VS Code Collapsible Sidebar
// ================================================
import FileExplorer from './FileExplorer';
import SearchPanel from './SearchPanel';
import { VscSourceControl, VscExtensions, VscAccount, VscSettingsGear } from 'react-icons/vsc';

// Panel title mapping
const panelTitles = {
  explorer: 'Explorer',
  search: 'Search',
  sourceControl: 'Source Control',
  extensions: 'Extensions',
  account: 'Accounts',
  settings: 'Settings',
};

// Placeholder panels for features we'll build later
function PlaceholderPanel({ title, icon: Icon }) {
  return (
    <div style={{ padding: 16, textAlign: 'center', color: 'var(--vscode-text-secondary)' }}>
      <Icon style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
      <p style={{ fontSize: 13 }}>{title}</p>
      <p style={{ fontSize: 12, marginTop: 4 }}>Coming in a future phase</p>
    </div>
  );
}

function Sidebar({ activePanel, onFileOpen }) {
  if (!activePanel) return null;

  const renderContent = () => {
    switch (activePanel) {
      case 'explorer':
        return <FileExplorer onFileOpen={onFileOpen} />;
      case 'search':
        return <SearchPanel />;
      case 'sourceControl':
        return <PlaceholderPanel title="Source Control" icon={VscSourceControl} />;
      case 'extensions':
        return <PlaceholderPanel title="Extensions" icon={VscExtensions} />;
      case 'account':
        return <PlaceholderPanel title="Accounts" icon={VscAccount} />;
      case 'settings':
        return <PlaceholderPanel title="Settings" icon={VscSettingsGear} />;
      default:
        return null;
    }
  };

  return (
    <div className="vscode-sidebar">
      <div className="vscode-sidebar-header">
        <span>{panelTitles[activePanel] || activePanel}</span>
      </div>
      <div className="vscode-sidebar-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Sidebar;
