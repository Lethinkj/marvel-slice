import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import { FiFolder } from 'react-icons/fi';

export default function BlogCategoriesManager() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  useEffect(() => {
    supabase.from('blog_categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data || []);
      setLoading(false);
    });
  }, []);

  function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: '', slug: '' });
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { name: form.name, slug: form.slug || slugify(form.name) };
    if (editingId) {
      await supabase.from('blog_categories').update(payload).eq('id', editingId);
    } else {
      await supabase.from('blog_categories').insert({ ...payload, sort_order: categories.length });
    }
    queryClient.invalidateQueries({ queryKey: ['blogCategories'] });
    const { data } = await supabase.from('blog_categories').select('*').order('sort_order');
    setCategories(data || []);
    resetForm();
  }

  async function deleteCategory(id) {
    if (!window.confirm('Delete this category?')) return;
    await supabase.from('blog_categories').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['blogCategories'] });
    setCategories(categories.filter((c) => c.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Blog Categories</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage categories for blog posts</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-neutral-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">{editingId ? 'Edit Category' : 'Add Category'}</h3>
        <div className="flex gap-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
            placeholder="Category name"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" />
          <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="slug"
            className="w-40 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-mono text-xs" />
          <AdminButton type="submit" variant="primary" size="sm" disabled={!form.name.trim()}>
            {editingId ? 'Update' : 'Add'}
          </AdminButton>
          {editingId && (
            <button type="button" onClick={resetForm}
              className="px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <FiFolder className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
          <p className="text-sm text-neutral-400">No categories yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors group">
                <div className="w-9 h-9 bg-accent-100 rounded-xl flex items-center justify-center shrink-0">
                  <FiFolder className="w-4 h-4 text-accent-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{cat.name}</p>
                  <p className="text-xs text-neutral-400">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(cat)}
                    className="px-3 py-1.5 text-xs font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 rounded-md transition-colors">
                    Edit
                  </button>
                  <button onClick={() => deleteCategory(cat.id)}
                    className="px-3 py-1.5 text-xs font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded-md transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
