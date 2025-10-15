import { Upload, Image as ImageIcon, Folder } from 'lucide-react';

export default function MediaPage() {

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
          <p className="text-gray-600">Manage images and videos for your posts</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Upload size={20} />
          Upload Media
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Folders</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium flex items-center gap-2">
                <Folder size={16} />
                All Media
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No media uploaded yet. Click Upload Media to get started.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

