import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FiUpload, FiX, FiCopy } from 'react-icons/fi';

export default function ImageUploader({
  bucket = 'course-thumbnails',
  value = '',
  onChange,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      alert('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const url = publicUrlData.publicUrl;
    setPreview(url);
    onChange(url);
    setUploading(false);
  }

  function copyUrl() {
    navigator.clipboard.writeText(value);
  }

  function remove() {
    setPreview('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded-md transition-colors">
          <FiUpload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value && (
          <>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-accent"
              title="Copy URL"
            >
              <FiCopy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              onClick={remove}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
              title="Remove"
            >
              <FiX className="w-3.5 h-3.5" />
              Remove
            </button>
          </>
        )}
      </div>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-40 h-28 object-cover rounded-md border border-gray-200"
        />
      )}
      {value && !preview && (
        <p className="text-xs text-text-gray truncate max-w-xs">{value}</p>
      )}
    </div>
  );
}
