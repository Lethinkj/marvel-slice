import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiSave, FiAlertCircle, FiPlus, FiTrash2, FiUpload, FiArrowLeft, FiExternalLink } from 'react-icons/fi';

function ImageUploader({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `services/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" placeholder="Paste URL or upload..." />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-colors">
          {uploading ? <span className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" /> : <FiUpload className="w-4 h-4" />}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-28 w-full object-cover rounded-lg border border-gray-200" />}
    </div>
  );
}

const PAGE_PATH = '/services';

export default function ServicesPageEditor() {
  const navigate = useNavigate();
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
  const [services, setServices] = useState([]);
  const [cta, setCta] = useState({ heading: '', content: '', link: '' });
  const [faqs, setFaqs] = useState([]);

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
        const { data: newItem } = await supabase.from('nav_items').insert({ label: 'Services', path: PAGE_PATH, is_active: true, sort_order: 99 }).select('*').single();
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
          if (cardsSec?.items) setServices(cardsSec.items.map(i => typeof i === 'string' ? { title: i, description: '' } : i));
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
      services.length > 0 ? { section_type: 'cards', heading: 'Our Services', items: services } : null,
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
      setTimeout(() => setSaved(false), 2000);
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin')} className="p-2 text-gray-400 hover:text-dark-navy rounded-lg hover:bg-gray-100 transition-colors"><FiArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">{navItem?.label || 'Services'} Page</h1>
          <Link to="/services" target="_blank" className="text-sm text-brand-accent hover:underline inline-flex items-center gap-1 mt-0.5"><FiExternalLink className="w-3.5 h-3.5" /> /services</Link>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-navy">Services</h2>
            <Button type="button" onClick={() => setServices([...services, { title: '', description: '' }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add Service</Button>
          </div>
          <div className="space-y-4">
            {services.map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Service {i + 1}</span>
                  <button type="button" onClick={() => setServices(services.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" value={s.title} onChange={(e) => { const u = [...services]; u[i] = { ...u[i], title: e.target.value }; setServices(u); }} placeholder="Service title" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <textarea value={s.description} onChange={(e) => { const u = [...services]; u[i] = { ...u[i], description: e.target.value }; setServices(u); }} rows={2} placeholder="Brief description..." className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-dark-navy mb-4">Call to Action</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <input type="text" value={cta.heading} onChange={(e) => setCta({ ...cta, heading: e.target.value })} placeholder="Heading" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
            <input type="text" value={cta.content} onChange={(e) => setCta({ ...cta, content: e.target.value })} placeholder="Subtext" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
            <input type="text" value={cta.link} onChange={(e) => setCta({ ...cta, link: e.target.value })} placeholder="Button link URL" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-navy">FAQs</h2>
            <Button type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add FAQ</Button>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">FAQ {i + 1}</span>
                  <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" value={f.question} onChange={(e) => { const u = [...faqs]; u[i] = { ...u[i], question: e.target.value }; setFaqs(u); }} placeholder="Question" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <textarea value={f.answer} onChange={(e) => { const u = [...faqs]; u[i] = { ...u[i], answer: e.target.value }; setFaqs(u); }} rows={2} placeholder="Answer..." className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
          <Button type="submit" disabled={saving} variant="accent" size="md"><FiSave className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Page'}</Button>
        </div>
      </form>
    </div>
  );
}
