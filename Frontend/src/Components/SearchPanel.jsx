// ================================================
// SearchPanel.jsx — VS Code Search Sidebar Panel
// ================================================
import { useState } from 'react';
import {
  VscRegex,
  VscCaseSensitive,
  VscWholeWord,
  VscReplace,
  VscReplaceAll,
  VscChevronDown,
  VscChevronRight,
  VscEllipsis,
  VscListFlat,
  VscNewFile,
  VscExclude,
} from 'react-icons/vsc';

function SearchPanel() {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="vscode-search-panel">
      {/* Search row with expand/collapse for replace */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <button
          className="vscode-search-action-btn"
          onClick={() => setShowReplace(!showReplace)}
          title="Toggle Replace"
          style={{ marginTop: 2 }}
        >
          {showReplace ? <VscChevronDown /> : <VscChevronRight />}
        </button>

        <div style={{ flex: 1 }}>
          {/* Search Input */}
          <div className="vscode-search-input-wrapper">
            <input
              className="vscode-search-input"
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="vscode-search-actions">
              <button
                className={`vscode-search-action-btn ${caseSensitive ? 'active' : ''}`}
                onClick={() => setCaseSensitive(!caseSensitive)}
                title="Match Case"
              >
                <VscCaseSensitive />
              </button>
              <button
                className={`vscode-search-action-btn ${wholeWord ? 'active' : ''}`}
                onClick={() => setWholeWord(!wholeWord)}
                title="Match Whole Word"
              >
                <VscWholeWord />
              </button>
              <button
                className={`vscode-search-action-btn ${useRegex ? 'active' : ''}`}
                onClick={() => setUseRegex(!useRegex)}
                title="Use Regular Expression"
              >
                <VscRegex />
              </button>
            </div>
          </div>

          {/* Replace Input */}
          {showReplace && (
            <div className="vscode-search-input-wrapper" style={{ marginTop: 4 }}>
              <input
                className="vscode-search-input"
                type="text"
                placeholder="Replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
              <div className="vscode-search-actions">
                <button className="vscode-search-action-btn" title="Replace">
                  <VscReplace />
                </button>
                <button className="vscode-search-action-btn" title="Replace All">
                  <VscReplaceAll />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle file includes/excludes */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 4px', marginBottom: 4 }}>
        <button
          className="vscode-search-action-btn"
          onClick={() => setShowDetails(!showDetails)}
          title="Toggle Search Details"
        >
          <VscEllipsis />
        </button>
      </div>

      {/* Files to include/exclude */}
      {showDetails && (
        <div style={{ padding: '0 4px' }}>
          <div className="vscode-search-input-wrapper" style={{ marginBottom: 4 }}>
            <input
              className="vscode-search-input"
              type="text"
              placeholder="files to include"
            />
            <button className="vscode-search-action-btn" title="Only Open Editors">
              <VscNewFile />
            </button>
          </div>
          <div className="vscode-search-input-wrapper">
            <input
              className="vscode-search-input"
              type="text"
              placeholder="files to exclude"
            />
            <button className="vscode-search-action-btn" title="Use Exclude Settings">
              <VscExclude />
            </button>
          </div>
        </div>
      )}

      {/* Results area */}
      {searchText ? (
        <div className="vscode-search-info">
          <span style={{ color: 'var(--vscode-text-primary)' }}>
            Search across files will be available when connected to a project.
          </span>
        </div>
      ) : (
        <div className="vscode-search-info">
          Type to search across your collaborative files.
        </div>
      )}
    </div>
  );
}

export default SearchPanel;
