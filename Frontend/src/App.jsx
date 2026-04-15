// ================================================
// Welcome page (create/join rooms)
// ================================================
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <Routes>
      {/* Welcome Page Router */}
      <Route path="/" element={<WelcomePage />} />

      {/* Create Room/Join Room Router */}
      <Route path="/room/:roomId" element={<RoomPage />} />
    </Routes>
  );
}

export default App;
