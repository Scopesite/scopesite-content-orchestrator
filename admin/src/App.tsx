import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Settings, Calendar, FileText, Image, Hash, Clock, BarChart } from 'lucide-react';
import SetupPage from './pages/SetupPage';
import MappingPage from './pages/MappingPage';
import PlannerPage from './pages/PlannerPage';
import DraftsPage from './pages/DraftsPage';
import MediaPage from './pages/MediaPage';
import HashtagsPage from './pages/HashtagsPage';
import WindowsPage from './pages/WindowsPage';
import StatusPage from './pages/StatusPage';
import './index.css';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const links = [
    { to: '/', icon: Home, label: 'Setup' },
    { to: '/mapping', icon: Settings, label: 'Mapping' },
    { to: '/plan', icon: Calendar, label: 'Planner' },
    { to: '/drafts', icon: FileText, label: 'Drafts' },
    { to: '/media', icon: Image, label: 'Media' },
    { to: '/hashtags', icon: Hash, label: 'Hashtags' },
    { to: '/windows', icon: Clock, label: 'Windows' },
    { to: '/status', icon: BarChart, label: 'Status' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">ScopeSite</h1>
          <p className="text-sm text-gray-500">Content Orchestrator</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <p>v0.2.0</p>
          <p>© 2025 ScopeSite</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
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
      </Layout>
    </Router>
  );
}

export default App;
