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
      title={isNew ? 'Add Job Opening' : 'Edit Job Opening'}
      actions={
        <AdminButton onClick={() => navigate('/admin/jobs')} variant="ghost" size="md">
          <FiArrowLeft className="w-4 h-4" /> Back to Jobs
        </AdminButton>
      }
    >
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-admin-200 overflow-hidden p-6 mb-24 space-y-8">
        <div className="grid lg:grid-cols-2 gap-x-12 gap-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Job Title *</label>
            <input name="title" value={jobForm.title} onChange={handleChange} placeholder="e.g. Software Engineer" className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50" required />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Category</label>
            <select name="role_category_id" value={jobForm.role_category_id} onChange={handleChange} className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50">
              <option value="">-- No Category --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Location</label>
            <input name="location" value={jobForm.location} onChange={handleChange} placeholder="e.g. New York, NY" className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Type</label>
            <select name="type" value={jobForm.type} onChange={handleChange} className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Experience</label>
            <input name="experience" value={jobForm.experience} onChange={handleChange} placeholder="e.g. 2–4 years" className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Salary Range</label>
            <input name="salary" value={jobForm.salary} onChange={handleChange} placeholder="e.g. $80k–$120k" className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Apply URL</label>
          <input name="apply_url" value={jobForm.apply_url} onChange={handleChange} placeholder="e.g. https://apply.example.com/position" className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider mt-2">Description</label>
          <textarea name="description" value={jobForm.description} onChange={handleChange} rows={6}
            placeholder="Brief description or requirements..." className="flex-1 w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all resize-y bg-gray-50/50" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-4 border-t border-gray-100">
          <label className="w-32 shrink-0 text-sm font-semibold text-black uppercase tracking-wider">Settings</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={jobForm.is_active} onChange={handleChange}
                className="w-4 h-4 rounded border-admin-200 text-admin-600 focus:ring-admin-500/20" />
              <span className="text-sm font-medium text-black">Active</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black">Sort Order</span>
              <input type="number" name="sort_order" value={jobForm.sort_order} onChange={handleChange} className="w-20 px-2 py-1 border border-admin-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all bg-gray-50/50" />
            </div>
          </div>
        </div>
        
        <SaveBar saving={saving} saved={saved} onSave={handleSave} dirty={dirty}  onDiscard={() => window.location.reload()} />
      </form>
    </PageShell>
  );
}
