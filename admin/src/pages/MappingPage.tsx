import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Save, CheckCircle } from 'lucide-react';

export default function MappingPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const channelOptions = [
    { slug: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
    { slug: 'twitter', name: 'Twitter/X', color: 'bg-black' },
    { slug: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
    { slug: 'instagram', name: 'Instagram', color: 'bg-pink-600' },
    { slug: 'gmb', name: 'Google Business', color: 'bg-red-600' },
  ];

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadAccounts();
      loadMappings();
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    try {
      const data = await api.getWorkspaces();
      setWorkspaces(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedWorkspace(data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getAccounts(selectedWorkspace);
      setAccounts(data.data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMappings = async () => {
    try {
      const data = await api.getAccountMappings(selectedWorkspace);
      if (data.legacy_format) {
        setMappings(data.legacy_format);
      }
    } catch (err) {
      console.error('Failed to load mappings:', err);
      setMappings({});
    }
  };

  const handleToggleAccount = (channel: string, accountId: string) => {
    setMappings((prev) => {
      const current = prev[channel] || [];
      const isSelected = current.includes(accountId);
      
      if (isSelected) {
        return {
          ...prev,
          [channel]: current.filter((id) => id !== accountId),
        };
      } else {
        return {
          ...prev,
          [channel]: [...current, accountId],
        };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.bulkSaveAccountMappings(selectedWorkspace, mappings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save mappings:', err);
      alert('Failed to save mappings');
    } finally {
      setSaving(false);
    }
  };

  const getAccountsByPlatform = (platform: string) => {
    return accounts.filter((acc) => acc.platform === platform);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Mapping</h1>
        <p className="text-gray-600">Map channel slugs to ContentStudio account IDs</p>
      </div>

      {/* Workspace Selector */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Workspace
        </label>
        <select
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {workspaces.map((ws) => (
            <option key={ws._id} value={ws._id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading accounts...</div>
      ) : (
        <div className="space-y-6">
          {channelOptions.map((channel) => {
            const platformAccounts = getAccountsByPlatform(channel.slug === 'twitter' ? 'twitter' : channel.slug);
            const selectedAccounts = mappings[channel.slug] || [];

            return (
              <div key={channel.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${channel.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {channel.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''} mapped
                    </p>
                  </div>
                </div>

                {platformAccounts.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No accounts found for this platform</p>
                ) : (
                  <div className="grid gap-2">
                    {platformAccounts.map((account) => {
                      const isSelected = selectedAccounts.includes(account._id);
                      
                      return (
                        <button
                          key={account._id}
                          onClick={() => handleToggleAccount(channel.slug, account._id)}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {account.profile_picture && (
                            <img
                              src={account.profile_picture}
                              alt={account.account_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{account.account_name}</p>
                            <p className="text-xs text-gray-500 font-mono">{account._id}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="text-blue-600" size={20} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !selectedWorkspace}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Mappings'}
        </button>
        
        {success && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="font-medium">Mappings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Preview JSON */}
      <div className="mt-8 bg-gray-900 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">Mapping Preview (JSON)</h3>
        <pre className="text-green-400 text-sm overflow-x-auto">
          {JSON.stringify(mappings, null, 2)}
        </pre>
      </div>
    </div>
  );
}

