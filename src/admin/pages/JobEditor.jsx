import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import SaveBar from '../components/SaveBar';
import PageShell from '../components/ui/PageShell';
import { FiArrowLeft } from 'react-icons/fi';
import useDirty from '../hooks/useDirty';

export default function JobEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState([]);

  const defaultJobForm = {
    title: '', role_category_id: '', location: '', type: 'Full-time',
    experience: '', salary: '', apply_url: '', description: '',
    is_active: true, sort_order: 0,
  };
  const [jobForm, setJobForm] = useState(defaultJobForm);

  const { dirty, reset } = useDirty([jobForm], loading);

  useEffect(() => {
    async function loadData() {
      const { data: catRes } = await supabase.from('role_categories').select('*').order('display_order', { ascending: true });
      if (catRes) setCategories(catRes);

      if (!isNew) {
        const { data } = await supabase.from('job_openings').select('*').eq('id', id).single();
        if (data) {
          setJobForm({
            title: data.title || '', role_category_id: data.role_category_id || '', location: data.location || '',
            type: data.type || 'Full-time', experience: data.experience || '', salary: data.salary || '',
            apply_url: data.apply_url || '', description: data.description || '', is_active: data.is_active,
            sort_order: data.sort_order || 0
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id, isNew]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setJobForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!jobForm.title.trim()) return;
    setSaving(true);
    setSaved(false);

    const payload = {
      title: jobForm.title.trim(),
      role_category_id: jobForm.role_category_id || null,
      location: jobForm.location?.trim() || null,
      type: jobForm.type?.trim() || null,
      experience: jobForm.experience?.trim() || null,
      salary: jobForm.salary?.trim() || null,
      description: jobForm.description?.trim() || null,
      apply_url: jobForm.apply_url?.trim() || null,
      is_active: jobForm.is_active,
      sort_order: jobForm.sort_order,
    };

    if (isNew) {
      await supabase.from('job_openings').insert(payload);
    } else {
      await supabase.from('job_openings').update(payload).eq('id', id);
    }
    setSaving(false);
    setSaved(true);
    reset();
    setTimeout(() => {
      navigate('/admin/jobs');
    }, 1000);
  }

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading job...</div>;

  return (
    <PageShell 
      backTo="/admin/jobs"
      title={isNew ? 'Add Job Opening' : 'Edit Job Opening'}
      actions={
        <div className="flex items-center gap-3">
          <AdminButton onClick={handleSave} disabled={saving} variant="primary" size="md">
            {saving ? 'Saving...' : 'Save Job'}
          </AdminButton>
        </div>
      }
    >
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Job Title *</label>
                <input name="title" value={jobForm.title} onChange={handleChange} placeholder="e.g. Software Engineer" className="w-full px-3 py-2.5 border border-admin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all" required />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Category</label>
                  <select name="role_category_id" value={jobForm.role_category_id} onChange={handleChange} className="w-full px-3 py-2.5 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 bg-white">
                    <option value="">-- No Category --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Type</label>
                  <select name="type" value={jobForm.type} onChange={handleChange} className="w-full px-3 py-2.5 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 bg-white">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Location</label>
                  <input name="location" value={jobForm.location} onChange={handleChange} placeholder="e.g. New York, NY" className="w-full px-3 py-2.5 border border-admin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Experience</label>
                  <input name="experience" value={jobForm.experience} onChange={handleChange} placeholder="e.g. 2-4 years" className="w-full px-3 py-2.5 border border-admin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">Salary Range</label>
                <input name="salary" value={jobForm.salary} onChange={handleChange} placeholder="e.g. \$80k-\$120k" className="w-full px-3 py-2.5 border border-admin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">Apply URL</label>
                <input name="apply_url" value={jobForm.apply_url} onChange={handleChange} placeholder="e.g. https://apply.example.com/position" className="w-full px-3 py-2.5 border border-admin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">Description</label>
                <textarea name="description" value={jobForm.description} onChange={handleChange} rows={6}
                  placeholder="Brief description or requirements..." className="w-full px-3 py-2.5 border border-admin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all resize-y" />
              </div>
            </div>

            <div className="pt-6 border-t border-admin-200 space-y-4">
              <h3 className="text-sm font-semibold text-black">Settings</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-4 rounded-lg border border-admin-200">
                  <input type="checkbox" name="is_active" checked={jobForm.is_active} onChange={handleChange}
                    className="w-4 h-4 rounded border-admin-200 text-admin-600 focus:ring-admin-500/20" />
                  <span className="text-sm font-medium text-black">Active (Visible on site)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-black">Sort Order</label>
                  <input type="number" name="sort_order" value={jobForm.sort_order} onChange={handleChange} className="w-24 px-3 py-2.5 border border-admin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all" />
                </div>
              </div>
            </div>

            <SaveBar saving={saving} saved={saved} onSave={handleSave} dirty={dirty} onDiscard={() => window.location.reload()} />
          </form>
        </div>
      </div>
    </PageShell>
  );
}
