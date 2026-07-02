import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiCopy, FiTrash2, FiUpload } from 'react-icons/fi';

const BUCKETS = ['hero-images', 'course-thumbnails', 'certificates', 'company-logos', 'nav-icons', 'pages'];

export default function MediaLibrary() {
  const [bucket, setBucket] = useState(BUCKETS[0]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  async function loadFiles() {
    setLoading(true);
    const { data, error } = await supabase.storage.from(bucket).list();
    if (!error) setFiles(data || []);
    setLoading(false);
  }

  function getPublicUrl(path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const filePath = `${Date.now()}-${file.name}`;
    await supabase.storage.from(bucket).upload(filePath, file);
    loadFiles();
  }

  async function deleteFile(path) {
    if (!window.confirm(`Delete ${path}?`)) return;
    await supabase.storage.from(bucket).remove([path]);
    loadFiles();
  }

  function copyUrl(path) {
    navigator.clipboard.writeText(getPublicUrl(path));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-navy mb-6">
        Media Library
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {BUCKETS.map((b) => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              bucket === b
                ? 'bg-brand-accent text-white'
                : 'bg-white text-text-gray hover:bg-gray-100'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-dark-navy">{bucket}</h2>
          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <FiUpload className="w-4 h-4" />
            Upload
          </Button>
          <input
            id="file-upload-input"
            type="file"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {loading ? (
          <p className="text-text-gray text-sm">Loading...</p>
        ) : files.length === 0 ? (
          <p className="text-text-gray text-sm">No files in this bucket.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div
                key={file.name}
                className="border border-gray-200 rounded-lg overflow-hidden group"
              >
                <img
                  src={getPublicUrl(file.name)}
                  alt={file.name}
                  className="w-full h-28 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs text-text-gray truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyUrl(file.name)}
                      className="text-xs text-brand-accent hover:underline"
                    >
                      <FiCopy className="w-3 h-3 inline mr-0.5" />
                      Copy URL
                    </button>
                    <button
                      onClick={() => deleteFile(file.name)}
                      className="text-xs text-red-500 hover:underline ml-auto"
                    >
                      <FiTrash2 className="w-3 h-3 inline mr-0.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
