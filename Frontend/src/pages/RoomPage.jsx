// ================================================
// Frontend/src/pages/RoomPage.jsx
// The page component for /room/:roomId
// ================================================
import TerminalPanel from '../Components/TerminalPanel';
import { executeCode } from '../lib/codeRunner';
import { VscPlay } from 'react-icons/vsc';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRoom, leaveRoom } from '../lib/collaboration';
import { generateUserIdentity } from '../lib/userIdentity';

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

  // Generate a persistent identity for this tab
  // useRef so it doesn't change on every re-render
  const userRef = useRef(generateUserIdentity());

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

  // ---- Presence State ----
  const [connectedUsers, setConnectedUsers] = useState([]);

  // ---- Terminal State ----
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Store the Monaco editor instance so we can read its value
  const editorRef = useRef(null);

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

  // ---- Phase 6: Awareness (Live Cursors) ----
  useEffect(() => {
    const awareness = provider.awareness;

    // 1. BROADCAST: Tell everyone who we are
    awareness.setLocalStateField('user', {
      name: userRef.current.name,
      color: userRef.current.color,
    });

    // 2. LISTEN: When anyone's awareness state changes, update our user list
    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().entries());

      const users = states
        .filter(([, state]) => state.user)   // Only users who have set their identity
        .map(([clientId, state]) => ({
          clientId,
          name: state.user.name,
          color: state.user.color,
        }));

      setConnectedUsers(users);

      // 3. INJECT CSS: Create dynamic per-user color styles
      //    y-monaco uses classes like .yRemoteSelection-12345
      //    We need to set --remote-user-color for each client ID
      let styleContent = '';
      users.forEach((user) => {
        if (user.clientId !== awareness.doc.clientID) {
          styleContent += `
            .yRemoteSelection-${user.clientId} {
              background-color: ${user.color}33;
            }
            .yRemoteSelectionHead-${user.clientId} {
              border-color: ${user.color};
            }
            .yRemoteSelectionHead-${user.clientId}::after {
              background-color: ${user.color};
              content: '${user.name}';
            }
          `;
        }
      });

      // Find or create the dynamic style tag
      let styleEl = document.getElementById('yjs-cursor-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'yjs-cursor-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = styleContent;
    };

    // Run immediately to catch users already in the room
    handleAwarenessChange();

    awareness.on('change', handleAwarenessChange);

    return () => {
      awareness.off('change', handleAwarenessChange);
      // Clean up the injected style tag
      const styleEl = document.getElementById('yjs-cursor-styles');
      if (styleEl) styleEl.remove();
    };
  }, [provider]);

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
  const handleEditorMount = useCallback((editor, monaco) => {
    
    editorRef.current = editor;  // Store editor for code reading

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Ctrl+Enter / Cmd+Enter keyboard shortcut to run code
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      run: () => handleRun(),
    });
  }, []);

  // ---- Code Execution (Phase 8) ----
  const handleRun = useCallback(() => {
    if (isRunning) return;

    const code = editorRef.current?.getValue() || '';
    if (!code.trim()) {
      setTerminalOutput(prev => [...prev, {
        type: 'system', args: ['No code to execute.'],
      }]);
      setTerminalOpen(true);
      return;
    }

    setIsRunning(true);
    setTerminalOpen(true);

    setTerminalOutput(prev => [...prev, {
      type: 'system',
      args: ['▶ Running JavaScript... (' + new Date().toLocaleTimeString() + ')'],
    }]);

    executeCode(
      code,
      (output) => setTerminalOutput(prev => [...prev, output]),
      () => {
        setTerminalOutput(prev => [...prev, {
          type: 'system', args: ['✓ Program exited.'],
        }]);
        setIsRunning(false);
      },
      5000
    );
  }, [isRunning]);

  const handleClear = useCallback(() => {
    setTerminalOutput([]);
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
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--vscode-tab-bar-bg)' }}>
            <div>
              <TabBar
                tabs={tabs}
                activeTab={activeTab}
                onTabClick={switchTab}
                onTabClose={closeTab}
              />
            </div>

            <div style={{ marginLeft: '92.5rem' }}>
              <button
                className="vscode-run-button"
                onClick={handleRun}
                disabled={isRunning}
                title="Run Code (Ctrl+Enter)"
              >
                <VscPlay style={{ fontSize: 14 }} />
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

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

          {terminalOpen && (
            <TerminalPanel
              output={terminalOutput}
              onRun={handleRun}
              onClear={handleClear}
              onClose={() => setTerminalOpen(false)}
            />
          )}
        </div>
      </div>

      <StatusBar
        language={language}
        socketStatus={socketStatus}
        lineNumber={cursorPosition.line}
        columnNumber={cursorPosition.column}
        connectedUsers={connectedUsers}
      />
    </div>
  );
}

export default RoomPage;