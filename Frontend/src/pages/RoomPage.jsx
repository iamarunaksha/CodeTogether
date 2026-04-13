// ================================================
// Frontend/src/pages/RoomPage.jsx
// The page component for /room/:roomId
// ================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRoom, leaveRoom } from '../lib/collaboration';

// VS Code Shell Components
import TitleBar from '../Components/TitleBar';
import ActivityBar from '../Components/ActivityBar';
import Sidebar from '../Components/Sidebar';
import TabBar from '../Components/TabBar';
import StatusBar from '../Components/StatusBar';
import CodeEditor from '../Components/CodeEditor';

// Unique ID generator for tabs
let tabIdCounter = 0;
const createTabId = () => `tab-${++tabIdCounter}`;

function RoomPage() {
  // ---- Extract room ID from the URL ----
  // If URL is /room/abc-123, then roomId = "abc-123"
  // useParams() is a React Router hook that reads URL parameters
  const { roomId } = useParams();

  // ---- Get the Yjs room data ----
  // getRoom() either creates a new room or returns the cached one
  const roomRef = useRef(null);
  if (!roomRef.current || roomRef.current.roomId !== roomId) {
    roomRef.current = { ...getRoom(roomId), roomId };
  }
  const { yText, provider } = roomRef.current;

  // ---- Connection State ----
  const [backendStatus, setBackendStatus] = useState('checking');
  const [socketStatus, setSocketStatus] = useState(
    provider.wsconnected ? 'connected' : 'disconnected'
  );

  // ---- Editor State ----
  const [language, setLanguage] = useState('javascript');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // ---- UI Layout State ----
  const [activePanel, setActivePanel] = useState('explorer');
  const [tabs, setTabs] = useState([
    { id: createTabId(), name: 'Untitled-1', type: 'editor', language: 'javascript' },
  ]);
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // ---- Connection + Cleanup ----
  useEffect(() => {
    // Check HTTP backend health
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // Track Yjs provider status
    setSocketStatus(provider.wsconnected ? 'connected' : 'disconnected');

    const handleStatus = ({ status }) => {
      console.log(`🔄 Room ${roomId} — Yjs status: ${status}`);
      setSocketStatus(status === 'connected' ? 'connected' : 'disconnected');
    };

    provider.on('status', handleStatus);

    // CLEANUP: When this component unmounts (user navigates away),
    // disconnect from the room to free resources.
    return () => {
      provider.off('status', handleStatus);
      leaveRoom(roomId);
    };
  }, [roomId, provider]);

  // ---- Tab Management ----
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

  const closeTab = useCallback((tabId) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        const newTab = { id: createTabId(), name: 'Untitled-1', type: 'editor', language: 'javascript' };
        setActiveTab(newTab.id);
        return [newTab];
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

  // ---- Cursor Position Tracking ----
  const handleEditorMount = useCallback((editor) => {
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  }, []);

  const currentTab = tabs.find((t) => t.id === activeTab);

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
            {currentTab?.type === 'editor' ? (
              <CodeEditor
                language={language}
                onMount={handleEditorMount}
                yText={yText}
                provider={provider}
              />
            ) : null}
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

export default RoomPage;