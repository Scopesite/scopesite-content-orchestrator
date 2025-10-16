import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';

export default function StatusPage() {
  const stats = [
    { label: 'Scheduled', count: 0, icon: Clock, color: 'text-blue-600' },
    { label: 'Published', count: 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Failed', count: 0, icon: XCircle, color: 'text-red-600' },
    { label: 'Pending', count: 0, icon: AlertCircle, color: 'text-yellow-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto text-[var(--text)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold glow-text mb-2">Status & Monitoring</h1>
        <p className="text-[var(--muted)]">Track post status and handle failures</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardBody>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[var(--muted)] font-medium">{stat.label}</span>
                  <Icon className={stat.color} size={20} />
                </div>
                <div className="text-3xl font-bold">{stat.count}</div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Posts Table */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          <div className="text-center py-12 text-[var(--muted)]">
            <p>No posts yet. Schedule some posts to see them here.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

