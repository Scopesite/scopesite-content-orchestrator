import { Clock, Plus } from 'lucide-react';

export default function WindowsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Posting Windows</h1>
          <p className="text-gray-600">Define allowed posting times and quiet hours</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus size={20} />
          New Window
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No posting windows configured. Click New Window to create one.</p>
          <p className="mt-2 text-sm">Example: Mon-Fri 9AM-5PM for LinkedIn</p>
        </div>
      </div>
    </div>
  );
}

