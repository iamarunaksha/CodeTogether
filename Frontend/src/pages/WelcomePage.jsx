// ================================================
// Frontend/src/pages/WelcomePage.jsx
// Landing page — create or join a room
// ================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Reuse existing VS Code shell components
import TitleBar from '../Components/TitleBar';
import ActivityBar from '../Components/ActivityBar';
import Sidebar from '../Components/Sidebar';
import TabBar from '../Components/TabBar';
import WelcomeTab from '../Components/WelcomeTab';
import StatusBar from '../Components/StatusBar';

function WelcomePage() {
  
  const navigate = useNavigate();

  // UI state for the sidebar
  const [activePanel, setActivePanel] = useState('explorer');

  // ---- Create a new room ----
  // Generates a UUID and navigates to /room/<uuid>
  const handleCreateRoom = () => {
    const roomId = uuidv4();  // "550e8400-e29b-41d4-a716-446655440000"
    console.log(`Created room: ${roomId}`);
    navigate(`/room/${roomId}`);
  };

  // ---- Join an existing room ----
  // Prompts the user for a room ID and navigates to it
  const handleJoinRoom = () => {
    
    const roomId = prompt('Enter the Room ID or paste the share link:');
    
    if(roomId) {
      // Handles the case if user pastes a full URL like "http://localhost:5173/room/abc-123"
      const id = roomId.includes('/room/') 
        ? roomId.split('/room/')[1]   // Extract just the ID part
        : roomId.trim();              // Use as-is if it's just the ID
      
      if (id) {
        navigate(`/room/${id}`);
      }
    }
  };

  return (
    <div className="vscode-app">
      <TitleBar socketStatus="disconnected" backendStatus="checking" />

      <div className="vscode-main">
        <ActivityBar
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        <Sidebar
          activePanel={activePanel}
          onFileOpen={() => {}}
        />

        <div className="vscode-editor-area">
          <TabBar
            tabs={[{ id: 'welcome', name: 'Welcome', type: 'welcome' }]}
            activeTab="welcome"
            onTabClick={() => {}}
            onTabClose={() => {}}
          />

          <div className="vscode-editor-content">
            <WelcomeTab
              onNewFile={handleCreateRoom}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
            />
          </div>
        </div>
      </div>

      <StatusBar
        language="plaintext"
        socketStatus="disconnected"
        lineNumber={1}
        columnNumber={1}
      />
    </div>
  );
}

export default WelcomePage;
