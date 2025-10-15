import { useState } from 'react';
import { FileText } from 'lucide-react';

export default function DraftsPage() {
  const [filter, setFilter] = useState<string>('all');

  const statusFilters = [
    { value: 'all', label: 'All Drafts' },
    { value: 'draft', label: 'Draft' },
    { value: 'needs_review', label: 'Needs Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Drafts & Approvals</h1>
        <p className="text-gray-600">Manage and approve draft posts before scheduling</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {statusFilters.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Drafts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No drafts yet. Create posts in the Planner to see them here.</p>
        </div>
      </div>
    </div>
  );
}

