import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import useDirty from '../hooks/useDirty';
import PageShell from '../components/ui/PageShell';
import ImageUploader from '../components/ImageUploader';
import { FiSave, FiAlertCircle, FiX, FiCheck } from 'react-icons/fi';

export default function BlogPageEditor() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [settingsId, setSettingsId] = useState(null);
  const [heroImage, setHeroImage] = useState('');
  const [heading, setHeading] = useState('Latest Articles & News');
  const [subheading, setSubheading] = useState('Insights, tutorials, and stories from the Marvel Slice team');

  const { dirty, reset } = useDirty([heroImage, heading, subheading], loading);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .maybeSingle()
      .then(({ data, error }) => {
        if (!data && error?.code === 'PGRST116') {
          return supabase.from('site_settings').select('*').limit(1).then(({ data: rows }) => {
            data = rows?.[0] || null;
          });
        }
        return data;
      })
      .then((data) => {
        if (data) {
          setSettingsId(data.id);
          if (data.blog_hero_image) setHeroImage(data.blog_hero_image);
          if (data.blog_heading) setHeading(data.blog_heading);
          if (data.blog_subheading) setSubheading(data.blog_subheading);
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const payload = {
      blog_hero_image: heroImage || null,
      blog_heading: heading,
      blog_subheading: subheading,
    };
    let res;
    if (settingsId) {
      res = await supabase.from('site_settings').update(payload).eq('id', settingsId);
    } else {
      res = await supabase.from('site_settings').insert(payload).select().single();
      if (res.data) setSettingsId(res.data.id);
    }
    if (res.error) {
      setSaveError(res.error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      setSaved(true);
      reset();
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 transition-all';

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-admin-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <PageShell backTo="/admin" title="">
      <div className="flex flex-col">
        <form onSubmit={handleSave} className="bg-white border border-gray-300 rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Heading</label>
                <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)} className={inputClass}
                  placeholder="Latest Articles & News" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Subheading</label>
                <input type="text" value={subheading} onChange={(e) => setSubheading(e.target.value)} className={inputClass}
                  placeholder="Insights, tutorials, and stories from the Marvel Slice team" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Hero Image</label>
              <ImageUploader value={heroImage} onChange={(url) => setHeroImage(url)} />
            </div>
          </div>
        </form>
        <div className="flex justify-center items-center gap-4 pt-4">
          <button type="button" onClick={() => window.location.reload()} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-[20px] text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm cursor-pointer disabled:opacity-50">
            <FiX className="w-4 h-4" /> Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-[20px] text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer disabled:opacity-70">
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <FiCheck className="w-4 h-4" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
        {saveError && (
          <div className="flex justify-center text-red-500 text-xs mt-2 font-medium">
            <FiAlertCircle className="w-4 h-4 mr-1.5" />
            {saveError}
          </div>
        )}
      </div>
    </PageShell>
  );
}