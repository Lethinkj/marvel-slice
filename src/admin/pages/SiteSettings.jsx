import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiSave, FiUpload, FiTrash2, FiCheck, FiMail, FiPhone, FiGlobe } from 'react-icons/fi';

function ImageUploader({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `site/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('pages').upload(path, file);
    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
          placeholder="Paste image URL or upload..." />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-colors">
          {uploading ? (
            <span className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiUpload className="w-4 h-4" />
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && (
        <div className="mt-2 relative group rounded-lg overflow-hidden border border-gray-200">
          <img src={value} alt="" className="h-32 w-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SiteSettings() {
  const [form, setForm] = useState({
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettingsId(data.id);
          const social = data.social_links || {};
          setForm({
            logo_url: data.logo_url || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            twitter: social.twitter || '',
            facebook: social.facebook || '',
            instagram: social.instagram || '',
            linkedin: social.linkedin || '',
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      logo_url: form.logo_url || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      social_links: {
        twitter: form.twitter || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        linkedin: form.linkedin || null,
      },
      updated_at: new Date().toISOString(),
    };
    if (settingsId) {
      await supabase.from('site_settings').update(payload).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('site_settings').insert(payload).select().single();
      if (data) setSettingsId(data.id);
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
        <h1 className="text-2xl font-bold text-dark-navy">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Contact info, social links, and logo</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <FiCheck className="w-4 h-4" /> Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <ImageUploader value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} label="Site Logo" />
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FiMail className="w-4 h-4 text-brand-accent" /> Contact Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                placeholder="sales@marvelslice.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                  placeholder="+91 6380957390" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FiGlobe className="w-4 h-4 text-brand-accent" /> Social Links
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'twitter', label: 'Twitter URL', placeholder: 'https://twitter.com/...' },
              { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
              { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
              { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/...' },
            ].map((s) => (
              <div key={s.key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">{s.label}</label>
                <input type="url" value={form[s.key]} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                  placeholder={s.placeholder} />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <Button type="submit" disabled={saving} variant="accent" size="md">
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
