// ================================================
// App.jsx — VS Code Layout Orchestrator
// Now uses Yjs for real-time sync (replaces Socket.IO code-change)
// ================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { provider } from './lib/collaboration';

// VS Code Shell Components
import TitleBar from './Components/TitleBar';
import ActivityBar from './Components/ActivityBar';
import Sidebar from './Components/Sidebar';
import TabBar from './Components/TabBar';
import WelcomeTab from './Components/WelcomeTab';
import StatusBar from './Components/StatusBar';
import CodeEditor from './Components/CodeEditor';

// Unique ID generator for tabs
let tabIdCounter = 0;
const createTabId = () => `tab-${++tabIdCounter}`;

function App() {
  // ---- Connection State ----
  const [backendStatus, setBackendStatus] = useState('checking');
  const [socketStatus, setSocketStatus] = useState(provider.wsconnected ? 'connected' : 'disconnected');
  // socketStatus now tracks the YJS provider connection, not Socket.IO

  // ---- Editor State ----
  // REMOVED: const [code, setCode] = useState(...)
  //   → Yjs now owns the code content. No React state needed.
  const [language, setLanguage] = useState('javascript');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // ---- UI Layout State ----
  const [activePanel, setActivePanel] = useState('explorer');
  const [tabs, setTabs] = useState([
    { id: 'welcome', name: 'Welcome', type: 'welcome' },
  ]);
  const [activeTab, setActiveTab] = useState('welcome');

  // ---- Yjs Provider Status ----
  useEffect(() => {
    // Check HTTP backend health (same as before)
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // Track Yjs WebSocket provider connection status
    // Ensure we capture the current state immediately (fixes React StrictMode race conditions)
    setSocketStatus(provider.wsconnected ? 'connected' : 'disconnected');
    
    const handleStatus = ({ status }) => {
      console.log('🔄 Yjs provider status:', status);
      setSocketStatus(status === 'connected' ? 'connected' : 'disconnected');
    };

    provider.on('status', handleStatus);

    // Cleanup: remove listener when component unmounts
    return () => {
      provider.off('status', handleStatus);
    };
  }, []);

  // REMOVED: handleCodeChange, isRemoteChange ref, socketRef
  //   → All handled by Yjs + MonacoBinding now

  // ---- Tab Management (unchanged from Phase 3.5) ----
  const openFile = useCallback((fileName) => {
    const existingTab = tabs.find((t) => t.name === fileName);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const ext = fileName.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      json: 'json', md: 'markdown', css: 'css', html: 'html',
      py: 'python', java: 'java', cpp: 'cpp', go: 'go', rs: 'rust',
    };

    const newTab = {
      id: createTabId(),
      name: fileName,
      type: 'editor',
      language: langMap[ext] || 'plaintext',
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    setLanguage(newTab.language);
  }, [tabs]);

  const handleNewFile = useCallback(() => {
    const newTab = {
      id: createTabId(),
      name: 'Untitled-1',
      type: 'editor',
      language: 'plaintext',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    setLanguage('plaintext');
  }, []);

  const closeTab = useCallback((tabId) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        const welcomeTab = { id: 'welcome', name: 'Welcome', type: 'welcome' };
        setActiveTab('welcome');
        return [welcomeTab];
      }
      return newTabs;
    });
  }, [activeTab]);

  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab && tab.language) {
      setLanguage(tab.language);
    }
  }, [tabs]);

  // ---- Cursor Position Tracking (unchanged) ----
  const handleEditorMount = useCallback((editor) => {
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  }, []);

  const currentTab = tabs.find((t) => t.id === activeTab);

  // ---- Render (unchanged except CodeEditor props) ----
  return (
    <div className="vscode-app">
      <TitleBar
        socketStatus={socketStatus}
        backendStatus={backendStatus}
      />

      <div className="vscode-main">
        <ActivityBar
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        <Sidebar
          activePanel={activePanel}
          onFileOpen={openFile}
        />

        <div className="vscode-editor-area">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={switchTab}
            onTabClose={closeTab}
          />

          <div className="vscode-editor-content">
            {currentTab?.type === 'welcome' ? (
              <WelcomeTab onNewFile={handleNewFile} />
            ) : (
              // NOTICE: No value or onChange props!
              // Yjs + MonacoBinding handles everything
              <CodeEditor
                language={language}
                onMount={handleEditorMount}
              />
            )}
          </div>
        </div>
      </div>

      <StatusBar
        language={language}
        socketStatus={socketStatus}
        lineNumber={cursorPosition.line}
        columnNumber={cursorPosition.column}
      />
    </div>
  );
}

export default App;