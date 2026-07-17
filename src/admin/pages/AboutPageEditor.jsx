import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import { FiSave, FiAlertCircle, FiPlus, FiTrash2, FiUpload, FiArrowLeft, FiExternalLink } from 'react-icons/fi';

function ImageUploader({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `about/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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

const PAGE_PATH = '/about';

export default function AboutPageEditor() {
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
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [stats, setStats] = useState([]);
  const [team, setTeam] = useState([]);
  const [cta, setCta] = useState({ heading: '', content: '', link: '' });

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
        const { data: newItem, error: createErr } = await supabase.from('nav_items').insert({ label: 'About', path: PAGE_PATH, is_active: true, sort_order: 99 }).select('*').single();
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
          const find = (type) => secs.find(s => s.section_type === type);
          const f = find('text');
          if (f) { setMission(f.content || ''); }
          const v = secs.filter(s => s.section_type === 'text');
          if (v.length > 1) setVision(v[1].content || '');
          const s = find('stats_row');
          if (s?.items) setStats(s.items);
          const t = find('team_grid');
          if (t?.items) setTeam(t.items);
          const c = find('cta');
          if (c) setCta({ heading: c.heading || '', content: c.content || '', link: c.image_url || '' });
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
    if (!navItemId && !navItemIdRef.current) { setSaveError('No nav item linked — please refresh and try again'); setSaving(false); savingRef.current = false; return; }
    const sections = [
      mission ? { section_type: 'text', heading: 'Our Mission', content: mission } : null,
      vision ? { section_type: 'text', heading: 'Our Vision', content: vision } : null,
      stats.length > 0 ? { section_type: 'stats_row', heading: '', items: stats } : null,
      team.length > 0 ? { section_type: 'team_grid', heading: 'Our Team', items: team } : null,
      cta.heading || cta.content ? { section_type: 'cta', heading: cta.heading, content: cta.content, image_url: cta.link || null } : null,
    ].filter(Boolean);

    if (!navItemId && !navItemIdRef.current) { setSaveError('No nav item linked — please refresh and try again'); setSaving(false); return; }

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
          <h1 className="text-2xl font-bold text-neutral-900">{navItem?.label || 'About'} Page</h1>
          <Link to="/about" target="_blank" className="text-sm text-accent-600 hover:underline inline-flex items-center gap-1 mt-0.5"><FiExternalLink className="w-3.5 h-3.5" /> /about</Link>
        </div>
      </div>
      {saveError && <div className="mb-6 p-4 bg-destructive-50 border border-destructive-200 rounded-lg flex items-center gap-2 text-destructive-700 text-sm"><FiAlertCircle className="w-4 h-4 shrink-0" /> {saveError}</div>}
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
          <h2 className="font-semibold text-neutral-900 mb-4">Mission</h2>
          <textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={3} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" placeholder="Our mission statement..." />
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Vision</h2>
          <textarea value={vision} onChange={(e) => setVision(e.target.value)} rows={3} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" placeholder="Our vision statement..." />
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Stats</h2>
            <AdminButton type="button" onClick={() => setStats([...stats, { number: '', label: '' }])} variant="ghost" size="sm"><FiPlus className="w-4 h-4" /> Add Stat</AdminButton>
          </div>
          <div className="space-y-3">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="text" value={s.number} onChange={(e) => { const u = [...stats]; u[i] = { ...u[i], number: e.target.value }; setStats(u); }} placeholder="Number (e.g. 500+)" className="w-1/3 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                <input type="text" value={s.label} onChange={(e) => { const u = [...stats]; u[i] = { ...u[i], label: e.target.value }; setStats(u); }} placeholder="Label (e.g. Students)" className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                <button type="button" onClick={() => setStats(stats.filter((_, j) => j !== i))} className="p-2 text-destructive-400 hover:text-destructive-600 hover:bg-destructive-50 rounded-lg transition-colors"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Team Members</h2>
            <AdminButton type="button" onClick={() => setTeam([...team, { name: '', role: '', bio: '', image_url: '' }])} variant="ghost" size="sm"><FiPlus className="w-4 h-4" /> Add Member</AdminButton>
          </div>
          <div className="space-y-4">
            {team.map((m, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Member {i + 1}</span>
                  <button type="button" onClick={() => setTeam(team.filter((_, j) => j !== i))} className="p-1 text-destructive-400 hover:text-destructive-600"><FiTrash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input type="text" value={m.name} onChange={(e) => { const u = [...team]; u[i] = { ...u[i], name: e.target.value }; setTeam(u); }} placeholder="Name" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                  <input type="text" value={m.role} onChange={(e) => { const u = [...team]; u[i] = { ...u[i], role: e.target.value }; setTeam(u); }} placeholder="Role" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                </div>
                <textarea value={m.bio} onChange={(e) => { const u = [...team]; u[i] = { ...u[i], bio: e.target.value }; setTeam(u); }} rows={2} placeholder="Short bio..." className="w-full mt-3 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
                <div className="mt-3"><ImageUploader value={m.image_url} onChange={(v) => { const u = [...team]; u[i] = { ...u[i], image_url: v }; setTeam(u); }} label="Photo" /></div>
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

        <div className="flex justify-end pt-4 border-t border-neutral-100 mt-6">
          <AdminButton type="submit" disabled={saving} variant="primary" size="md"><FiSave className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Page'}</AdminButton>
        </div>
      </form>
    </div>
  );
}
