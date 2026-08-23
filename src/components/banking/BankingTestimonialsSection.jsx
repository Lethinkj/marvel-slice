import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import Reveal from '../ui/Reveal';
import { supabase } from '../../lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

export default function BankingTestimonialsSection() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['banking_testimonials', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banking_testimonials')
        .select('*')
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

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = testimonials.length;

  useEffect(() => {
    if (isPaused || total <= 1) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  if (total === 0) return null;

  function handlePrev() {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  function handleNext() {
    setActiveIndex((prev) => (prev + 1) % total);
  }

  const current = testimonials[activeIndex] || testimonials[0];

  return (
    <section className="relative py-14 sm:py-20 bg-slate-50/70 border-t border-[#E5ECF5] text-slate-800 overflow-hidden">
      {/* Soft Background Accents matching website theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-32 left-1/3 w-[450px] h-[450px] bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Website Header Style matching FAQ & Home sections */}
        <Reveal variant="up" className="text-center mb-12 sm:mb-16">
          <div className="inline-flex flex-col items-center">
            <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-dark-navy tracking-tight">
              Banking Candidate Testimonials
            </h2>
            <div className="mt-3 h-[3.5px] bg-brand-orange rounded-full w-4/5" />
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl mx-auto font-normal">
            Real feedback and success stories from aspirants who prepared for IBPS and banking examinations with us.
          </p>
        </Reveal>

        {/* Modern Testimonial Card Showcase */}
        <div
          className="max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative bg-white border border-[#E5ECF5] hover:border-brand-orange/40 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-lg hover:shadow-2xl hover:shadow-brand-blue/5 transition-all duration-300 overflow-hidden">
            {/* Subtle Gradient Accent Border Line on Top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-amber-500 to-brand-orange" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id || activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Exam Pill Badge, Achievement Tag & Stars */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {current.exam_name && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-blue-50 text-brand-blue border border-blue-200/80">
                        {current.exam_name}
                      </span>
                    )}
                    {current.badge_text && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-amber-50 text-brand-orange border border-amber-200/80">
                        {current.badge_text}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${i < (parseInt(current.rating, 10) || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quote Content */}
                <div className="relative pt-1">
                  <svg className="absolute -top-3 -left-2 text-brand-blue/10 w-12 h-12 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <blockquote className="relative z-10 text-slate-700 text-base sm:text-lg lg:text-xl font-normal leading-relaxed italic pl-3">
                    &ldquo;{current.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Candidate Info & Controls */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2px] bg-gradient-to-br from-brand-blue to-brand-orange shadow-sm">
                        {current.avatar_url ? (
                          <img
                            src={current.avatar_url}
                            alt={current.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-white text-brand-blue flex items-center justify-center font-bold text-base">
                            {(current.name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white p-0.5 rounded-full shadow-xs" title="Verified Candidate">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-dark-navy">
                        {current.name}
                      </h3>
                      {current.role && (
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                          {current.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Navigation Arrow Buttons */}
                  {total > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-700 transition-all duration-200 cursor-pointer border border-slate-200 active:scale-95"
                        aria-label="Previous testimonial"
                      >
                        <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-brand-orange hover:text-white text-slate-700 transition-all duration-200 cursor-pointer border border-slate-200 active:scale-95"
                        aria-label="Next testimonial"
                      >
                        <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Indicators */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((t, idx) => (
                <button
                  key={t.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? 'w-7 bg-brand-orange shadow-xs'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
