import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import {
  FiPlus, FiEdit2, FiCopy, FiTrash2, FiExternalLink, FiSearch, FiFilter, FiBookOpen,
} from 'react-icons/fi';

const statusColors = {
  published: 'published',
  draft: 'draft',
  archived: 'inactive',
};

export default function TrainingManager() {
  const queryClient = useQueryClient();
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [programsRes, categoriesRes] = await Promise.all([
      supabase.from('training_programs').select('*, training_categories(name)').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('training_categories').select('name').order('name'),
    ]);
    if (!programsRes.error) setPrograms(programsRes.data || []);
    if (!categoriesRes.error) {
      const unique = [...new Set((categoriesRes.data || []).map((c) => c.name).filter(Boolean))].sort();
      setCategories(unique);
    }
    setLoading(false);
  }

  async function togglePublish(id, currentStatus) {
    const next = currentStatus === 'published' ? 'draft' : 'published';
    await supabase.from('training_programs').update({ status: next }).eq('id', id);
    setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, status: next } : p)));
    queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
  }

  async function toggleFeatured(id, current) {
    await supabase.from('training_programs').update({ is_featured: !current }).eq('id', id);
    setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, is_featured: !current } : p)));
    queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from('training_programs').delete().eq('id', id);
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
  }

  async function handleDuplicate(program) {
    const { id: _id, created_at: _created_at, updated_at: _updated_at, ...rest } = program;
    const copy = { ...rest, title: `${program.title} (Copy)` };
    const { error } = await supabase.from('training_programs').insert(copy);
    if (!error) {
      loadData();
      queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
    }
  }

  const filtered = programs.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!(p.title || '').toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'All') {
      const catName = p.training_categories?.name;
      if (catName !== categoryFilter) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Training Programs</h1>
          <p className="text-sm text-neutral-500">
            {programs.length} program{programs.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <AdminButton to="/admin/training/new" variant="primary" size="sm">
          <FiPlus className="w-4 h-4" />
          Add Program
        </AdminButton>
      </div>

      {programs.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 h-9 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 border border-neutral-300 rounded-lg text-sm text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              <option value="All">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 border border-neutral-300 rounded-lg text-sm text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {programs.length === 0 ? (
        <div className="border border-neutral-200 rounded-lg">
          <EmptyState
            icon={FiBookOpen}
            title="No training programs yet"
            description="Get started by adding your first program."
            action={{ to: '/admin/training/new', icon: <FiPlus className="w-4 h-4" />, label: 'Add your first program' }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-neutral-200 rounded-lg">
          <EmptyState
            icon={FiSearch}
            title="No programs match your filters"
            description="Try adjusting your search or filter criteria."
          />
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="sticky top-0 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Title
                </th>
                <th className="sticky top-0 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Category
                </th>
                <th className="sticky top-0 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                  Badge
                </th>
                <th className="sticky top-0 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="sticky top-0 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                  Featured
                </th>
                <th className="sticky top-0 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                  Sort
                </th>
                <th className="sticky top-0 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">
                  Created
                </th>
                <th className="sticky top-0 bg-neutral-50 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((program) => (
                <tr
                  key={program.id}
                  className="group border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/training/${program.id}`}
                      className="text-sm font-medium text-neutral-900 hover:text-accent-600 transition-colors"
                    >
                      {program.title || 'Untitled'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                    {program.training_categories?.name || '-'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {program.badge ? (
                      <Badge variant="default">{program.badge}</Badge>
                    ) : (
                      <span className="text-sm text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={program.status === 'published'}
                          onChange={() => togglePublish(program.id, program.status)}
                          className="sr-only peer"
                          disabled={program.status === 'archived'}
                        />
                        <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-success-500 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                      <Badge variant={statusColors[program.status] || 'default'}>
                        {program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'Draft'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!program.is_featured}
                        onChange={() => toggleFeatured(program.id, program.is_featured)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-accent-600 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden lg:table-cell">
                    {program.sort_order ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400 hidden xl:table-cell whitespace-nowrap">
                    {program.created_at
                      ? new Date(program.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {program.slug && (
                        <Link
                          to={`/training/${program.slug}`}
                          target="_blank"
                          className="p-1.5 text-neutral-400 hover:text-accent-600 rounded-md hover:bg-accent-50 transition-colors"
                          title="Preview"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        to={`/admin/training/${program.id}`}
                        className="p-1.5 text-neutral-400 hover:text-accent-600 rounded-md hover:bg-accent-50 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(program)}
                        className="p-1.5 text-neutral-400 hover:text-accent-600 rounded-md hover:bg-accent-50 transition-colors"
                        title="Duplicate"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(program.id, program.title)}
                        className="p-1.5 text-destructive-500 hover:text-destructive-700 rounded-md hover:bg-destructive-50 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
