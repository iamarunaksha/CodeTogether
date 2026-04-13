// ================================================
// App.jsx — Now a Router that directs traffic
// / → Welcome page (create/join rooms)
// /room/:roomId → Collaborative editor room
// ================================================
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <Routes>
      {/* The Welcome page — shown at the root URL */}
      <Route path="/" element={<WelcomePage />} />
      
      {/* A room — the :roomId part is a URL parameter */}
      <Route path="/room/:roomId" element={<RoomPage />} />
    </Routes>
  );
}

export default App;