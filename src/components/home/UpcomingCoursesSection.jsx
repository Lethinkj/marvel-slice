import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Reveal from '../ui/Reveal';
import { supabase } from '../../lib/supabaseClient';
import { formatDateTime } from '../../lib/datetime';

function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full"
    >
      <div className="relative w-full h-44 bg-gradient-to-br from-brand-blue to-brand-orange">
        {course.hero_image_url ? (
          <img src={course.hero_image_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiCalendar className="w-8 h-8 text-white/70" />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          Coming Soon
        </span>
      </div>
      <div className="p-5 flex flex-col">
        <h4 className="font-semibold text-dark-navy text-base leading-snug group-hover:text-brand-orange transition-colors">
          {course.title}
        </h4>
        {course.start_date && (
          <p className="flex items-center gap-2 text-text-gray text-xs mt-2">
            <FiClock className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
            <span>{formatDateTime(course.start_date)}</span>
          </p>
        )}
        <span className="inline-flex items-center gap-1.5 mt-4 text-brand-blue text-xs font-semibold">
          View Details <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export default function UpcomingCoursesSection({ section }) {
  const { data: courses = [] } = useQuery({
    queryKey: ['upcomingCourses', 'coming-soon'],
    queryFn: async () => {
      try {
        await supabase.rpc('promote_upcoming_courses');
      } catch {
        // RPC is optional; ignore if not available
      }
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, slug, start_date, status, hero_image_url')
        .eq('status', 'Coming Soon')
        .order('start_date', { ascending: true, nullsLast: true });
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return data || [];
    },
  });

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const isSlider = courses.length > 3;
  const visible = isSlider ? 3 : courses.length;
  const pages = Math.ceil(courses.length / visible);
  const page = isSlider ? Math.min(index, pages - 1) : 0;
  const pageCourses = isSlider ? courses.slice(page * visible, page * visible + visible) : courses;

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
  }, [courses.length, isSlider]);

  function go(dir) {
    setIndex((prev) => (prev + dir + pages) % pages);
  }

  const heading = section?.heading || '';
  const subheading = section?.subheading || '';

  if (!heading && courses.length === 0) return null;

  return (
    <section className="py-16 bg-white">
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

        {courses.length > 0 && (
          isSlider ? (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300">
                {pageCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              <button
                type="button"
                aria-label="Previous courses"
                onClick={() => go(-1)}
                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-text-gray hover:text-brand-orange hover:border-brand-orange/40 transition-colors cursor-pointer"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next courses"
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
                    aria-label={`Go to course page ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${i === page ? 'w-6 bg-brand-orange' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}
