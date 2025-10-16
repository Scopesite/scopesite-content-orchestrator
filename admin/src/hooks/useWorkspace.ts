import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useWorkspace() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('workspaceId') : null
  );
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getWorkspaces();
        const items = data?.data || [];
        setWorkspaces(items);
        if (!workspaceId && items.length) {
          setWorkspaceId(items[0]._id || items[0].id || items[0].workspaceId);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (workspaceId) localStorage.setItem('workspaceId', workspaceId);
  }, [workspaceId]);

  return { workspaceId, setWorkspaceId, workspaces, loading, error };
}


