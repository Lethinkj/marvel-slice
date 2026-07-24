import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import SaveBar from '../components/SaveBar';
import useDirty from '../hooks/useDirty';
import { FiSave, FiAlertCircle, FiPlus, FiTrash2, FiUpload, FiArrowLeft, FiExternalLink } from 'react-icons/fi';

function ImageUploader({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `training/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" placeholder="Paste URL or upload..." />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-accent-500 hover:text-accent-600 transition-colors">
          {uploading ? <span className="w-4 h-4 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" /> : <FiUpload className="w-4 h-4" />}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-28 w-full object-cover rounded-lg border border-neutral-200" />}
    </div>
  );
}

const PAGE_PATH = '/training';

export default function TrainingPageEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [navItem, setNavItem] = useState(null);
  const [navItemId, setNavItemId] = useState(null);
  const [pageId, setPageId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navItemIdRef = useRef(null);
  const savingRef = useRef(false);

  const [hero, setHero] = useState({ heading: '', subheading: '', hero_image: '' });
  const [programs, setPrograms] = useState([]);
  const [features, setFeatures] = useState([]);
  const [cta, setCta] = useState({ heading: '', content: '', link: '' });
  const [faqs, setFaqs] = useState([]);
  const { dirty, reset } = useDirty([hero, programs, features, cta, faqs], loading);

  useEffect(() => {
    async function resolve() {
      let { data: items } = await supabase.from('nav_items').select('*').eq('path', PAGE_PATH).eq('is_active', true).order('id').limit(1);
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
        const { data: newItem } = await supabase.from('nav_items').insert({ label: 'Training', path: PAGE_PATH, is_active: true, sort_order: 99 }).select('*').single();
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
          const cardsSec = secs.find(s => s.section_type === 'cards');
          if (cardsSec?.items) setPrograms(cardsSec.items.map(i => typeof i === 'string' ? { title: i, description: '' } : i));
          const featuresSec = secs.find(s => s.section_type === 'features');
          if (featuresSec?.items) setFeatures(featuresSec.items.map(i => typeof i === 'string' ? { text: i } : i));
          const ctaSec = secs.find(s => s.section_type === 'cta');
          if (ctaSec) setCta({ heading: ctaSec.heading || '', content: ctaSec.content || '', link: ctaSec.image_url || '' });
          const faqSec = secs.find(s => s.section_type === 'faq_list');
          if (faqSec?.items) setFaqs(faqSec.items);
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
      programs.length > 0 ? { section_type: 'cards', heading: 'Training Programs', items: programs } : null,
      features.length > 0 ? { section_type: 'features', heading: 'Why Choose Us', items: features } : null,
      cta.heading || cta.content ? { section_type: 'cta', heading: cta.heading, content: cta.content, image_url: cta.link || null } : null,
      faqs.length > 0 ? { section_type: 'faq_list', heading: 'Frequently Asked Questions', items: faqs } : null,
    ].filter(Boolean);
    if (!navItemId && !navItemIdRef.current) { setSaveError('No nav item linked'); setSaving(false); savingRef.current = false; return; }
    const payload = { nav_item_id: navItemId || navItemIdRef.current, heading: hero.heading, subheading: hero.subheading, hero_image: hero.hero_image || null, sections, is_published: true };
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
      setSaved(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ['navPage', navItemId] });
      queryClient.invalidateQueries({ queryKey: ['navPageData'] });
      setTimeout(() => setSaved(false), 2000);
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin')} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"><FiArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{navItem?.label || 'Training'} Page</h1>
          <Link to="/training" target="_blank" className="text-sm text-accent-600 hover:underline inline-flex items-center gap-1 mt-0.5"><FiExternalLink className="w-3.5 h-3.5" /> /training</Link>
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} saveError={saveError} onSave={handleSave} label="Page" top />
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Hero Section</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} placeholder="Heading" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            <input type="text" value={hero.subheading} onChange={(e) => setHero({ ...hero, subheading: e.target.value })} placeholder="Subheading" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
          <div className="mt-4"><ImageUploader value={hero.hero_image} onChange={(v) => setHero({ ...hero, hero_image: v })} label="Hero Image" /></div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Training Programs</h2>
            <AdminButton type="button" onClick={() => setPrograms([...programs, { title: '', description: '' }])} variant="ghost" size="sm"><FiPlus className="w-4 h-4" /> Add Program</AdminButton>
          </div>
          <div className="space-y-4">
            {programs.map((p, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Program {i + 1}</span>
                  <button type="button" onClick={() => setPrograms(programs.filter((_, j) => j !== i))} className="p-1 text-destructive-400 hover:text-destructive-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" value={p.title} onChange={(e) => { const u = [...programs]; u[i] = { ...u[i], title: e.target.value }; setPrograms(u); }} placeholder="Program title" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                <textarea value={p.description} onChange={(e) => { const u = [...programs]; u[i] = { ...u[i], description: e.target.value }; setPrograms(u); }} rows={2} placeholder="Program description..." className="w-full mt-2 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Features</h2>
            <AdminButton type="button" onClick={() => setFeatures([...features, { text: '' }])} variant="ghost" size="sm"><FiPlus className="w-4 h-4" /> Add Feature</AdminButton>
          </div>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={f.text} onChange={(e) => { const u = [...features]; u[i] = { ...u[i], text: e.target.value }; setFeatures(u); }} placeholder="Feature text" className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))} className="p-2 text-destructive-400 hover:text-destructive-600"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Call to Action</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <input type="text" value={cta.heading} onChange={(e) => setCta({ ...cta, heading: e.target.value })} placeholder="Heading" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            <input type="text" value={cta.content} onChange={(e) => setCta({ ...cta, content: e.target.value })} placeholder="Subtext" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            <input type="text" value={cta.link} onChange={(e) => setCta({ ...cta, link: e.target.value })} placeholder="Button link URL" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">FAQs</h2>
            <AdminButton type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} variant="ghost" size="sm"><FiPlus className="w-4 h-4" /> Add FAQ</AdminButton>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">FAQ {i + 1}</span>
                  <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="p-1 text-destructive-400 hover:text-destructive-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" value={f.question} onChange={(e) => { const u = [...faqs]; u[i] = { ...u[i], question: e.target.value }; setFaqs(u); }} placeholder="Question" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                <textarea value={f.answer} onChange={(e) => { const u = [...faqs]; u[i] = { ...u[i], answer: e.target.value }; setFaqs(u); }} rows={2} placeholder="Answer..." className="w-full mt-2 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
            ))}
          </div>
        </div>

        <SaveBar saving={saving} saved={saved} saveError={saveError} onSave={handleSave} label="Page" dirty={dirty} />
      </form>
    </div>
  );
}
