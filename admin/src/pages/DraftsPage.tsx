import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

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
    <div className="p-8 max-w-7xl mx-auto text-[var(--text)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold glow-text mb-2">Drafts & Approvals</h1>
        <p className="text-[var(--muted)]">Manage and approve draft posts before scheduling</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {statusFilters.map((status) => (
          <Button
            key={status.value}
            onClick={() => setFilter(status.value)}
            variant={filter === status.value ? 'primary' : 'secondary'}
          >
            {status.label}
          </Button>
        ))}
      </div>

      {/* Drafts List */}
      <Card className="animate-float-in">
        <CardBody>
          <div className="text-center py-12 text-[var(--muted)]">
            <FileText size={48} className="mx-auto mb-4 text-[var(--muted)]" />
            <p>No drafts yet. Create posts in the Planner to see them here.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

