// ================================================
// TabBar.jsx — VS Code Editor Tabs
// ================================================
import {
  VscClose,
  VscCode,
  VscJson,
  VscFile,
  VscMarkdown,
  VscSymbolNamespace,
} from 'react-icons/vsc';

// Get the icon + color for a file tab
const getTabIcon = (fileName) => {
  // Welcome tab has no file extension
  if (fileName === 'Welcome') {
    return { Icon: VscFile, color: 'var(--vscode-text-secondary)' };
  }

  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    js:   { Icon: VscCode, color: '#e8d44d' },
    jsx:  { Icon: VscCode, color: '#61dafb' },
    ts:   { Icon: VscCode, color: '#3178c6' },
    tsx:  { Icon: VscCode, color: '#61dafb' },
    json: { Icon: VscJson, color: '#e8d44d' },
    md:   { Icon: VscMarkdown, color: '#519aba' },
    css:  { Icon: VscSymbolNamespace, color: '#563d7c' },
    html: { Icon: VscCode, color: '#e34c26' },
  };
  return map[ext] || { Icon: VscFile, color: '#cccccc' };
};

function TabBar({ tabs, activeTab, onTabClick, onTabClose }) {
  return (
    <div className="vscode-tabbar">
      {tabs.map((tab) => {
        const { Icon, color } = getTabIcon(tab.name);
        const isActive = activeTab === tab.id;

        return (
          <div
            key={tab.id}
            className={`vscode-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className="vscode-tab-icon" style={{ color }}>
              <Icon />
            </span>
            <span>{tab.name}</span>
            <button
              className="vscode-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close"
            >
              <VscClose />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default TabBar;
