import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import MappingPage from './pages/MappingPage';
import PlannerPage from './pages/PlannerPage';
import DraftsPage from './pages/DraftsPage';
import MediaPage from './pages/MediaPage';
import HashtagsPage from './pages/HashtagsPage';
import WindowsPage from './pages/WindowsPage';
import StatusPage from './pages/StatusPage';
import './styles/tokens.css';
import './index.css';
import { LayoutShell } from './components/layout/LayoutShell';

function App() {
  return (
    <Router basename="/admin">
      <LayoutShell>
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/mapping" element={<MappingPage />} />
          <Route path="/plan" element={<PlannerPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/hashtags" element={<HashtagsPage />} />
          <Route path="/windows" element={<WindowsPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
      </LayoutShell>
    </Router>
  );
}

export default App;
