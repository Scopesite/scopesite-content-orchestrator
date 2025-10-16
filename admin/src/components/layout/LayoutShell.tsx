import React from 'react';
import { Home, Settings, Calendar, FileText, Image, Hash, Clock, BarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)]/70 flex flex-col">
        <div className="p-6 border-b border-[var(--border)]/70">
          <h1 className="text-xl font-bold glow-text">ScopeSite</h1>
          <p className="text-sm text-[var(--muted)]">Content Orchestrator</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[var(--panel-2)] text-[var(--text)] border border-[var(--border)]' : 'hover:bg-[var(--panel-2)]/60 text-[var(--text)]'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border)]/70 text-xs text-[var(--muted)]">
          <p>v0.2.0</p>
          <p>© 2025 ScopeSite</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-[var(--border)]/70 flex items-center justify-between px-4">
          <div className="text-sm text-[var(--muted)]">Workspace</div>
          <div className="flex items-center gap-2">
            <a href="/admin" className="btn-glow px-3 py-1.5 rounded-lg text-sm border border-[var(--border)]">Refresh</a>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};


