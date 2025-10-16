import { Upload, Image as ImageIcon, Folder } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export default function MediaPage() {

  return (
    <div className="p-8 max-w-7xl mx-auto text-[var(--text)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text mb-2">Media Library</h1>
          <p className="text-[var(--muted)]">Manage images and videos for your posts</p>
        </div>
        <Button className="px-6 py-3"><Upload size={20} /> Upload Media</Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <Card padding="lg">
            <h3 className="font-semibold mb-3">Folders</h3>
            <div className="space-y-1">
              <Button variant="secondary" className="w-full justify-start">
                <Folder size={16} />
                All Media
              </Button>
            </div>
          </Card>
        </div>

        {/* Media Grid */}
        <div className="col-span-3">
          <Card>
            <CardBody>
            <div className="text-center py-12 text-[var(--muted)]">
              <ImageIcon size={48} className="mx-auto mb-4" />
              <p>No media uploaded yet. Click Upload Media to get started.</p>
            </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

