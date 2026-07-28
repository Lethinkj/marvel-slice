import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import SaveBar from '../components/SaveBar';
import useDirty from '../hooks/useDirty';
import PageShell from '../components/ui/PageShell';
import ImageUploader from '../components/ImageUploader';
import SectionAccordion from '../components/ui/SectionAccordion';

export default function BlogPageEditor() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [heroImage, setHeroImage] = useState('');
  const [heading, setHeading] = useState('Latest Articles & News');
  const [subheading, setSubheading] = useState('Insights, tutorials, and stories from the Marvel Slice team');

  const { dirty, reset } = useDirty([heroImage, heading, subheading], loading);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      if (data) {
        setSettingsId(data.id);
        if (data.blog_hero_image) setHeroImage(data.blog_hero_image);
        if (data.blog_heading) setHeading(data.blog_heading);
        if (data.blog_subheading) setSubheading(data.blog_subheading);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      blog_hero_image: heroImage || null,
      blog_heading: heading,
      blog_subheading: subheading,
    };
    if (settingsId) {
      await supabase.from('site_settings').update(payload).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('site_settings').insert(payload).select('id').single();
      if (data) setSettingsId(data.id);
    }
    setSaving(false);
    setSaved(true);
    reset();
    queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-admin-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <PageShell title="Blog Page">
      <SaveBar saving={saving} saved={saved} onSave={handleSave} label="Blog Page" top />
      <form onSubmit={handleSave} className="space-y-6">
        <SectionAccordion title="Hero Section" defaultExpanded={true}>
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Heading</label>
                <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all"
                  placeholder="Latest Articles & News" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Subheading</label>
                <input type="text" value={subheading} onChange={(e) => setSubheading(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all"
                  placeholder="Insights, tutorials, and stories from the Marvel Slice team" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Hero Image</label>
              <ImageUploader value={heroImage} onChange={(url) => setHeroImage(url)} />
            </div>
          </div>
        </SectionAccordion>
        <SaveBar saving={saving} saved={saved} onSave={handleSave} label="Blog Page" dirty={dirty} onDiscard={() => window.location.reload()} />
      </form>
    </PageShell>
  );
}