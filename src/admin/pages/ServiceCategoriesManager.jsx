import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import { FiServer } from 'react-icons/fi';

export default function ServiceCategoriesManager() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', description: '', status: true, sort_order: 0 });

  useEffect(() => {
    supabase.from('service_categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data || []);
      setLoading(false);
    });
  }, []);

  function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: '', slug: '', icon: '', description: '', status: true, sort_order: 0 });
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', description: cat.description || '', status: cat.status ?? true, sort_order: cat.sort_order ?? 0 });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      icon: form.icon,
      description: form.description,
      status: form.status,
      sort_order: editingId ? form.sort_order : categories.length,
    };
    if (editingId) {
      await supabase.from('service_categories').update(payload).eq('id', editingId);
    } else {
      await supabase.from('service_categories').insert(payload);
    }
    queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
    const { data } = await supabase.from('service_categories').select('*').order('sort_order');
    setCategories(data || []);
    resetForm();
  }

  async function deleteCategory(id) {
    if (!window.confirm('Delete this category?')) return;
    await supabase.from('service_categories').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
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
        <h1 className="text-2xl font-bold text-neutral-900">Service Categories</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage categories for services</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-neutral-200 p-5 mb-6 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-700">{editingId ? 'Edit Category' : 'Add Category'}</h3>

        <div className="flex gap-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
            placeholder="Category name"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" />
          <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="slug"
            className="w-40 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-mono text-xs" />
        </div>

        <div className="flex gap-3">
          <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="Icon name (e.g. FiMonitor)"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" />
          <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            placeholder="Sort order"
            className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" />
        </div>

        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description (optional)"
          rows={3}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none" />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setForm({ ...form, status: !form.status })}
              className={`w-9 h-5 rounded-full transition-colors relative ${form.status ? 'bg-accent-500' : 'bg-neutral-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.status ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-neutral-700">Active</span>
          </label>
          <div className="flex gap-2 ml-auto">
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
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <FiServer className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
          <p className="text-sm text-neutral-400">No categories yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors group">
                <div className="w-9 h-9 bg-accent-100 rounded-xl flex items-center justify-center shrink-0">
                  <FiServer className="w-4 h-4 text-accent-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{cat.name}</p>
                  <p className="text-xs text-neutral-400">/{cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.status ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {cat.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-100">
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
