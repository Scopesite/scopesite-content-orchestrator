import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function SetupPage() {
  const [health, setHealth] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const healthData = await api.health();
      setHealth(healthData);
      
      const workspacesData = await api.getWorkspaces();
      setWorkspaces(workspacesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const StatusBadge = ({ status }: { status: boolean }) => {
    return status ? (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={20} />
        <span className="font-medium">Connected</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle size={20} />
        <span className="font-medium">Failed</span>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-[var(--text)]">
      <div className="mb-8 animate-float-in">
        <h1 className="text-3xl font-bold glow-text mb-2">Setup & Health</h1>
        <p className="text-[var(--muted)]">Check system status and environment configuration</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* API Health */}
        <div className="panel rounded-xl p-6 animate-float-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold glow-text">API Status</h2>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="btn-glow flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          
          {health ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/60">
                <span className="text-[var(--muted)]">Backend API</span>
                <StatusBadge status={health.ok} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/60">
                <span className="text-[var(--muted)]">Service</span>
                <span className="font-mono text-sm">{health.service}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--muted)]">
              {loading ? 'Checking...' : 'Click Refresh to check status'}
            </div>
          )}
        </div>

        {/* Workspaces */}
        {workspaces && workspaces.data && (
          <div className="panel rounded-xl p-6 animate-float-in">
            <h2 className="text-xl font-semibold glow-text mb-4">ContentStudio Workspaces</h2>
            <div className="space-y-3">
              {workspaces.data.map((workspace: any) => (
                <div
                  key={workspace._id}
                  className="p-4 border border-[var(--border)] rounded-lg hover:border-[var(--glow)]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {workspace.logo && (
                      <img
                        src={workspace.logo}
                        alt={workspace.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{workspace.name}</h3>
                      <p className="text-sm text-[var(--muted)]">{workspace.company_name || 'No company name'}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted)]">
                        <span>ID: <code className="px-2 py-0.5 rounded bg-[var(--border)]/40">{workspace._id}</code></span>
                        <span>Timezone: {workspace.timezone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment Variables */}
        <div className="panel rounded-xl p-6 animate-float-in">
          <h2 className="text-xl font-semibold glow-text mb-4">Environment Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/60">
              <span className="text-[var(--muted)]">API Base URL</span>
              <code className="text-xs px-2 py-1 rounded bg-[var(--border)]/40">{import.meta.env.VITE_API_BASE || 'https://contentgen.up.railway.app'}</code>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/60">
              <span className="text-[var(--muted)]">Supabase URL</span>
              <code className="text-xs px-2 py-1 rounded bg-[var(--border)]/40">{import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) || 'Configured'}...</code>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[var(--muted)]">Supabase Anon Key</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle size={16} />
                Present
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel rounded-xl p-6 animate-float-in">
          <h2 className="text-lg font-semibold glow-text mb-3">Next Steps</h2>
          <ul className="space-y-2 text-[var(--muted)]">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">1.</span>
              <span>Configure account mappings in the <strong>Mapping</strong> page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">2.</span>
              <span>Set up posting windows in the <strong>Windows</strong> page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">3.</span>
              <span>Start planning posts in the <strong>Planner</strong> page</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

