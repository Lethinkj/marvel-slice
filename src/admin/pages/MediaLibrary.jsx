import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiCopy, FiTrash2, FiUpload, FiSearch, FiCheck, FiX, FiGrid, FiList, FiFolder, FiFile, FiExternalLink, FiLayers } from 'react-icons/fi';

const BUCKETS = ['hero-images', 'course-thumbnails', 'certificates', 'company-logos', 'nav-icons', 'pages'];

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function listFilesRecursive(bucket, prefix = '') {
  const all = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit, offset, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) break;
    if (!data || data.length === 0) break;
    for (const item of data) {
      if (item.id === null) {
        const sub = await listFilesRecursive(bucket, prefix ? `${prefix}/${item.name}` : item.name);
        all.push(...sub);
      } else {
        const filePath = prefix ? `${prefix}/${item.name}` : item.name;
        all.push({ ...item, _path: filePath, _bucket: bucket });
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

function PreviewModal({ file, onClose }) {
  if (!file) return null;
  const url = supabase.storage.from(file._bucket).getPublicUrl(file._path).data.publicUrl;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-dark-navy truncate">{file.name}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-dark-navy rounded-lg hover:bg-gray-100 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          <div className="sm:w-1/2 bg-gray-50 rounded-xl flex items-center justify-center min-h-[200px] overflow-hidden">
            <img src={url} alt={file.name} className="max-w-full max-h-[300px] object-contain" />
          </div>
          <div className="sm:w-1/2 space-y-3 text-sm">
            <div><span className="text-gray-500">Filename</span><p className="font-medium text-dark-navy break-all">{file.name}</p></div>
            <div><span className="text-gray-500">Bucket</span><p className="font-medium text-dark-navy"><span className="inline-block px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded text-xs font-medium">{file._bucket}</span></p></div>
            <div><span className="text-gray-500">Path</span><p className="font-medium text-dark-navy text-xs font-mono break-all">{file._path}</p></div>
            <div><span className="text-gray-500">Size</span><p className="font-medium text-dark-navy">{formatSize(file.metadata?.size)}</p></div>
            {file.metadata?.mimetype && <div><span className="text-gray-500">Type</span><p className="font-medium text-dark-navy">{file.metadata.mimetype}</p></div>}
            <div><span className="text-gray-500">Uploaded</span><p className="font-medium text-dark-navy">{formatDate(file.created_at)}</p></div>
            <div className="pt-2 flex gap-2">
              <Button onClick={() => { navigator.clipboard.writeText(url); }} variant="ghost" size="sm"><FiCopy className="w-3.5 h-3.5" /> Copy URL</Button>
              <Button onClick={() => window.open(url, '_blank')} variant="ghost" size="sm"><FiExternalLink className="w-3.5 h-3.5" /> Open</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediaLibrary() {
  const [bucket, setBucket] = useState('all');
  const [files, setFiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(null);
  const uploadRef = useRef(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      if (bucket === 'all') {
        const results = await Promise.all(BUCKETS.map(b => listFilesRecursive(b)));
        setFiles(results.flat());
      } else {
        setFiles(await listFilesRecursive(bucket));
      }
    } catch {}
    setLoading(false);
  }, [bucket]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  useEffect(() => {
    if (!search) { setFiltered(files); return; }
    const q = search.toLowerCase();
    setFiltered(files.filter(f => f.name.toLowerCase().includes(q)));
  }, [search, files]);

  function getUrl(file) {
    return supabase.storage.from(file._bucket).getPublicUrl(file._path).data.publicUrl;
  }

  async function handleUpload(e) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    if (bucket === 'all') {
      alert('Select a specific bucket to upload files.');
      if (uploadRef.current) uploadRef.current.value = '';
      return;
    }
    for (const file of fileList) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      await supabase.storage.from(bucket).upload(path, file);
    }
    loadFiles();
    if (uploadRef.current) uploadRef.current.value = '';
  }

  async function deleteFile(file) {
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    await supabase.storage.from(file._bucket).remove([file._path]);
    loadFiles();
  }

  function copyUrl(file) {
    navigator.clipboard.writeText(getUrl(file));
    setCopied(file._path);
    setTimeout(() => setCopied(null), 2000);
  }

  const isImage = (name) => /\.(png|jpg|jpeg|gif|webp|svg|avif|bmp|ico)$/i.test(name);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-navy">Media Library</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => uploadRef.current?.click()} variant="accent" size="md" disabled={bucket === 'all'}>
            <FiUpload className="w-4 h-4" /> Upload
          </Button>
          <input ref={uploadRef} type="file" multiple onChange={handleUpload} className="hidden" accept="image/*,.pdf,.svg" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex flex-wrap gap-2">
          <button key="all" onClick={() => setBucket('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              bucket === 'all' ? 'bg-dark-navy text-white shadow-sm' : 'bg-white text-text-gray border border-gray-200 hover:border-dark-navy/30 hover:text-dark-navy'
            }`}
          >
            <span className="flex items-center gap-1.5"><FiLayers className="w-3.5 h-3.5" />All</span>
          </button>
          {BUCKETS.map((b) => (
            <button key={b} onClick={() => setBucket(b)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                bucket === b ? 'bg-brand-accent text-white shadow-sm' : 'bg-white text-text-gray border border-gray-200 hover:border-brand-accent/30 hover:text-brand-accent'
              }`}
            >
              <span className="flex items-center gap-1.5"><FiFolder className="w-3.5 h-3.5" />{b}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-48 pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
            />
          </div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-brand-accent text-white' : 'bg-white text-gray-400 hover:text-dark-navy'}`}>
              <FiGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-brand-accent text-white' : 'bg-white text-gray-400 hover:text-dark-navy'}`}>
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-dark-navy flex items-center gap-2">
            {bucket === 'all' ? 'All Buckets' : bucket}
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg aspect-[4/3]" />
                <div className="mt-2 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiFile className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500">{search ? 'No files match your search.' : 'This bucket is empty.'}</p>
            {!search && bucket !== 'all' && (
              <Button onClick={() => uploadRef.current?.click()} variant="outline" size="sm" className="mt-4">
                <FiUpload className="w-4 h-4" /> Upload your first file
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((file) => (
              <div key={file._path} className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white">
                <button onClick={() => setPreview(file)} className="w-full block">
                  <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                    {isImage(file.name) ? (
                      <img src={getUrl(file)} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <FiFile className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                </button>
                <div className="p-2.5">
                  <p className="text-xs text-dark-navy truncate font-medium">{file.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatSize(file.metadata?.size)}</p>
                  {bucket === 'all' && (
                    <p className="text-[10px] text-brand-accent/70 mt-0.5 truncate">{file._bucket}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyUrl(file)}
                      className="flex-1 text-[11px] text-brand-accent hover:bg-brand-accent/5 rounded px-1.5 py-1 transition-colors flex items-center justify-center gap-1">
                      {copied === file._path ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
                      {copied === file._path ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={() => deleteFile(file)}
                      className="text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded px-1.5 py-1 transition-colors flex items-center gap-1">
                      <FiTrash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((file) => (
              <div key={file._path} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <button onClick={() => setPreview(file)} className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                  {isImage(file.name) ? (
                    <img src={getUrl(file)} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <FiFile className="w-5 h-5 text-gray-300" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-navy truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatSize(file.metadata?.size)} &middot; {formatDate(file.created_at)}
                    {bucket === 'all' && <span> &middot; <span className="text-brand-accent">{file._bucket}</span></span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => copyUrl(file)} className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors" title="Copy URL">
                    {copied === file._path ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => window.open(getUrl(file), '_blank')} className="p-2 text-gray-400 hover:text-dark-navy hover:bg-gray-100 rounded-lg transition-colors" title="Open">
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteFile(file)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}