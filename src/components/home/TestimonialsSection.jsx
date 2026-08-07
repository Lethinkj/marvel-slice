import { useState, useEffect, useRef } from 'react';
import { FiStar, FiMessageSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Reveal from '../ui/Reveal';
import { supabase } from '../../lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

function Stars({ rating }) {
  const count = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={`w-4 h-4 ${i < count ? 'fill-brand-orange text-brand-orange' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <FiMessageSquare className="w-7 h-7 text-brand-orange/30" />
      <p className="mt-3 text-sm text-text-gray leading-relaxed flex-1">“{item.quote}”</p>
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
        {item.avatar_url ? (
          <img src={item.avatar_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-dark-navy flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(item.name || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-dark-navy truncate">{item.name}</p>
          {item.role && <p className="text-xs text-text-gray truncate">{item.role}</p>}
          <div className="mt-1"><Stars rating={item.rating} /></div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection({ section }) {
  const { data: items = [] } = useQuery({
    queryKey: ['testimonials', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
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

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const isSlider = items.length > 3;
  const visible = isSlider ? 3 : items.length;

  useEffect(() => {
    if (!isSlider) {
      setIndex(0);
      return undefined;
    }
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.ceil(items.length / visible));
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [isSlider, items.length, visible]);

  useEffect(() => {
    setIndex(0);
  }, [items.length, isSlider]);

  if (!section) return null;

  const content = section.content || {};
  const heading = content.heading || section.heading || 'What Our Students Say';
  const subheading = content.subheading || section.subheading || '';

  if (items.length === 0) return null;

  const pages = Math.ceil(items.length / visible);
  const page = isSlider ? Math.min(index, pages - 1) : 0;
  const pageItems = isSlider ? items.slice(page * visible, page * visible + visible) : items;

  function go(dir) {
    setIndex((prev) => (prev + dir + pages) % pages);
  }

  return (
    <section className="py-10 sm:py-14 bg-neutral-50">
      <div className="w-full max-w-[92%] sm:max-w-[70%] mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-8">
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-navy">{heading}</h2>
            {subheading && <p className="text-text-gray text-base">{subheading}</p>}
          </div>
        </Reveal>

        {isSlider ? (
          <div className="relative">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300">
              {pageItems.map((item, i) => (
                <TestimonialCard key={item.id || i} item={item} />
              ))}
            </div>
            <button
              type="button"
              aria-label="Previous testimonials"
              onClick={() => go(-1)}
              className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-text-gray hover:text-brand-orange hover:border-brand-orange/40 transition-colors cursor-pointer"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next testimonials"
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
                  aria-label={`Go to testimonial page ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${i === page ? 'w-6 bg-brand-orange' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((item, i) => (
              <TestimonialCard key={item.id || i} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
