import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [text, setText] = useState('');

  // useRef stores values that persist across re-renders without causing a re-render.
  // We want ONE connection, so we store it here.
  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    // ---- CHECK HTTP BACKEND ----
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // ---- CONNECT TO WEBSOCKET ----
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id);
      setSocketStatus('connected');
    });

    // Listen for code changes from OTHER users
    socket.on('code-change', (data) => {
      console.log('📨 Received code change');
      isRemoteChange.current = true;   // Flag to prevent a loop
      setText(data.content);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setSocketStatus('disconnected');
    });

    // Cleanup: disconnect when component unmounts
    return () => socket.disconnect();
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Only emit to server if the USER typed it (not received from server)
    if (!isRemoteChange.current) {
      socketRef.current?.emit('code-change', { content: newText });
    }
    isRemoteChange.current = false;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">CodeTogether</h1>
        <div className="flex gap-3">
          <div className={`px-3 py-1 rounded-full text-sm ${
            backendStatus === 'connected'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {backendStatus === 'connected' ? '● API' : '○ API'}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            socketStatus === 'connected'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {socketStatus === 'connected' ? '● Live' : '○ Connecting...'}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4">
        <div className="text-gray-400 text-sm">
          Open this page in another browser tab and start typing — changes sync in real-time!
        </div>

        <textarea
          value={text}
          onChange={handleTextChange}
          className="flex-1 bg-gray-800 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-700 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Start typing here... It will sync to other tabs in real-time!"
          spellCheck={false}
        />
      </main>

      <footer className="bg-blue-600 px-4 py-1 flex items-center justify-between text-white text-xs">
        <span>WebSocket: {socketStatus}</span>
        <span>Phase 2: Real-time Sync Demo</span>
      </footer>
    </div>
  );
}

export default App;