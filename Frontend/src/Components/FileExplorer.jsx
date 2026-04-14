// ================================================
// FileExplorer.jsx — VS Code File Explorer (Sidebar)
// ================================================
import { useState } from 'react';
import {
  VscChevronDown,
  VscChevronRight,
  VscNewFile,
  VscNewFolder,
  VscCollapseAll,
  VscEllipsis,
} from 'react-icons/vsc';
import {
  VscJson,
  VscCode,
  VscFile,
  VscMarkdown,
  VscSymbolNamespace,
} from 'react-icons/vsc';

// File type to icon + color map (matching VS Code's icon theme)
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    js:   { Icon: VscCode, color: '#e8d44d' },      // Yellow for JS
    jsx:  { Icon: VscCode, color: '#61dafb' },       // React blue for JSX
    ts:   { Icon: VscCode, color: '#3178c6' },       // TypeScript blue
    tsx:  { Icon: VscCode, color: '#61dafb' },
    json: { Icon: VscJson, color: '#e8d44d' },
    md:   { Icon: VscMarkdown, color: '#519aba' },
    css:  { Icon: VscSymbolNamespace, color: '#563d7c' },
    html: { Icon: VscCode, color: '#e34c26' },
  };
  return map[ext] || { Icon: VscFile, color: '#cccccc' };
};

// Demo file tree — this will be replaced with real files in future phases
const demoFiles = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'Components',
        type: 'folder',
        children: [
          { name: 'CodeEditor.jsx', type: 'file' },
        ],
      },
      { name: 'App.jsx', type: 'file' },
      { name: 'main.jsx', type: 'file' },
      { name: 'index.css', type: 'file' },
    ],
  },
  // { name: 'package.json', type: 'file' },
  // { name: 'vite.config.js', type: 'file' },
  { name: 'index.html', type: 'file' },
];

function TreeItem({ item, depth = 0, onFileClick }) {
  const [expanded, setExpanded] = useState(true);
  const isFolder = item.type === 'folder';
  const paddingLeft = 8 + depth * 16;

  const handleClick = () => {
    if (isFolder) {
      setExpanded(!expanded);
    } else {
      onFileClick(item.name);
    }
  };

  return (
    <>
      <div
        className="vscode-tree-item"
        style={{ paddingLeft }}
        onClick={handleClick}
      >
        {isFolder && (
          <span className="vscode-tree-item-icon" style={{ color: 'var(--vscode-text-secondary)' }}>
            {expanded ? <VscChevronDown /> : <VscChevronRight />}
          </span>
        )}
        {!isFolder && (
          <span className="vscode-tree-item-icon" style={{ color: getFileIcon(item.name).color }}>
            {(() => { const { Icon } = getFileIcon(item.name); return <Icon />; })()}
          </span>
        )}
        <span>{item.name}</span>
      </div>

      {isFolder && expanded && item.children?.map((child, i) => (
        <TreeItem key={i} item={child} depth={depth + 1} onFileClick={onFileClick} />
      ))}
    </>
  );
}

function FileExplorer({ onFileOpen }) {
  return (
    <>
      {/* Section header with action buttons */}
      <div className="vscode-tree-section" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="vscode-tree-section-chevron"><VscChevronDown /></span>
          <span>CodeTogether</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="vscode-search-action-btn" title="New File"><VscNewFile /></button>
          <button className="vscode-search-action-btn" title="New Folder"><VscNewFolder /></button>
          <button className="vscode-search-action-btn" title="Collapse All"><VscCollapseAll /></button>
          <button className="vscode-search-action-btn" title="More Actions"><VscEllipsis /></button>
        </div>
      </div>

      {/* File tree */}
      {demoFiles.map((item, i) => (
        <TreeItem key={i} item={item} depth={0} onFileClick={onFileOpen} />
      ))}
    </>
  );
}

export default FileExplorer;
