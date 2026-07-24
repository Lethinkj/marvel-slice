import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import SaveBar from '../components/SaveBar';
import useDirty from '../hooks/useDirty';
import { FiSave, FiArrowLeft, FiUpload, FiTrash2, FiExternalLink, FiTag } from 'react-icons/fi';
import PageShell from '../components/ui/PageShell';

function ImageUploader({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('pages').upload(path, file);
    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
      const { data } = supabase.storage.from('pages').getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          placeholder="Paste image URL or upload..."
        />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
          {uploading ? (
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiUpload className="w-4 h-4" />
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && (
        <div className="mt-2 relative group rounded-lg overflow-hidden border border-slate-200">
          <img src={value} alt="" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-destructive-500 text-white rounded-full opacity-100 shadow-lg"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const savingRef = useRef(false);
  const queryClient = useQueryClient();
  const formRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category_id: '',
    author: 'Admin',
    is_published: false,
    is_featured: false,
  });
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [slugStatus, setSlugStatus] = useState('idle');
  const [slugSuggestion, setSlugSuggestion] = useState('');
  const { dirty, reset } = useDirty([form, selectedTags], loading);

  useEffect(() => {
    if (!form.slug || !isNew) { setSlugStatus('idle'); return; }
    let active = true;
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('blog_posts').select('id').eq('slug', form.slug).maybeSingle();
      if (!active) return;
      if (data) {
        setSlugStatus('taken');
        let attempt = 1;
        while (attempt < 20) {
          const testSlug = `${form.slug}-${attempt}`;
          const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', testSlug).maybeSingle();
          if (!existing) { setSlugSuggestion(testSlug); break; }
          attempt++;
        }
      } else {
        setSlugStatus('available');
        setSlugSuggestion('');
      }
    }, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [form.slug, isNew]);

  useEffect(() => {
    supabase.from('blog_categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data || []);
    });
    supabase.from('tags').select('*').order('name').then(({ data }) => {
      setAllTags(data || []);
    });
    if (!isNew) {
      supabase.from('blog_posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            image_url: data.image_url || '',
            category_id: data.category_id || '',
            author: data.author || 'Admin',
            is_published: data.is_published || false,
            is_featured: data.is_featured || false,
          });
          supabase.from('blog_post_tags').select('tag_id').eq('post_id', data.id).then(({ data: tagData }) => {
            setSelectedTags((tagData || []).map(t => t.tag_id));
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function handleTitleChange(value) {
    setForm({ ...form, title: value, slug: slugify(value) });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    const payload = {
      ...form,
      category_id: form.category_id || null,
      slug: form.slug || slugify(form.title),
      published_at: form.is_published && !isNew ? undefined : form.is_published ? new Date().toISOString() : null,
    };
    let postId = id;
    let insertError = false;
    if (isNew) {
      let { data, error } = await supabase.from('blog_posts').insert(payload).select().single();
      let attempt = 0;
      while (error && error.message?.includes('blog_posts_slug_key') && attempt < 10) {
        attempt++;
        payload.slug = `${payload.slug || slugify(payload.title)}-${attempt}`;
        setForm(f => ({ ...f, slug: payload.slug }));
        const retry = await supabase.from('blog_posts').insert(payload).select().single();
        data = retry.data;
        error = retry.error;
      }
      if (error) {
        insertError = true;
        savingRef.current = false;
        setSaving(false);
        setSaveError('Failed to save post: ' + error.message);
        return;
      } else if (data) {
        postId = data.id;
        window.history.replaceState(null, '', `/admin/blog/${data.id}`);
      }
    } else {
      await supabase.from('blog_posts').update(payload).eq('id', id);
    }

    if (!insertError && postId && postId !== 'new') {
      await supabase.from('blog_post_tags').delete().eq('post_id', postId);
      if (selectedTags.length > 0) {
        await supabase.from('blog_post_tags').insert(
          selectedTags.map(tag_id => ({ post_id: postId, tag_id }))
        );
      }
    }

    queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    queryClient.invalidateQueries({ queryKey: ['blogPost', form.slug] });
    queryClient.invalidateQueries({ queryKey: ['recentPosts'] });
    queryClient.invalidateQueries({ queryKey: ['popularTags'] });
    setSaved(true);
    reset();
    setSaving(false);
    savingRef.current = false;
    setTimeout(() => {
      setSaved(false);
      navigate('/admin/blog');
    }, 1500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageShell title={isNew ? 'New Post' : 'Edit Post'}>
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/blog"
          className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <SaveBar saving={saving} saved={saved} saveError={saveError} onSave={handleSave} label="Post" top />

      <form ref={formRef} onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 p-6 space-y-8">
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Slug</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:border-transparent transition-all font-mono text-xs ${
                    slugStatus === 'taken' ? 'border-destructive-500 focus:ring-destructive-500 bg-destructive-50' :
                    slugStatus === 'available' ? 'border-success-500 focus:ring-success-500 bg-success-50' :
                    'border-slate-200 focus:ring-indigo-500/20'
                  }`}
                  placeholder="post-slug"
                />
                {slugStatus === 'checking' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin block" />
                  </span>
                )}
              </div>
              {slugStatus === 'taken' && (
                <p className="text-xs text-destructive-500 mt-1">
                  Slug taken. Suggested:{' '}
                  <button
                    type="button"
                    onClick={() => { setForm({ ...form, slug: slugSuggestion }); setSlugStatus('checking'); }}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    {slugSuggestion}
                  </button>
                </p>
              )}
              {slugStatus === 'available' && (
                <p className="text-xs text-success-500 mt-1">Available</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Author name"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Short description shown in cards"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={12}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-xs"
                placeholder="Full article content (HTML or markdown supported)"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Featured Image</h2>
          <ImageUploader value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} label="Image URL" />
        </div>

        <div className="border-t border-neutral-100" />

        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Metadata</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Tags</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTags(isSelected ? selectedTags.filter(t => t !== tag.id) : [...selectedTags, tag.id])
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-600/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FiTag className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      {tag.name}
                    </button>
                  );
                })}
                {allTags.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No tags available. Create them in{' '}
                    <Link to="/admin/tags" className="text-indigo-600 hover:underline">Tags Manager</Link>.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Publishing</h2>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className={`relative w-10 h-6 rounded-full transition-colors ${form.is_published ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_published ? 'translate-x-4' : ''}`} />
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm font-medium text-slate-900">Published</span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-sm font-medium text-slate-900">Featured</span>
            </label>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-6 flex justify-end gap-3">
          {!isNew && form.slug && (
            <AdminButton to={`/blog/${form.slug}`} target="_blank" variant="secondary" size="md">
              <FiExternalLink className="w-4 h-4" /> View Post
            </AdminButton>
          )}
          <SaveBar saving={saving} saved={saved} saveError={saveError} onSave={handleSave} label="Post" dirty={dirty} />
        </div>
      </form>
    </PageShell>
  );
}
