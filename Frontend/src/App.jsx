import { useState, useEffect } from 'react';

function App() {
  // "state" = data that can change and causes the UI to re-render
  const [backendStatus, setBackendStatus] = useState('checking');

  // useEffect runs code AFTER the component appears on screen
  // The [] at the end means "run this only once, when the page loads"
  useEffect(() => {
    // fetch() makes an HTTP request (like visiting a URL, but from code)
    fetch('/api/health')
      .then((response) => response.json())     // Parse JSON response
      .then((data) => {
        console.log('Backend response:', data);  // Log it for debugging
        setBackendStatus('connected');            // Update the state
      })
      .catch((error) => {
        console.error('Backend error:', error);
        setBackendStatus('disconnected');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          CodeTogether
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Real-time collaborative code editor
        </p>
        <div className="flex gap-4 justify-center">
          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
            Frontend Running
          </div>
          {backendStatus === 'checking' && (
            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg border border-yellow-500/30 animate-pulse">
              ⏳ Checking Backend...
            </div>
          )}
          {backendStatus === 'connected' && (
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
              Backend Connected
            </div>
          )}
          {backendStatus === 'disconnected' && (
            <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30">
              Backend Disconnected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;