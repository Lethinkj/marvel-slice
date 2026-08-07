import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiArrowRight, FiLoader, FiX, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Reveal from '../ui/Reveal';
import { supabase } from '../../lib/supabaseClient';
import { trackRegister } from '../../lib/analytics';
import { formatDateTime } from '../../lib/datetime';

export default function UpcomingClassesSection({ section }) {
  const queryClient = useQueryClient();
  const { data: classes = [] } = useQuery({
    queryKey: ['upcomingClasses', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upcoming_classes')
        .select('id, course_name, date_time, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return data || [];
    },
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const isSlider = classes.length > 3;
  const visible = isSlider ? 3 : classes.length;
  const pages = Math.ceil(classes.length / visible);
  const page = isSlider ? Math.min(index, pages - 1) : 0;
  const pageClasses = isSlider ? classes.slice(page * visible, page * visible + visible) : classes;

  useEffect(() => {
    if (!isSlider) {
      setIndex(0);
      return undefined;
    }
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % pages);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [isSlider, pages]);

  useEffect(() => {
    setIndex(0);
  }, [classes.length, isSlider]);

  function go(dir) {
    setIndex((prev) => (prev + dir + pages) % pages);
  }

  if (!section) return null;

  const heading = section.heading || '';
  const subheading = section.subheading || '';

  if (!heading && classes.length === 0) return null;

  function closeModal() {
    if (submitting) return;
    setSelectedClass(null);
    setFormName(''); setFormEmail(''); setFormPhone('');
    setErrors({});
    setShowSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedClass?.id) {
      setErrors({ form: 'Invalid class. Please refresh the page and try again.' });
      return;
    }
    const errs = {};
    if (!formName.trim()) errs.name = 'Please enter your name';
    if (!formEmail.trim()) errs.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) errs.email = 'Please enter a valid email';
    if (!formPhone.trim()) errs.phone = 'Please enter your phone number';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    const { error } = await supabase.from('upcoming_class_registrations').insert({
      upcoming_class_id: selectedClass.id,
      course_name: selectedClass.course_name,
      full_name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
    });
    if (error) {
      console.error('Registration insert failed:', error);
      setErrors({ form: 'Submission failed. Please try again.' });
      setSubmitting(false);
      return;
    }
    trackRegister(selectedClass.course_name);
    queryClient.invalidateQueries({ queryKey: ['upcomingClassRegistrations'] });
    setSubmitting(false);
    setShowSuccess(true);
    setFormName(''); setFormEmail(''); setFormPhone('');
    setErrors({});
  }

  return (
    <section className="py-16 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            {heading && (
              <h2 className="font-bold text-2xl sm:text-3xl text-dark-navy mb-3">{heading}</h2>
            )}
            <div className="w-4/5 max-w-xs h-[3px] bg-brand-orange mx-auto mb-5" />
            {subheading && (
              <p className="text-text-gray text-base sm:text-lg leading-relaxed mb-10">{subheading}</p>
            )}
          </div>
        </Reveal>

        {classes.length > 0 && (
          isSlider ? (
            <div className="relative ml-auto lg:max-w-[80%]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300">
                {pageClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
                        <FiCalendar className="w-5 h-5 text-brand-orange" />
                      </div>
                      <h4 className="font-bold text-dark-navy text-lg">{cls.course_name}</h4>
                    </div>
                    {cls.date_time && (
                      <p className="flex items-center gap-2 text-text-gray text-xs mt-2">
                        <FiClock className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
                        <span>{formatDateTime(cls.date_time)}</span>
                      </p>
                    )}
                    <div className="mt-auto pt-4 flex justify-end">
                      <button
                        onClick={() => setSelectedClass(cls)}
                        className="inline-flex items-center justify-center gap-1.5 bg-brand-green text-white text-xs font-semibold py-1.5 px-3 rounded-full hover:brightness-90 transition-colors"
                      >
                        Register Now <FiArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                aria-label="Previous classes"
                onClick={() => go(-1)}
                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-text-gray hover:text-brand-orange hover:border-brand-orange/40 transition-colors cursor-pointer"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next classes"
                onClick={() => go(1)}
                className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-text-gray hover:text-brand-orange hover:border-brand-orange/40 transition-colors cursor-pointer"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to class page ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${i === page ? 'w-6 bg-brand-orange' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-auto lg:max-w-[80%]">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
                      <FiCalendar className="w-5 h-5 text-brand-orange" />
                    </div>
                    <h4 className="font-bold text-dark-navy text-lg">{cls.course_name}</h4>
                  </div>
                  {cls.date_time && (
                    <p className="flex items-center gap-2 text-text-gray text-xs mt-2">
                      <FiClock className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
                      <span>{formatDateTime(cls.date_time)}</span>
                    </p>
                  )}
                  <div className="mt-auto pt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="inline-flex items-center justify-center gap-1.5 bg-brand-green text-white text-xs font-semibold py-1.5 px-3 rounded-full hover:brightness-90 transition-colors"
                    >
                      Register Now <FiArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Register Popup */}
      <AnimatePresence>
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              {showSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Registration Successful!</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                    Thank you for registering for {selectedClass.course_name}. We will reach out to you shortly.
                  </p>
                  <button
                    onClick={closeModal}
                    className="w-full py-3 rounded-lg bg-[#1E56C7] text-white font-semibold text-sm hover:bg-[#1642a0] transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange mb-1">Upcoming Class</p>
                    <h3 className="text-lg font-bold text-[#1A1A2E]">{selectedClass.course_name}</h3>
                    {selectedClass.date_time && (
                      <p className="flex items-center gap-2 text-text-gray text-xs mt-1">
                        <FiClock className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
                        <span>{formatDateTime(selectedClass.date_time)}</span>
                      </p>
                    )}
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-3">
                    <div>
                      <input type="text" placeholder="Your Name" value={formName} onChange={(e) => { setFormName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }} required
                        className={`w-full px-4 py-2.5 border text-xs bg-white rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-brand-blue/30 transition-all ${errors.name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-brand-blue'}`} />
                      {errors.name && <p className="!text-red-600 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <input type="email" placeholder="your@email.com" value={formEmail} onChange={(e) => { setFormEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }} required
                        className={`w-full px-4 py-2.5 border text-xs bg-white rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-brand-blue/30 transition-all ${errors.email ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-brand-blue'}`} />
                      {errors.email && <p className="!text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <input type="tel" placeholder="Your Phone Number" value={formPhone} onChange={(e) => { setFormPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }} required
                        className={`w-full px-4 py-2.5 border text-xs bg-white rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-brand-blue/30 transition-all ${errors.phone ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-brand-blue'}`} />
                      {errors.phone && <p className="!text-red-600 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    {errors.form && <p className="!text-red-600 text-xs">{errors.form}</p>}
                    <button type="submit" disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-brand-orange text-white font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-70 text-sm">
                      {submitting ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
                      {submitting ? 'Submitting...' : 'Confirm Registration'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
