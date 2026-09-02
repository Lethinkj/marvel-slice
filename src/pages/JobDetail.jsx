import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { trackFormSubmit, trackDownload } from '../lib/analytics';
import Reveal from '../components/ui/Reveal';
import {
  FiArrowLeft, FiBriefcase, FiSend,
  FiCheck, FiAlertCircle, FiX, FiUpload, FiArrowRight
} from 'react-icons/fi';

async function uploadWithRetry(bucket, path, file, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (!error) return { error: null };
    if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    else return { error };
  }
  return { error: new Error('Upload failed after retries') };
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs !text-red-500 mt-1.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default function JobDetail() {
  const { type, id } = useParams();
  const formRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    category: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job-detail', type, id],
    queryFn: async () => {
      const isIntern = type === 'intern';
      const tableName = isIntern ? 'internships' : 'job_openings';

      let query = supabase.from(tableName).select('*').eq('id', id).single();
      const { data, error: fetchErr } = await query;

      if (fetchErr && !isIntern) {
        const { data: internData } = await supabase.from('internships').select('*').eq('id', id).maybeSingle();
        if (internData) return { ...internData, _type: 'intern' };
      }

      if (data) return { ...data, _type: isIntern ? 'intern' : 'job' };
      return null;
    },
  });

  const isIntern = job?._type === 'intern';
  const empType = job?.type || job?.department || (isIntern ? 'Internship' : 'Job');
  const salaryVal = job?.salary || job?.stipend;
  const expVal = job?.experience || job?.duration;
  const locVal = job?.location;

  function openApplyModal() {
    if (job) {
      if (job.apply_url?.trim()) {
        window.open(job.apply_url.trim(), '_blank', 'noopener,noreferrer');
        return;
      }
      setForm(prev => ({
        ...prev,
        position: job.title || '',
        category: isIntern ? 'Internship' : (job.type || 'Full-time'),
      }));
      setShowForm(true);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[\d\s+\-()]{7,20}$/.test(form.phone)) errs.phone = 'Invalid phone number';
    if (!form.position.trim()) errs.position = 'Position is required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!agreeTerms) errs.agree = 'Please agree to the terms and conditions';
    if (!file) errs.file = 'Resume is required';
    else {
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
      const ext = file.name.split('.').pop();
      const path = `career/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await uploadWithRetry('career-uploads', path, file);
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
      .insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        department: form.position,
        category: form.category,
        description: form.description,
        file_url
      });

    if (insertError) {
      console.error('Career submission insert error:', insertError);
    }

    fetch('/api/submit-career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, file_url }),
    }).catch(() => {});

    trackFormSubmit('career');
    if (file_url) trackDownload('career_resume');
    setStatus({ type: 'success', message: 'Application submitted successfully! We will get back to you soon.' });
    setAgreeTerms(false);
    setSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-6 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-96 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-12 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!job || error) {
    return (
      <div className="bg-slate-50 min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center mx-auto mb-4 border border-orange-200/50">
            <FiBriefcase className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-navy mb-3">Job Opening Not Found</h1>
          <p className="text-slate-600 mb-8 text-sm sm:text-base">The position you are looking for is no longer active or does not exist.</p>
          <Link to="/career" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:underline">
            <FiArrowLeft className="w-4 h-4" /> Back to All Openings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BACK NAVIGATION */}
        <Reveal className="mb-7">
          <Link
            to="/career"
            className="group inline-flex items-center gap-2 text-brand-blue hover:text-blue-700 font-semibold text-sm transition-all cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Openings</span>
          </Link>
        </Reveal>

        {/* SINGLE CONTINUOUS JOB POSTING CONTENT */}
        <Reveal>
          <div className="py-2 sm:py-4">
            
            {/* 1. JOB TITLE */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-dark-navy tracking-tight leading-tight">
                {job.title}
              </h1>
            </div>

            {/* 2. DESCRIPTION */}
            <div className="mt-6 sm:mt-8 text-slate-700 text-base sm:text-[17px] leading-[1.75] whitespace-pre-line max-w-[900px]">
              {job.description || 'Please apply below to submit your resume and details for this opening.'}
            </div>

            {/* 3. JOB DETAILS TABLE VIEW & APPLICATION ACTION */}
            <div className="max-w-2xl mt-10 sm:mt-12">
              {(empType || expVal || locVal || salaryVal || job.department) && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-left text-sm sm:text-base border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      {empType && (
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-500 bg-slate-50/60 w-2/5 sm:w-1/3">
                            Job Type
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-800">
                            {empType}
                          </td>
                        </tr>
                      )}
                      {expVal && (
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-500 bg-slate-50/60">
                            Experience Required
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-800">
                            {expVal}
                          </td>
                        </tr>
                      )}
                      {locVal && (
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-500 bg-slate-50/60">
                            Location
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-800">
                            {locVal}
                          </td>
                        </tr>
                      )}
                      {salaryVal && (
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-500 bg-slate-50/60">
                            Salary / Stipend
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-800">
                            {salaryVal.startsWith('₹') ? salaryVal : `₹${salaryVal}`}
                          </td>
                        </tr>
                      )}
                      {job.department && (
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-500 bg-slate-50/60">
                            Department
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-800">
                            {job.department}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Apply Button directly below the table */}
              <div className="mt-6 flex items-center justify-end">
                <button
                  type="button"
                  onClick={openApplyModal}
                  className="group/btn inline-flex items-center justify-center gap-2 bg-brand-orange text-white font-bold text-sm py-2.5 px-6 rounded-full hover:bg-brand-orange/90 hover:shadow-md hover:shadow-brand-orange/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Apply Now</span>
                  <FiArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-200 shrink-0" />
                </button>
              </div>
            </div>

          </div>
        </Reveal>

      </div>

      {/* Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-brand-blue px-6 py-4 text-white relative">
              <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 bg-white shadow-md text-slate-600 hover:text-slate-800 p-1.5 rounded-full transition-all cursor-pointer border border-slate-200 z-10" aria-label="Close">
                <FiX className="w-4 h-4" />
              </button>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-medium text-white/90 mt-1 border border-white/10">
                Applying for: <span className="font-semibold">{job.title}</span>
              </span>
            </div>

            {status?.type === 'success' ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Application Submitted!</h3>
                <p className="text-sm text-slate-500 mb-6">{status.message}</p>
                <button onClick={() => setShowForm(false)} className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm cursor-pointer">
                  Close
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate>
                {status && (
                  <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-lg flex items-start gap-3 text-sm bg-red-50 border border-red-200 text-red-700">
                    <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="flex-1">{status.message}</span>
                    <button type="button" onClick={() => setStatus(null)} className="p-1 hover:opacity-70 rounded transition-opacity cursor-pointer">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 sm:p-8">
                  <Field label="Full Name" required error={errors.full_name}>
                    <input name="full_name" value={form.full_name} onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition-all outline-none placeholder:text-slate-400 ${errors.full_name ? 'border-red-300' : 'border-slate-200'}`} placeholder="John Doe" />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition-all outline-none placeholder:text-slate-400 ${errors.email ? 'border-red-300' : 'border-slate-200'}`} placeholder="john@example.com" />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition-all outline-none placeholder:text-slate-400 ${errors.phone ? 'border-red-300' : 'border-slate-200'}`} placeholder="+1 234 567 890" />
                  </Field>
                  <Field label="Position" required error={errors.position}>
                    <input name="position" value={form.position} readOnly
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 text-sm cursor-not-allowed" />
                  </Field>
                  <Field label="Category" required error={errors.category}>
                    <input name="category" value={form.category} readOnly
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 text-sm cursor-not-allowed" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Description" required error={errors.description}>
                      <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition-all outline-none placeholder:text-slate-400 resize-y ${errors.description ? 'border-red-300' : 'border-slate-200'}`} placeholder="Tell us about yourself..." />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Upload Resume" required error={errors.file}>
                      <label className={`relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${errors.file ? 'border-red-300 bg-red-50/50' : 'border-brand-blue/40 hover:border-brand-blue bg-blue-50/40 hover:bg-blue-50/80'}`}>
                        <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <FiUpload className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          {file ? (
                            <span className="text-sm font-semibold text-brand-blue">{file.name}</span>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                              <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX (max 10MB)</p>
                            </>
                          )}
                        </div>
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => {
                          const f = e.target.files?.[0];
                          setFile(f || null);
                          if (errors.file) setErrors(prev => ({ ...prev, file: '' }));
                        }} className="hidden" />
                      </label>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={agreeTerms} onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (errors.agree) setErrors(prev => ({ ...prev, agree: '' }));
                      }} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20" />
                      <span className="text-sm text-slate-600 leading-relaxed">
                        I agree to the{' '}
                        <a href="/terms" className="underline hover:opacity-80 text-brand-blue">Terms of Use</a>
                        {' '}and{' '}
                        <a href="/privacy" className="underline hover:opacity-80 text-brand-blue">Privacy Policy</a>.
                      </span>
                    </label>
                    {errors.agree && <p className="text-xs text-red-500 mt-1">{errors.agree}</p>}
                  </div>
                  <div className="sm:col-span-2 pt-1">
                    <button type="submit" disabled={submitting || uploading}
                      className="w-fit mx-auto bg-brand-blue hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                      {uploading ? 'Uploading...' : submitting ? 'Submitting...' : <><FiSend className="w-4 h-4" /> Submit Application</>}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
