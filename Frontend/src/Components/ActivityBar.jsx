// ================================================
// ActivityBar.jsx — VS Code Left Icon Strip
// ================================================
import {
  VscFiles,
  VscSearch,
  VscSourceControl,
  VscExtensions,
  VscAccount,
  VscSettingsGear,
} from 'react-icons/vsc';

const topItems = [
  { id: 'explorer', icon: VscFiles, title: 'Explorer (Ctrl+Shift+E)' },
  { id: 'search', icon: VscSearch, title: 'Search (Ctrl+Shift+F)' },
  { id: 'sourceControl', icon: VscSourceControl, title: 'Source Control (Ctrl+Shift+G)' },
  { id: 'extensions', icon: VscExtensions, title: 'Extensions (Ctrl+Shift+X)' },
];

const bottomItems = [
  { id: 'account', icon: VscAccount, title: 'Accounts' },
  { id: 'settings', icon: VscSettingsGear, title: 'Manage' },
];

function ActivityBar({ activePanel, onPanelChange }) {
  const handleClick = (panelId) => {
    // If clicking the same icon, toggle sidebar off. Otherwise, switch panel.
    if (activePanel === panelId) {
      onPanelChange(null);
    } else {
      onPanelChange(panelId);
    }
  };

  return (
    <div className="vscode-activitybar">
      <div className="vscode-activitybar-top">
        {topItems.map((item) => (
          <button
            key={item.id}
            className={`vscode-activitybar-icon ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => handleClick(item.id)}
            title={item.title}
          >
            <item.icon />
          </button>
        ))}
      </div>

      <div className="vscode-activitybar-bottom">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className={`vscode-activitybar-icon ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => handleClick(item.id)}
            title={item.title}
          >
            <item.icon />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ActivityBar;
