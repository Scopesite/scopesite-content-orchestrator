import { Clock, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export default function WindowsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto text-[var(--text)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text mb-2">Posting Windows</h1>
          <p className="text-[var(--muted)]">Define allowed posting times and quiet hours</p>
        </div>
        <Button className="px-6 py-3"><Plus size={20} /> New Window</Button>
      </div>

      <Card>
        <CardBody>
        <div className="text-center py-12 text-[var(--muted)]">
          <Clock size={48} className="mx-auto mb-4" />
          <p>No posting windows configured. Click New Window to create one.</p>
          <p className="mt-2 text-sm">Example: Mon-Fri 9AM-5PM for LinkedIn</p>
        </div>
        </CardBody>
      </Card>
    </div>
  );
}

