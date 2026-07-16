import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import {
  FiCheckCircle, FiMapPin, FiBriefcase,
  FiUpload, FiSend, FiCheck, FiAlertCircle, FiX,
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

function SectionRenderer({ section }) {
  switch (section.section_type) {
    case 'text':
      return (
        <Reveal className="max-w-3xl mx-auto">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-4">{section.heading}</h2>}
          {section.content && <div className="text-text-gray text-base leading-relaxed whitespace-pre-line">{section.content}</div>}
        </Reveal>
      );
    case 'features':
      return (
        <div className="max-w-3xl mx-auto">
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</Reveal>}
          <div className="grid sm:grid-cols-2 gap-4">
            {(section.items || []).map((item, i) => (
              <Reveal key={i} className="flex items-start gap-3 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <FiCheckCircle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-dark-navy text-sm">{typeof item === 'string' ? item : item.title}</p>
                  {item.description && <p className="text-text-gray text-sm mt-1">{item.description}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      );
    case 'positions':
      return (
        <div>
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-8 text-center">{section.heading}</Reveal>}
          <div className="max-w-4xl mx-auto space-y-4">
            {(section.items || []).map((pos, i) => (
              <Reveal key={i}>
                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-dark-navy text-lg">{pos.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-text-gray">
                      {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{pos.location}</span>}
                      {pos.type && <span className="flex items-center gap-1"><FiBriefcase className="w-3.5 h-3.5" />{pos.type}</span>}
                    </div>
                    {pos.description && <p className="text-sm text-text-gray mt-3">{pos.description}</p>}
                  </div>
                  <a href="#career-form" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors shrink-0">
                    Apply Now
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function Career() {
  const formRef = useRef(null);
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

  const { data, isLoading } = useQuery({
    queryKey: ['careerPageData'],
    queryFn: async () => {
      const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, label')
        .eq('path', '/career')
        .eq('is_active', true)
        .order('id')
        .limit(1);
      const navItem = navItems?.[0] || null;
      if (!navItem) return null;

      const { data: pages } = await supabase
        .from('nav_pages')
        .select('*')
        .eq('nav_item_id', navItem.id)
        .eq('is_published', true)
        .order('id')
        .limit(1);

      return pages?.[0] || null;
    },
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const fc = data?.form_config || {};
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
        } catch {
          // fall back to original if compression fails
        }
      }
      const ext = uploadFile.name.split('.').pop();
      const path = `career/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await uploadWithRetry('career-uploads', path, uploadFile);
      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
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
      console.error('DB insert error:', insertError);
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

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const hasSections = data?.sections?.length > 0;
  const fc = data?.form_config || {};
  const formEnabled = fc.enabled !== false;
  const formPosition = fc.position || 'after';

  function renderForm() {
    if (!formEnabled) return null;
    const fHeadline = fc.headline || 'Apply Now';
    const fDesc = fc.description || "Fill out the form below and we'll get back to you.";
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

    const ctaStyles = {
      accent: 'bg-brand-accent text-white hover:bg-brand-accent/90 shadow-sm',
      primary: 'bg-dark-navy text-white hover:bg-dark-navy/90 shadow-sm',
      outline: 'border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white',
    };

    return (
      <section id="career-form" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Reveal>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-dark-navy mb-2">{fHeadline}</h2>
            <p className="text-text-gray mb-8">{fDesc}</p>

            {status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
                  status.type === 'success'
                    ? 'bg-brand-bright-blue/10 border border-brand-bright-blue/20 text-brand-bright-blue'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {status.type === 'success' ? <FiCheck className="w-5 h-5 shrink-0 mt-0.5" /> : <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <span>{status.message}</span>
                <button onClick={() => setStatus(null)} className="ml-auto p-1 hover:opacity-70">
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
              {fieldDefs.full_name.enabled !== false && fieldDefs.email.enabled !== false && (
                <div className="grid sm:grid-cols-2 gap-5">
                  {fieldDefs.full_name.enabled !== false && (
                    <Field label={fieldDefs.full_name.label} required={fieldDefs.full_name.required !== false} error={errors.full_name}>
                      <input name="full_name" value={form.full_name} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                          errors.full_name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-accent'
                        }`} placeholder={fieldDefs.full_name.placeholder} />
                    </Field>
                  )}
                  {fieldDefs.email.enabled !== false && (
                    <Field label={fieldDefs.email.label} required={fieldDefs.email.required !== false} error={errors.email}>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                          errors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-accent'
                        }`} placeholder={fieldDefs.email.placeholder} />
                    </Field>
                  )}
                </div>
              )}

              {(fieldDefs.full_name.enabled === false || fieldDefs.email.enabled === false) && (
                <>
                  {fieldDefs.full_name.enabled !== false && (
                    <Field label={fieldDefs.full_name.label} required={fieldDefs.full_name.required !== false} error={errors.full_name}>
                      <input name="full_name" value={form.full_name} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                          errors.full_name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-accent'
                        }`} placeholder={fieldDefs.full_name.placeholder} />
                    </Field>
                  )}
                  {fieldDefs.email.enabled !== false && (
                    <Field label={fieldDefs.email.label} required={fieldDefs.email.required !== false} error={errors.email}>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                          errors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-accent'
                        }`} placeholder={fieldDefs.email.placeholder} />
                    </Field>
                  )}
                </>
              )}

              {fieldDefs.phone.enabled !== false && (
                <Field label={fieldDefs.phone.label} required={fieldDefs.phone.required !== false} error={errors.phone}>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                      errors.phone ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-accent'
                    }`} placeholder={fieldDefs.phone.placeholder} />
                </Field>
              )}

              {(fieldDefs.department.enabled !== false || fieldDefs.category.enabled !== false) && (
                <div className="grid sm:grid-cols-2 gap-5">
                  {fieldDefs.department.enabled !== false && (
                    <Field label={fieldDefs.department.label} required={fieldDefs.department.required === true} error={errors.department}>
                      <select name="department" value={form.department} onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-colors bg-white">
                        <option value="">{fieldDefs.department.placeholder}</option>
                        {(fieldDefs.department.options || []).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </Field>
                  )}
                  {fieldDefs.category.enabled !== false && (
                    <Field label={fieldDefs.category.label} required={fieldDefs.category.required === true} error={errors.category}>
                      <select name="category" value={form.category} onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-colors bg-white">
                        <option value="">{fieldDefs.category.placeholder}</option>
                        {(fieldDefs.category.options || []).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  )}
                </div>
              )}

              {fieldDefs.description.enabled !== false && (
                <Field label={fieldDefs.description.label} required={fieldDefs.description.required === true} error={errors.description}>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-colors resize-y"
                    placeholder={fieldDefs.description.placeholder} />
                </Field>
              )}

              {fieldDefs.file_upload.enabled !== false && (
                <Field label={fieldDefs.file_upload.label} required={fieldDefs.file_upload.required === true} error={errors.file}>
                  <label className={`relative flex items-center justify-center gap-3 px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    errors.file ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-brand-accent hover:bg-brand-accent/5'
                  }`}>
                    <FiUpload className={`w-6 h-6 ${errors.file ? 'text-red-400' : 'text-gray-400'}`} />
                    <div className="text-sm">
                      {file ? (
                        <span className="font-medium text-brand-accent">{file.name}</span>
                      ) : (
                        <>
                          <span className="text-dark-navy font-medium">Click to upload</span>
                          <span className="text-text-gray"> or drag and drop</span>
                          <p className="text-xs text-text-gray mt-0.5">PDF, DOC, DOCX, JPG, PNG (max 10 MB)</p>
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
                        className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </label>
                </Field>
              )}

              <Button type="submit" disabled={submitting || uploading}
                className={`w-full sm:w-auto !px-8 !py-3 !rounded-xl !text-base !font-semibold ${ctaStyles[ctaVariant] || ctaStyles.accent}`}>
                {uploading ? (
                  <>Uploading...</>
                ) : submitting ? (
                  <>Submitting...</>
                ) : (
                  <><FiSend className="w-4 h-4" /> {ctaText}</>
                )}
              </Button>
            </form>
          </div>
        </Reveal>
      </section>
    );
  }

  return (
    <div>
      {data?.hero_image && (
        <div className="h-48 sm:h-72 lg:h-96 w-full overflow-hidden">
          <img src={data.hero_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {(data?.heading || data?.subheading) && (
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          {data?.heading && <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-navy mb-4">{data.heading}</h1>}
          {data?.subheading && <p className="text-base sm:text-lg text-text-gray max-w-2xl mx-auto">{data.subheading}</p>}
        </Reveal>
      )}

      {formPosition === 'before' && renderForm()}

      {hasSections && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12 sm:space-y-16">
          {data.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>
      )}

      {formPosition !== 'before' && renderForm()}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dark-navy mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
