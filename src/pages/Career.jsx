import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import Reveal from '../components/ui/Reveal';
import {
  FiMapPin, FiClock, FiDollarSign,
  FiUpload, FiSend, FiCheck, FiAlertCircle, FiX, FiSearch,
} from 'react-icons/fi';

function getFieldConfig(formConfig, key, defaults) {
  return { ...defaults, ...(formConfig?.fields?.[key] || {}) };
}

async function uploadWithRetry(bucket, path, file, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (!error) return { error: null };
    if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    else return { error };
  }
  return { error: new Error('Upload failed after retries') };
}

async function compressImage(file, maxWidth = 1920, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Compression failed'));
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{error}</p>}
    </div>
  );
}

export default function Career() {
  const formRef = useRef(null);
  const jobsRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    category: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [jobPage, setJobPage] = useState(1);
  const JOBS_PER_PAGE = 10;

  const { data: pageContent, isLoading: pageLoading } = useQuery({
    queryKey: ['career-page-content'],
    queryFn: async () => {
      const { data } = await supabase
        .from('career_page_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) return data;

      const { data: navItems } = await supabase
        .from('nav_items')
        .select('id')
        .eq('path', '/career')
        .eq('is_active', true)
        .order('id')
        .limit(1);
      const navItem = navItems?.[0] || null;
      if (!navItem?.id) return {};

      const { data: pages } = await supabase
        .from('nav_pages')
        .select('*')
        .eq('nav_item_id', navItem.id)
        .eq('is_published', true)
        .order('id')
        .limit(1);
      const page = pages?.[0] || null;
      if (!page) return {};

      const secs = page.sections || [];
      const cult = secs.find(s => s.section_type === 'text');
      const ben = secs.find(s => s.section_type === 'features');

      return {
        hero_heading: page.heading || '',
        hero_subheading: page.subheading || '',
        hero_image: page.hero_image || '',
        culture: cult?.content || '',
        culture_heading: 'Company Culture',
        benefits: ben?.items || [],
        benefits_heading: 'Benefits & Perks',
        section1_heading: 'We\'re Hiring',
        section2_heading: 'Job Openings',
        form_config: page.form_config || {},
      };
    },
  });

  const { data: roleCategories, isLoading: catsLoading } = useQuery({
    queryKey: ['role-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('role_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      return data || [];
    },
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['job-openings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_openings')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const isLoading = pageLoading || catsLoading || jobsLoading;
  const fc = pageContent?.form_config || {};
  const formEnabled = fc.enabled !== false;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    function field(name, d) {
      return { ...d, ...(fc.fields?.[name] || {}) };
    }
    const errs = {};
    const fName = field('full_name', { required: true });
    const fEmail = field('email', { required: true });
    const fPhone = field('phone', { required: true });
    const fDept = field('department', { required: false });
    const fCat = field('category', { required: false });
    const fDesc = field('description', { required: false });

    if (fName.required !== false && !form.full_name.trim()) errs.full_name = `${fName.label || 'Full name'} is required`;
    if (fEmail.required !== false) {
      if (!form.email.trim()) errs.email = `${fEmail.label || 'Email'} is required`;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    }
    if (fPhone.required !== false) {
      if (!form.phone.trim()) errs.phone = `${fPhone.label || 'Phone'} is required`;
      else if (!/^[\d\s+\-()]{7,20}$/.test(form.phone)) errs.phone = 'Invalid phone number';
    }
    if (fDept.required === true && !form.department) errs.department = `Please select a ${(fDept.label || 'department').toLowerCase()}`;
    if (fCat.required === true && !form.category) errs.category = `Please select a ${(fCat.label || 'category').toLowerCase()}`;
    if (fDesc.required === true && !form.description.trim()) errs.description = `${fDesc.label || 'Description'} is required`;
    if (file) {
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowed.includes(file.type)) errs.file = 'Only PDF, DOC, DOCX, JPG, PNG files are allowed';
      if (file.size > 10 * 1024 * 1024) errs.file = 'File must be under 10 MB';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setStatus(null);

    let file_url = '';

    if (file) {
      setUploading(true);
      let uploadFile = file;
      const isImage = ['image/jpeg', 'image/png'].includes(file.type);
      if (isImage) {
        try {
          uploadFile = await compressImage(file);
        } catch { }
      }
      const ext = uploadFile.name.split('.').pop();
      const path = `career/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await uploadWithRetry('career-uploads', path, uploadFile);
      if (uploadError) {
        setStatus({ type: 'error', message: `Upload failed: ${uploadError.message || 'Please try again.'}` });
        setUploading(false);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('career-uploads').getPublicUrl(path);
      file_url = urlData.publicUrl;
      setUploading(false);
    }

    const { error: insertError } = await supabase
      .from('career_submissions')
      .insert({ full_name: form.full_name, email: form.email, phone: form.phone, department: form.department, category: form.category, description: form.description, file_url });

    if (insertError) {
      setStatus({ type: 'error', message: 'Failed to save submission. Please try again.' });
      setSubmitting(false);
      return;
    }

    fetch('/api/submit-career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, file_url }),
    }).catch(() => {});

    setStatus({ type: 'success', message: 'Application submitted successfully! We will get back to you soon.' });
    setForm({ full_name: '', email: '', phone: '', department: '', category: '', description: '' });
    setFile(null);
    if (formRef.current) formRef.current.reset();
    setSubmitting(false);
  }

  function renderForm() {
    if (!formEnabled) return null;
    const ctaCfg = fc.cta || {};
    const ctaText = ctaCfg.text || 'Submit Application';
    const ctaVariant = ctaCfg.variant || 'accent';

    const fieldDefs = {
      full_name: { type: 'text', ...getFieldConfig(fc, 'full_name', { label: 'Full Name', enabled: true, required: true, placeholder: 'John Doe' }) },
      email: { type: 'email', ...getFieldConfig(fc, 'email', { label: 'Email Address', enabled: true, required: true, placeholder: 'john@example.com' }) },
      phone: { type: 'tel', ...getFieldConfig(fc, 'phone', { label: 'Phone Number', enabled: true, required: true, placeholder: '+1 234 567 890' }) },
      department: { type: 'select', ...getFieldConfig(fc, 'department', { label: 'Department', enabled: true, required: false, placeholder: 'Select department', options: ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Design', 'Content', 'Other'] }) },
      category: { type: 'select', ...getFieldConfig(fc, 'category', { label: 'Category', enabled: true, required: false, placeholder: 'Select category', options: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'] }) },
      description: { type: 'textarea', ...getFieldConfig(fc, 'description', { label: 'Description', enabled: true, required: false, placeholder: 'Tell us about yourself...' }) },
      file_upload: { type: 'file', ...getFieldConfig(fc, 'file_upload', { label: 'Upload Resume / Documents', enabled: true, required: false }) },
    };

    return (
      <div className="p-6 sm:p-8">
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${
              status.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {status.type === 'success' ? <FiCheck className="w-5 h-5 shrink-0 mt-0.5" /> : <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <span className="flex-1">{status.message}</span>
            <button onClick={() => setStatus(null)} className="p-1 hover:opacity-70 rounded transition-opacity">
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {fieldDefs.full_name.enabled !== false && (
              <Field label={fieldDefs.full_name.label} required={fieldDefs.full_name.required !== false} error={errors.full_name}>
                <input name="full_name" value={form.full_name} onChange={handleChange}
                  className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-brand-accent/30 ${
                    errors.full_name ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-brand-accent'
                  }`} placeholder={fieldDefs.full_name.placeholder} />
              </Field>
            )}
            {fieldDefs.email.enabled !== false && (
              <Field label={fieldDefs.email.label} required={fieldDefs.email.required !== false} error={errors.email}>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-brand-accent/30 ${
                    errors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-brand-accent'
                  }`} placeholder={fieldDefs.email.placeholder} />
              </Field>
            )}
          </div>

          {fieldDefs.phone.enabled !== false && (
            <Field label={fieldDefs.phone.label} required={fieldDefs.phone.required !== false} error={errors.phone}>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-brand-accent/30 ${
                  errors.phone ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-brand-accent'
                }`} placeholder={fieldDefs.phone.placeholder} />
            </Field>
          )}

          {(fieldDefs.department.enabled !== false || fieldDefs.category.enabled !== false) && (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {fieldDefs.department.enabled !== false && (
                <Field label={fieldDefs.department.label} required={fieldDefs.department.required === true} error={errors.department}>
                  <div className="relative">
                    <select name="department" value={form.department} onChange={handleChange}
                      className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-brand-accent/30 appearance-none bg-white ${
                        errors.department ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-brand-accent'
                      } ${!form.department ? 'text-gray-400' : ''}`}>
                      <option value="" disabled>{fieldDefs.department.placeholder}</option>
                      {(fieldDefs.department.options || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </Field>
              )}
              {fieldDefs.category.enabled !== false && (
                <Field label={fieldDefs.category.label} required={fieldDefs.category.required === true} error={errors.category}>
                  <div className="relative">
                    <select name="category" value={form.category} onChange={handleChange}
                      className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-brand-accent/30 appearance-none bg-white ${
                        errors.category ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-brand-accent'
                      } ${!form.category ? 'text-gray-400' : ''}`}>
                      <option value="" disabled>{fieldDefs.category.placeholder}</option>
                      {(fieldDefs.category.options || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </Field>
              )}
            </div>
          )}

          {fieldDefs.description.enabled !== false && (
            <Field label={fieldDefs.description.label} required={fieldDefs.description.required === true} error={errors.description}>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-brand-accent/30 resize-y ${
                  errors.description ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-brand-accent'
                }`} placeholder={fieldDefs.description.placeholder} />
            </Field>
          )}

          {fieldDefs.file_upload.enabled !== false && (
            <Field label={fieldDefs.file_upload.label} required={fieldDefs.file_upload.required === true} error={errors.file}>
              <label className={`relative flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                errors.file ? 'border-red-300 bg-red-50/50' : 'border-gray-300 hover:border-brand-accent hover:bg-brand-accent/5'
              }`}>
                <FiUpload className={`w-8 h-8 ${errors.file ? 'text-red-400' : 'text-gray-300'}`} />
                <div className="text-sm text-center">
                  {file ? (
                    <span className="font-medium text-brand-accent">{file.name}</span>
                  ) : (
                    <>
                      <span className="text-gray-700 font-medium">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10 MB)</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                  if (errors.file) setErrors(prev => ({ ...prev, file: '' }));
                }} className="hidden" />
                {file && (
                  <button type="button" onClick={() => { setFile(null); if (formRef.current) formRef.current.querySelector('input[type="file"]').value = ''; }}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </label>
            </Field>
          )}

          <div className="pt-2">
            <button type="submit" disabled={submitting || uploading}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                ctaVariant === 'primary'
                  ? 'bg-dark-navy text-white hover:bg-dark-navy/90 focus:ring-dark-navy/30'
                  : ctaVariant === 'outline'
                    ? 'border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white focus:ring-brand-accent/30'
                    : 'bg-brand-accent text-white hover:bg-brand-accent/90 focus:ring-brand-accent/30'
              }`}>
              {uploading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Uploading...</>
              ) : submitting ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Submitting...</>
              ) : (
                <><FiSend className="w-4 h-4" /> {ctaText}</>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {pageContent?.hero_image && (
        <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 w-full overflow-hidden">
          <img src={pageContent.hero_image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          {(pageContent.hero_heading || pageContent.hero_subheading) && (
            <div className="absolute inset-0 flex items-end">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 lg:pb-10">
                {pageContent.hero_heading && <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white">{pageContent.hero_heading}</h1>}
                {pageContent.hero_subheading && <p className="text-sm sm:text-base text-white/80 mt-1.5 max-w-2xl">{pageContent.hero_subheading}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {pageContent?.culture && (
        <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{pageContent.culture_heading || 'Company Culture'}</h2>
          <div className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{pageContent.culture}</div>
        </Reveal>
      )}

      {pageContent?.benefits?.length > 0 && (
        <div className="bg-gray-50/50">
          <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">{pageContent.benefits_heading || 'Benefits & Perks'}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pageContent.benefits.map((item, i) => (
                <Reveal key={i} className="flex items-start gap-3 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-brand-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{typeof item === 'string' ? item : item.title}</p>
                    {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      )}

      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {pageContent?.section1_heading && <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{pageContent.section1_heading}</h2>}
        {pageContent?.section1_subheading && <p className="text-gray-500 mb-1">{pageContent.section1_subheading}</p>}
        {pageContent?.section1_description && <p className="text-gray-400 text-sm mb-8 max-w-3xl">{pageContent.section1_description}</p>}

        {roleCategories?.length > 0 ? (
          <div>
            <div className="flex flex-wrap gap-3">
              {(showAllCategories ? roleCategories : roleCategories.slice(0, 15)).map((cat, i) => (
                <div key={cat.id}
                  className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-900">
                  <span className="text-sm font-semibold">{cat.name}</span>
                </div>
              ))}
            </div>
            {roleCategories.length > 15 && (
              <button onClick={() => setShowAllCategories(prev => !prev)}
                className="mt-4 text-sm font-medium text-brand-accent hover:underline inline-flex items-center gap-1">
                {showAllCategories ? 'Show less' : `View all (${roleCategories.length})`}
                <svg className={`w-4 h-4 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No role categories available right now.</p>
          </div>
        )}
      </Reveal>

      <div ref={jobsRef} className="bg-gray-50/50">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              {pageContent?.section2_heading && <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageContent.section2_heading}</h2>}
              {pageContent?.section2_subheading && <p className="text-gray-500 mt-1">{pageContent.section2_subheading}</p>}
            </div>
          </div>

          {jobs?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.slice((jobPage - 1) * JOBS_PER_PAGE, jobPage * JOBS_PER_PAGE).map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                  >
                    <h3 className="text-lg font-bold text-brand-accent mb-3">{job.title}</h3>
                    {(job.experience || job.salary) && (
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                        {job.experience && <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" />{job.experience}</span>}
                        {job.salary && <span className="flex items-center gap-1"><FiDollarSign className="w-3.5 h-3.5" />{job.salary}</span>}
                      </div>
                    )}
                    {job.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{job.description}</p>
                    )}
                    <div className="mt-auto">
                      {job.location && (
                        <p className="text-sm text-gray-400 flex items-center gap-1 mb-4"><FiMapPin className="w-3.5 h-3.5 shrink-0" />{job.location}</p>
                      )}
                      <button onClick={() => setShowForm(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors cursor-pointer">
                        Apply Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              {jobs.length > JOBS_PER_PAGE && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setJobPage(p => Math.max(1, p - 1))} disabled={jobPage === 1}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(jobs.length / JOBS_PER_PAGE) }, (_, i) => (
                    <button key={i} onClick={() => setJobPage(i + 1)}
                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                        jobPage === i + 1
                          ? 'bg-brand-accent text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setJobPage(p => Math.min(Math.ceil(jobs.length / JOBS_PER_PAGE), p + 1))} disabled={jobPage === Math.ceil(jobs.length / JOBS_PER_PAGE)}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <FiSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No openings right now — check back soon!</p>
            </div>
          )}
        </Reveal>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100 rounded-t-2xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Apply Now</h2>
                <p className="text-sm text-gray-500 mt-0.5">We'll get back to you within 48 hours</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0" aria-label="Close">
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {renderForm()}
          </motion.div>
        </div>
      )}
    </div>
  );
}
