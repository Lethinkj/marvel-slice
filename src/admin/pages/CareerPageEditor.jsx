import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiSave, FiAlertCircle, FiPlus, FiTrash2, FiUpload, FiArrowLeft, FiExternalLink, FiToggleRight, FiChevronDown, FiChevronUp, FiEdit3 } from 'react-icons/fi';

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
    position: 'after',
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
      <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <FiEdit3 className="w-3.5 h-3.5" />
        Form Fields
      </label>
      <div className="space-y-2">
        {fieldKeys.map((key) => {
          const def = FORM_FIELD_DEFAULTS[key];
          const cfg = fields?.[key] || {};
          const isOpen = expanded[key] || false;
          return (
            <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setExpanded({ ...expanded, [key]: !isOpen })}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.enabled !== false ? 'bg-green-400' : 'bg-gray-300'}`} />
                <span className="flex-1 text-sm font-medium text-dark-navy">{cfg.label || def.label}</span>
                <span className="text-xs text-gray-400 capitalize">{def.type}</span>
                {isOpen ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Enabled</label>
                    <button type="button" onClick={() => onChange({ ...fields, [key]: { ...cfg, enabled: cfg.enabled === false ? true : false } })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cfg.enabled !== false ? 'bg-brand-accent' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${cfg.enabled !== false ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Label</label>
                    <input type="text" value={cfg.label || def.label} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, label: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  </div>
                  {def.type !== 'file' && (
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={cfg.required !== false} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, required: e.target.checked } })} className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                        Required
                      </label>
                    </div>
                  )}
                  {def.placeholder !== undefined && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Placeholder</label>
                      <input type="text" value={cfg.placeholder || def.placeholder || ''} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, placeholder: e.target.value } })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                    </div>
                  )}
                  {def.options && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Options (one per line)</label>
                      <textarea value={(cfg.options || def.options).join('\n')} onChange={(e) => onChange({ ...fields, [key]: { ...cfg, options: e.target.value.split('\n').filter(Boolean) } })}
                        rows={4} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent font-mono" />
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
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Paste URL or upload..." />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-colors">
          {uploading ? <span className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" /> : <FiUpload className="w-4 h-4" />}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-28 w-full object-cover rounded-lg border border-gray-200" />}
    </div>
  );
}

const PAGE_PATH = '/career';

export default function CareerPageEditor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [navItem, setNavItem] = useState(null);
  const [navItemId, setNavItemId] = useState(null);
  const [pageId, setPageId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navItemIdRef = useRef(null);
  const savingRef = useRef(false);

  const [hero, setHero] = useState({ heading: '', subheading: '', hero_image: '' });
  const [culture, setCulture] = useState('');
  const [benefits, setBenefits] = useState([]);
  const [positions, setPositions] = useState([]);
  const [formConfig, setFormConfig] = useState(buildDefaultFormConfig());

  useEffect(() => {
    async function resolve() {
      let { data: items, error: findErr } = await supabase.from('nav_items').select('*').eq('path', PAGE_PATH).eq('is_active', true).order('id').limit(1);
      let item = items?.[0] || null;
      if (!item) {
        const { data: inactiveItems } = await supabase.from('nav_items').select('*').eq('path', PAGE_PATH).order('id').limit(1);
        item = inactiveItems?.[0] || null;
        if (item) {
          await supabase.from('nav_items').update({ is_active: true }).eq('id', item.id);
          await supabase.from('nav_items').update({ is_active: false }).eq('path', PAGE_PATH).neq('id', item.id);
        }
      }
      if (!item) {
        const { data: newItem, error: createErr } = await supabase.from('nav_items').insert({ label: 'Career', path: PAGE_PATH, is_active: true, sort_order: 99 }).select('*').single();
        if (createErr) { console.error('create nav_item failed:', createErr); }
        item = newItem || null;
      }
      setNavItem(item);
      setNavItemId(item?.id);
      navItemIdRef.current = item?.id;
      if (item?.id) {
        const { data: pages } = await supabase.from('nav_pages').select('*').eq('nav_item_id', item.id).order('id').limit(1);
        const page = pages?.[0] || null;
        if (page) {
          setPageId(page.id);
          setHero({ heading: page.heading || '', subheading: page.subheading || '', hero_image: page.hero_image || '' });
          const secs = page.sections || [];
          const cult = secs.find(s => s.section_type === 'text');
          if (cult) setCulture(cult.content || '');
          const ben = secs.find(s => s.section_type === 'features');
          if (ben?.items) setBenefits(ben.items);
          const pos = secs.find(s => s.section_type === 'positions');
          if (pos?.items) setPositions(pos.items);
          if (page.form_config && typeof page.form_config === 'object' && Object.keys(page.form_config).length > 0) {
            setFormConfig({ ...buildDefaultFormConfig(), ...page.form_config });
          }
        }
      }
      setLoading(false);
    }
    resolve();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    const sections = [
      culture ? { section_type: 'text', heading: 'Our Culture', content: culture } : null,
      benefits.length > 0 ? { section_type: 'features', heading: 'Why Join Us', items: benefits } : null,
      positions.length > 0 ? { section_type: 'positions', heading: 'Open Positions', items: positions } : null,
    ].filter(Boolean);

    if (!navItemId && !navItemIdRef.current) { setSaveError('No nav item linked — please refresh and try again'); setSaving(false); savingRef.current = false; return; }

    const payload = { nav_item_id: navItemId || navItemIdRef.current, heading: hero.heading, subheading: hero.subheading, hero_image: hero.hero_image || null, sections, is_published: true, form_config: formConfig };
    let res;
    if (pageId) {
      res = await supabase.from('nav_pages').update(payload).eq('id', pageId);
    } else {
      res = await supabase.from('nav_pages').insert(payload).select('id').single();
    }
    if (res.error) {
      setSaveError(res.error.message);
      savingRef.current = false;
      setSaving(false);
    } else {
      if (res.data?.id) setPageId(res.data.id);
      navigate('/admin');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin')} className="p-2 text-gray-400 hover:text-dark-navy rounded-lg hover:bg-gray-100 transition-colors"><FiArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">{navItem?.label || 'Career'} Page</h1>
          <Link to="/career" target="_blank" className="text-sm text-brand-accent hover:underline inline-flex items-center gap-1 mt-0.5"><FiExternalLink className="w-3.5 h-3.5" /> /career</Link>
        </div>
      </div>
      {saveError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm"><FiAlertCircle className="w-4 h-4 shrink-0" /> {saveError}</div>}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-dark-navy mb-4">Hero Section</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} placeholder="Heading" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
            <input type="text" value={hero.subheading} onChange={(e) => setHero({ ...hero, subheading: e.target.value })} placeholder="Subheading" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
          </div>
          <div className="mt-4"><ImageUploader value={hero.hero_image} onChange={(v) => setHero({ ...hero, hero_image: v })} label="Hero Image" /></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-dark-navy mb-4">Company Culture</h2>
          <textarea value={culture} onChange={(e) => setCulture(e.target.value)} rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            placeholder="Describe your company culture, values, and work environment..." />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-navy">Benefits & Perks</h2>
            <Button type="button" onClick={() => setBenefits([...benefits, { title: '', description: '' }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add Benefit</Button>
          </div>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Benefit {i + 1}</span>
                  <button type="button" onClick={() => setBenefits(benefits.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" value={b.title} onChange={(e) => { const u = [...benefits]; u[i] = { ...u[i], title: e.target.value }; setBenefits(u); }} placeholder="Title (e.g. Flexible Hours)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <textarea value={b.description} onChange={(e) => { const u = [...benefits]; u[i] = { ...u[i], description: e.target.value }; setBenefits(u); }} rows={2} placeholder="Description..." className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-navy">Open Positions</h2>
            <Button type="button" onClick={() => setPositions([...positions, { title: '', location: '', type: '', description: '' }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add Position</Button>
          </div>
          <div className="space-y-3">
            {positions.map((p, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Position {i + 1}</span>
                  <button type="button" onClick={() => setPositions(positions.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 mb-2">
                  <input type="text" value={p.title} onChange={(e) => { const u = [...positions]; u[i] = { ...u[i], title: e.target.value }; setPositions(u); }} placeholder="Job Title" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  <input type="text" value={p.location} onChange={(e) => { const u = [...positions]; u[i] = { ...u[i], location: e.target.value }; setPositions(u); }} placeholder="Location" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  <input type="text" value={p.type} onChange={(e) => { const u = [...positions]; u[i] = { ...u[i], type: e.target.value }; setPositions(u); }} placeholder="Type (e.g. Full-time)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                </div>
                <textarea value={p.description} onChange={(e) => { const u = [...positions]; u[i] = { ...u[i], description: e.target.value }; setPositions(u); }} rows={2} placeholder="Job description..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-navy flex items-center gap-2">
              <FiToggleRight className="w-5 h-5 text-brand-accent" />
              Application Form Configuration
            </h2>
            <button type="button" onClick={() => setFormConfig({ ...formConfig, enabled: !formConfig.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formConfig.enabled ? 'bg-brand-accent' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {formConfig.enabled && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Form Position</label>
                  <select value={formConfig.position} onChange={(e) => setFormConfig({ ...formConfig, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white">
                    <option value="after">After page content</option>
                    <option value="before">Before page content</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">CTA Button Variant</label>
                  <select value={formConfig.cta?.variant || 'accent'} onChange={(e) => setFormConfig({ ...formConfig, cta: { ...formConfig.cta, variant: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white">
                    <option value="accent">Accent</option>
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Headline</label>
                <input type="text" value={formConfig.headline || ''} onChange={(e) => setFormConfig({ ...formConfig, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Apply Now" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Description</label>
                <input type="text" value={formConfig.description || ''} onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Fill out the form below..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">CTA Button Text</label>
                <input type="text" value={formConfig.cta?.text || ''} onChange={(e) => setFormConfig({ ...formConfig, cta: { ...(formConfig.cta || {}), text: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Submit Application" />
              </div>
              <FormFieldsEditor fields={formConfig.fields} onChange={(fields) => setFormConfig({ ...formConfig, fields })} />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} variant="accent" size="md"><FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Page'}</Button>
        </div>
      </form>
    </div>
  );
}
