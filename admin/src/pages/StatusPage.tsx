import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function StatusPage() {
  const stats = [
    { label: 'Scheduled', count: 0, icon: Clock, color: 'text-blue-600' },
    { label: 'Published', count: 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Failed', count: 0, icon: XCircle, color: 'text-red-600' },
    { label: 'Pending', count: 0, icon: AlertCircle, color: 'text-yellow-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Status & Monitoring</h1>
        <p className="text-gray-600">Track post status and handle failures</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">{stat.label}</span>
                <Icon className={stat.color} size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.count}</div>
            </div>
          );
        })}
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Posts</h2>
        <div className="text-center py-12 text-gray-500">
          <p>No posts yet. Schedule some posts to see them here.</p>
        </div>
      </div>
    </div>
  );
}

