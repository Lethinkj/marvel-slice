import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import EmptyState from '../components/EmptyState';
import {
  FiSave, FiAlertCircle, FiPlus, FiTrash2, FiEdit2,
  FiUpload, FiExternalLink, FiToggleRight, FiChevronDown,
  FiChevronUp, FiEdit3, FiCheck, FiX, FiBriefcase,
} from 'react-icons/fi';

const FORM_FIELD_DEFAULTS = {
  full_name: { key: 'full_name', label: 'Full Name', enabled: true, required: true, placeholder: 'John Doe', type: 'text' },
  email: { key: 'email', label: 'Email Address', enabled: true, required: true, placeholder: 'john@example.com', type: 'email' },
  phone: { key: 'phone', label: 'Phone Number', enabled: true, required: true, placeholder: '+1 234 567 890', type: 'tel' },
  department: { key: 'department', label: 'Department', enabled: true, required: false, placeholder: 'Select department', type: 'select', options: ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Design', 'Content', 'Other'] },
  category: { key: 'category', label: 'Category', enabled: true, required: false, placeholder: 'Select category', type: 'select', options: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'] },
  description: { key: 'description', label: 'Description', enabled: true, required: false, placeholder: 'Tell us about yourself...', type: 'textarea' },
  file_upload: { key: 'file_upload', label: 'Upload Resume / Documents', enabled: true, required: false, type: 'file' },
};

function buildDefaultFormConfig() {
  return {
    enabled: true,
    headline: 'Apply Now',
    description: "Fill out the form below and we'll get back to you.",
    cta: { text: 'Submit Application', variant: 'accent' },
    fields: Object.fromEntries(
      Object.entries(FORM_FIELD_DEFAULTS).map(([k, v]) => [k, { label: v.label, enabled: v.enabled, required: v.required, placeholder: v.placeholder, options: v.options || null }])
    ),
  };
}

function FormFieldsEditor({ fields, onChange }) {
  const [expanded, setExpanded] = useState({});
  const fieldKeys = Object.keys(FORM_FIELD_DEFAULTS);
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <FiEdit3 className="w-3.5 h-3.5" />
        Form Fields
      </label>
      <div className="space-y-2">
        {fieldKeys.map((key) => {
          const def = FORM_FIELD_DEFAULTS[key];
          const cfg = fields?.[key] || {};
          const isOpen = expanded[key] || false;
          return (
            <div key={key} className="border border-neutral-200 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setExpanded({ ...expanded, [key]: !isOpen })}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.enabled !== false ? 'bg-green-500' : 'bg-neutral-300'}`} />
                <span className="flex-1 text-sm font-medium text-neutral-900">{cfg.label || def.label}</span>
                <span className="text-xs text-neutral-400 capitalize">{def.type}</span>
                {isOpen ? <FiChevronUp className="w-4 h-4 text-neutral-400" /> : <FiChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-neutral-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Enabled</label>
                    <button type="button" onClick={() => onChange({ ...fields, [key]: { ...cfg, enabled: cfg.enabled === false ? true : false } })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cfg.enabled !== false ? 'bg-accent-600' : 'bg-neutral-300'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${cfg.enabled !== false ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Label</label>
                    <input type="text" value={cfg.label || def.label} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, label: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                  </div>
                  {def.type !== 'file' && (
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                        <input type="checkbox" checked={cfg.required !== false} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, required: e.target.checked } })} className="rounded border-neutral-300 text-accent-600 focus:ring-accent-500" />
                        Required
                      </label>
                    </div>
                  )}
                  {def.placeholder !== undefined && (
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Placeholder</label>
                      <input type="text" value={cfg.placeholder || def.placeholder || ''} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, placeholder: e.target.value } })}
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                    </div>
                  )}
                  {def.options && (
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Options (one per line)</label>
                      <textarea value={(cfg.options || def.options).join('\n')} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, options: e.target.value.split('\n').filter(Boolean) } })}
                        rows={4} className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImageUploader({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `career/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('pages').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('pages').getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setUploading(false);
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" placeholder="Paste URL or upload..." />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-accent-500 hover:text-accent-600 transition-colors">
          {uploading ? <span className="w-4 h-4 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" /> : <FiUpload className="w-4 h-4" />}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-28 w-full object-cover rounded-lg border border-neutral-200" />}
    </div>
  );
}

const defaultJobForm = {
  title: '',
  role_category_id: '',
  location: '',
  type: '',
  experience: '',
  salary: '',
  description: '',
  is_active: true,
  sort_order: 0,
};

export default function CareerPageEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pageId, setPageId] = useState(null);

  const [hero, setHero] = useState({ heading: '', subheading: '', hero_image: '' });
  const [culture, setCulture] = useState('');
  const [cultureHeading, setCultureHeading] = useState('Company Culture');
  const [benefits, setBenefits] = useState([]);
  const [benefitsHeading, setBenefitsHeading] = useState('Benefits & Perks');
  const [section1, setSection1] = useState({ heading: 'We\'re Hiring', subheading: '', description: '' });
  const [section2, setSection2] = useState({ heading: 'Job Openings', subheading: '' });
  const [formConfig, setFormConfig] = useState(buildDefaultFormConfig());
  const [carouselEnabled, setCarouselEnabled] = useState(false);

  const [openings, setOpenings] = useState([]);
  const [roleCategories, setRoleCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 0, is_active: true });
  const [categorySaving, setCategorySaving] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(defaultJobForm);
  const [jobSaving, setJobSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: content } = await supabase
        .from('career_page_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (content) {
        setPageId(content.id);
        setHero({ heading: content.hero_heading || '', subheading: content.hero_subheading || '', hero_image: content.hero_image || '' });
        setCulture(content.culture || '');
        setCultureHeading(content.culture_heading || 'Company Culture');
        setBenefits(content.benefits || []);
        setBenefitsHeading(content.benefits_heading || 'Benefits & Perks');
        setSection1({ heading: content.section1_heading || 'We\'re Hiring', subheading: content.section1_subheading || '', description: content.section1_description || '' });
        setSection2({ heading: content.section2_heading || 'Job Openings', subheading: content.section2_subheading || '' });
        if (content.form_config && typeof content.form_config === 'object' && Object.keys(content.form_config).length > 0) {
          setFormConfig({ ...buildDefaultFormConfig(), ...content.form_config });
        setCarouselEnabled(content.carousel_enabled || false);
        }
      } else {
        const { data: navItems } = await supabase
          .from('nav_items')
          .select('id')
          .eq('path', '/career')
          .eq('is_active', true)
          .order('id')
          .limit(1);
        const navItem = navItems?.[0] || null;
        if (navItem?.id) {
          const { data: pages } = await supabase
            .from('nav_pages')
            .select('*')
            .eq('nav_item_id', navItem.id)
            .eq('is_published', true)
            .order('id')
            .limit(1);
          const page = pages?.[0] || null;
          if (page) {
            setHero({ heading: page.heading || '', subheading: page.subheading || '', hero_image: page.hero_image || '' });
            const secs = page.sections || [];
            const cult = secs.find(s => s.section_type === 'text');
            if (cult) setCulture(cult.content || '');
            const ben = secs.find(s => s.section_type === 'features');
            if (ben?.items) setBenefits(ben.items);
            if (page.form_config && typeof page.form_config === 'object' && Object.keys(page.form_config).length > 0) {
              setFormConfig({ ...buildDefaultFormConfig(), ...page.form_config });
            }
          }
        }
      }

      const { data: jobs } = await supabase
        .from('job_openings')
        .select('*, role_categories(name)')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      setOpenings(jobs || []);

      const { data: cats } = await supabase
        .from('role_categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      setRoleCategories(cats || []);

      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const payload = {
      hero_heading: hero.heading,
      hero_subheading: hero.subheading,
      hero_image: hero.hero_image || null,
      culture,
      culture_heading: cultureHeading || 'Company Culture',
      benefits,
      benefits_heading: benefitsHeading || 'Benefits & Perks',
      section1_heading: section1.heading || 'We\'re Hiring',
      section1_subheading: section1.subheading,
      section1_description: section1.description,
      section2_heading: section2.heading || 'Job Openings',
      section2_subheading: section2.subheading,
      form_config: formConfig,
      carousel_enabled: carouselEnabled,
      is_published: true,
    };

    let res;
    if (pageId) {
      res = await supabase.from('career_page_content').update(payload).eq('id', pageId);
    } else {
      res = await supabase.from('career_page_content').insert(payload).select('id').single();
    }

    if (res.error) {
      setSaveError(res.error.message);
    } else {
      if (res.data?.id) setPageId(res.data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function openJobForm() {
    setJobForm(defaultJobForm);
    setEditingJob(null);
    setShowJobForm(true);
  }

  function openEditJob(job) {
    setJobForm({ ...job });
    setEditingJob(job.id);
    setShowJobForm(true);
  }

  function closeJobForm() {
    setShowJobForm(false);
    setEditingJob(null);
    setJobForm(defaultJobForm);
  }

  function handleJobChange(e) {
    const { name, value, type, checked } = e.target;
    setJobForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleJobSave(e) {
    e.preventDefault();
    if (!jobForm.title.trim()) return;
    setJobSaving(true);

    const payload = {
      title: jobForm.title.trim(),
      role_category_id: jobForm.role_category_id || null,
      location: jobForm.location.trim() || null,
      type: jobForm.type.trim() || null,
      experience: jobForm.experience.trim() || null,
      salary: jobForm.salary.trim() || null,
      description: jobForm.description.trim() || null,
      is_active: jobForm.is_active,
      sort_order: jobForm.sort_order,
    };

    if (editingJob) {
      await supabase.from('job_openings').update(payload).eq('id', editingJob);
    } else {
      const { data } = await supabase.from('job_openings').insert(payload).select('*').single();
      if (data) payload.id = data.id;
    }

    setJobSaving(false);
    closeJobForm();

    const { data: jobs } = await supabase
      .from('job_openings')
      .select('*, role_categories(name)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setOpenings(jobs || []);
  }

  async function deleteJob(id) {
    if (!window.confirm('Delete this job opening?')) return;
    await supabase.from('job_openings').delete().eq('id', id);
    setOpenings(prev => prev.filter(j => j.id !== id));
  }

  async function toggleActive(job) {
    await supabase.from('job_openings').update({ is_active: !job.is_active }).eq('id', job.id);
    setOpenings(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
  }

  function openCategoryForm() {
    setCategoryForm({ name: '', display_order: roleCategories.length, is_active: true });
    setEditingCategory(null);
    setShowCategoryForm(true);
  }

  function openEditCategory(cat) {
    setCategoryForm({ name: cat.name, display_order: cat.display_order, is_active: cat.is_active });
    setEditingCategory(cat.id);
    setShowCategoryForm(true);
  }

  function closeCategoryForm() {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', display_order: 0, is_active: true });
  }

  function handleCategoryChange(e) {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setCategoryForm(prev => ({ ...prev, [name]: newVal }));
  }

  async function handleCategorySave(e) {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    setCategorySaving(true);

    const payload = {
      name: categoryForm.name.trim(),
      display_order: categoryForm.display_order,
      is_active: categoryForm.is_active,
    };

    if (editingCategory) {
      const { error } = await supabase.from('role_categories').update(payload).eq('id', editingCategory);
      if (error) return alert('Update error: ' + error.message);
    } else {
      const { error } = await supabase.from('role_categories').insert(payload);
      if (error) return alert('Insert error: ' + error.message);
    }

    setCategorySaving(false);
    closeCategoryForm();

    const { data: cats } = await supabase
      .from('role_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    setRoleCategories(cats || []);
  }

  async function deleteCategory(id) {
    if (!window.confirm('Delete this role category?')) return;
    await supabase.from('role_categories').delete().eq('id', id);
    setRoleCategories(prev => prev.filter(c => c.id !== id));
  }

  async function toggleCategoryActive(cat) {
    await supabase.from('role_categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    setRoleCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
  }

  const inputClass = 'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500';

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Career Page</h1>
          <Link to="/career" target="_blank" className="text-sm text-accent-600 hover:underline inline-flex items-center gap-1 mt-0.5">
            <FiExternalLink className="w-3.5 h-3.5" /> /career
          </Link>
        </div>
      </div>

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Hero Section</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })}
              placeholder="Heading" className={inputClass} />
            <input type="text" value={hero.subheading} onChange={(e) => setHero({ ...hero, subheading: e.target.value })}
              placeholder="Subheading" className={inputClass} />
          </div>
          <div className="mt-4">
            <ImageUploader value={hero.hero_image} onChange={(v) => setHero({ ...hero, hero_image: v })} label="Hero Image" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Company Culture</h2>
          <input type="text" value={cultureHeading} onChange={(e) => setCultureHeading(e.target.value)}
            placeholder="Section heading (e.g. Company Culture)" className="w-full mb-3 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          <textarea value={culture} onChange={(e) => setCulture(e.target.value)} rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="Describe your company culture, values, and work environment..." />
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <input type="text" value={benefitsHeading} onChange={(e) => setBenefitsHeading(e.target.value)}
              placeholder="Section heading (e.g. Benefits & Perks)" className="flex-1 mr-4 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-semibold text-neutral-900" />
            <AdminButton type="button" onClick={() => setBenefits([...benefits, { title: '', description: '' }])} variant="ghost" size="sm">
              <FiPlus className="w-4 h-4" /> Add Benefit
            </AdminButton>
          </div>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Benefit {i + 1}</span>
                  <button type="button" onClick={() => setBenefits(benefits.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" value={b.title} onChange={(e) => { const u = [...benefits]; u[i] = { ...u[i], title: e.target.value }; setBenefits(u); }}
                  placeholder="Title (e.g. Flexible Hours)" className={inputClass} />
                <textarea value={b.description} onChange={(e) => { const u = [...benefits]; u[i] = { ...u[i], description: e.target.value }; setBenefits(u); }}
                  rows={2} placeholder="Description..." className="w-full mt-2 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Role Categories</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <span>Carousel mode</span>
                <button type="button" onClick={() => setCarouselEnabled(!carouselEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${carouselEnabled ? 'bg-accent-600' : 'bg-neutral-300'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${carouselEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </label>
              <AdminButton type="button" onClick={openCategoryForm} variant="ghost" size="sm">
                <FiPlus className="w-4 h-4" /> Add Category
              </AdminButton>
            </div>
          </div>

          {roleCategories.length === 0 ? (
            <EmptyState
              icon={FiBriefcase}
              title="No role categories yet"
              description="Categories appear as carousel cards above the job listings."
              action={{ onClick: openCategoryForm, icon: <FiPlus className="w-4 h-4" />, label: 'Add Role Category' }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left px-3 py-2.5 font-medium text-neutral-600">Name</th>
                    <th className="text-center px-3 py-2.5 font-medium text-neutral-600">Order</th>
                    <th className="text-center px-3 py-2.5 font-medium text-neutral-600">Active</th>
                    <th className="text-right px-3 py-2.5 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleCategories.map((cat) => (
                    <tr key={cat.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-neutral-900">{cat.name}</td>
                      <td className="px-3 py-2.5 text-center text-neutral-600">{cat.display_order}</td>
                      <td className="px-3 py-2.5 text-center">
                        <button type="button" onClick={() => toggleCategoryActive(cat)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            cat.is_active
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                          }`}>
                          {cat.is_active ? <FiCheck className="w-3 h-3" /> : <FiX className="w-3 h-3" />}
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openEditCategory(cat)}
                            className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => deleteCategory(cat.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">"We're Hiring" Section</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-3">
            <input type="text" value={section1.heading} onChange={(e) => setSection1({ ...section1, heading: e.target.value })}
              placeholder="Section heading (e.g. We're Hiring)" className={inputClass} />
            <input type="text" value={section1.subheading} onChange={(e) => setSection1({ ...section1, subheading: e.target.value })}
              placeholder="Subheading" className={inputClass} />
          </div>
          <textarea value={section1.description} onChange={(e) => setSection1({ ...section1, description: e.target.value })}
            rows={2} placeholder="Short description shown above the department filter grid" className={inputClass} />
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5 text-accent-600" />
              Job Openings
            </h2>
            <AdminButton type="button" onClick={openJobForm} variant="ghost" size="sm">
              <FiPlus className="w-4 h-4" /> Add Opening
            </AdminButton>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-neutral-100">
            <input type="text" value={section2.heading} onChange={(e) => setSection2({ ...section2, heading: e.target.value })}
              placeholder="Section heading (e.g. Job Openings)" className={inputClass} />
            <input type="text" value={section2.subheading} onChange={(e) => setSection2({ ...section2, subheading: e.target.value })}
              placeholder="Section subheading" className={inputClass} />
          </div>

          {openings.length === 0 ? (
            <EmptyState
              icon={FiBriefcase}
              title="No job openings yet"
              description="Add job openings to start receiving applications on the career page."
              action={{ onClick: openJobForm, icon: <FiPlus className="w-4 h-4" />, label: 'Add Job Opening' }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left px-3 py-2.5 font-medium text-neutral-600">Title</th>
                    <th className="text-left px-3 py-2.5 font-medium text-neutral-600">Category</th>
                    <th className="text-left px-3 py-2.5 font-medium text-neutral-600 hidden sm:table-cell">Location</th>
                    <th className="text-left px-3 py-2.5 font-medium text-neutral-600 hidden md:table-cell">Type</th>
                    <th className="text-center px-3 py-2.5 font-medium text-neutral-600">Active</th>
                    <th className="text-right px-3 py-2.5 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {openings.map((job) => (
                    <tr key={job.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-neutral-900">{job.title}</td>
                      <td className="px-3 py-2.5 text-neutral-600">{job.role_categories?.name || '—'}</td>
                      <td className="px-3 py-2.5 text-neutral-600 hidden sm:table-cell">{job.location || '—'}</td>
                      <td className="px-3 py-2.5 text-neutral-600 hidden md:table-cell">{job.type || '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <button type="button" onClick={() => toggleActive(job)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            job.is_active
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                          }`}>
                          {job.is_active ? <FiCheck className="w-3 h-3" /> : <FiX className="w-3 h-3" />}
                          {job.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openEditJob(job)}
                            className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => deleteJob(job.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
              <FiToggleRight className="w-5 h-5 text-accent-600" />
              Application Form Configuration
            </h2>
            <button type="button" onClick={() => setFormConfig({ ...formConfig, enabled: !formConfig.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formConfig.enabled ? 'bg-accent-600' : 'bg-neutral-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {formConfig.enabled && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">CTA Button Variant</label>
                  <select value={formConfig.cta?.variant || 'accent'} onChange={(e) => setFormConfig({ ...formConfig, cta: { ...formConfig.cta, variant: e.target.value } })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white">
                    <option value="accent">Accent</option>
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Headline</label>
                <input type="text" value={formConfig.headline || ''} onChange={(e) => setFormConfig({ ...formConfig, headline: e.target.value })}
                  className={inputClass} placeholder="Apply Now" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Description</label>
                <input type="text" value={formConfig.description || ''} onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                  className={inputClass} placeholder="Fill out the form below..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">CTA Button Text</label>
                <input type="text" value={formConfig.cta?.text || ''} onChange={(e) => setFormConfig({ ...formConfig, cta: { ...(formConfig.cta || {}), text: e.target.value } })}
                  className={inputClass} placeholder="Submit Application" />
              </div>
              <FormFieldsEditor fields={formConfig.fields} onChange={(fields) => setFormConfig({ ...formConfig, fields })} />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-100 mt-6">
          <AdminButton type="submit" disabled={saving} variant="primary" size="md">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Page'}
          </AdminButton>
        </div>
      </form>

      {showJobForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 pt-12 sm:pt-20" onClick={closeJobForm}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
              <h2 className="text-base font-semibold text-neutral-900">{editingJob ? 'Edit Job Opening' : 'Add Job Opening'}</h2>
              <button type="button" onClick={closeJobForm} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleJobSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Title *</label>
                  <input name="title" value={jobForm.title} onChange={handleJobChange} placeholder="e.g. Software Engineer" className={inputClass} required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Role Category</label>
                  <select name="role_category_id" value={jobForm.role_category_id} onChange={handleJobChange} className={inputClass}>
                    <option value="">Select category</option>
                    {roleCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Location</label>
                  <input name="location" value={jobForm.location} onChange={handleJobChange} placeholder="e.g. New York, NY" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
                  <select name="type" value={jobForm.type} onChange={handleJobChange} className={inputClass}>
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Experience</label>
                  <input name="experience" value={jobForm.experience} onChange={handleJobChange} placeholder="e.g. 2–4 years" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Salary</label>
                  <input name="salary" value={jobForm.salary} onChange={handleJobChange} placeholder="e.g. $80k–$120k" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
                <textarea name="description" value={jobForm.description} onChange={handleJobChange} rows={3}
                  placeholder="Brief description of the role…" className={inputClass} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" name="is_active" checked={jobForm.is_active} onChange={handleJobChange}
                    className="w-4 h-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-500" />
                  <label htmlFor="is_active" className="text-sm text-neutral-600">Active (visible on site)</label>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <label htmlFor="job_sort_order" className="text-xs text-neutral-500">Sort:</label>
                  <input type="number" id="job_sort_order" name="sort_order" value={jobForm.sort_order} onChange={handleJobChange}
                    className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm text-center" min="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeJobForm}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={jobSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors disabled:opacity-50">
                  {jobSaving ? 'Saving...' : editingJob ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 pt-12 sm:pt-20" onClick={closeCategoryForm}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
              <h2 className="text-base font-semibold text-neutral-900">{editingCategory ? 'Edit Role Category' : 'Add Role Category'}</h2>
              <button type="button" onClick={closeCategoryForm} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Name *</label>
                <input name="name" value={categoryForm.name} onChange={handleCategoryChange} placeholder="e.g. HR Recruiters" className={inputClass} required />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Display Order</label>
                  <input type="number" name="display_order" value={categoryForm.display_order} onChange={handleCategoryChange} className={inputClass} min="0" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="cat_is_active" name="is_active" checked={categoryForm.is_active} onChange={handleCategoryChange}
                    className="w-4 h-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-500" />
                  <label htmlFor="cat_is_active" className="text-sm text-neutral-600">Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeCategoryForm}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={categorySaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors disabled:opacity-50">
                  {categorySaving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
