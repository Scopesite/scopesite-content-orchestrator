import { useState } from 'react';
import { Hash, Plus, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export default function HashtagsPage() {
  const [, setShowNewSet] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto text-[var(--text)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text mb-2">Hashtag Manager</h1>
          <p className="text-[var(--muted)]">Organize and track hashtag performance</p>
        </div>
        <Button onClick={() => setShowNewSet(true)} className="px-6 py-3"><Plus size={20} /> New Set</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hashtag Sets */}
        <Card>
          <CardBody>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Hash size={20} />
            Hashtag Sets
          </h2>
          <div className="text-center py-12 text-[var(--muted)]">
            <p>No hashtag sets created yet. Click New Set to create one.</p>
          </div>
          </CardBody>
        </Card>

        {/* Analytics */}
        <Card>
          <CardBody>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Top Performing
          </h2>
          <div className="text-center py-12 text-[var(--muted)]">
            <p>Analytics will appear here once you start using hashtags.</p>
          </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

