import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiSave, FiCheck, FiEye } from 'react-icons/fi';

export default function PromoBannerManager() {
  const [form, setForm] = useState({
    heading: '',
    highlighted_text: '',
    subtext: '',
    cta_label: '',
    cta_link: '',
    is_active: true,
  });
  const [bannerId, setBannerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('promo_banners')
      .select('*')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const b = data[0];
          setBannerId(b.id);
          setForm({
            heading: b.heading || '',
            highlighted_text: b.highlighted_text || '',
            subtext: b.subtext || '',
            cta_label: b.cta_label || '',
            cta_link: b.cta_link || '',
            is_active: b.is_active !== false,
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (bannerId) {
      await supabase.from('promo_banners').update(payload).eq('id', bannerId);
    } else {
      await supabase.from('promo_banners').insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-navy">Promo Banner</h1>
        <p className="text-sm text-gray-500 mt-1">Edit the callout banner displayed on the home page</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <FiCheck className="w-4 h-4" /> Banner saved!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Heading</label>
          <input type="text" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
            placeholder="Main banner heading" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Highlighted Text</label>
          <input type="text" value={form.highlighted_text} onChange={(e) => setForm({ ...form, highlighted_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
            placeholder="Text that appears highlighted in orange" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Subtext</label>
          <textarea value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
            placeholder="Supporting text below the heading" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">CTA Label</label>
            <input type="text" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
              placeholder="Know More" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">CTA Link</label>
            <input type="text" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
              placeholder="/courses" />
          </div>
        </div>

        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors">
          <div className={`relative w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-brand-accent' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-4' : ''}`} />
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only" />
          </div>
          <div>
            <span className="text-sm font-medium text-dark-navy">Active</span>
            <p className="text-xs text-gray-500">Banner will be displayed on the home page</p>
          </div>
          {form.is_active && <FiEye className="w-4 h-4 text-green-500 ml-auto" />}
        </label>

        <div className="border-t border-gray-100 pt-5 flex justify-end">
          <Button type="submit" disabled={saving} variant="accent" size="md">
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Banner'}
          </Button>
        </div>
      </form>
    </div>
  );
}
