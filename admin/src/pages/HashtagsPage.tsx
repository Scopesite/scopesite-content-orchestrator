import { useState } from 'react';
import { Hash, Plus, TrendingUp } from 'lucide-react';

export default function HashtagsPage() {
  const [, setShowNewSet] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hashtag Manager</h1>
          <p className="text-gray-600">Organize and track hashtag performance</p>
        </div>
        <button
          onClick={() => setShowNewSet(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          New Set
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hashtag Sets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hash size={20} />
            Hashtag Sets
          </h2>
          <div className="text-center py-12 text-gray-500">
            <p>No hashtag sets created yet. Click New Set to create one.</p>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Top Performing
          </h2>
          <div className="text-center py-12 text-gray-500">
            <p>Analytics will appear here once you start using hashtags.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

