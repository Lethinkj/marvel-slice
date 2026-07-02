import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { FiStar, FiBookOpen, FiFilter } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/ui/Button';

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
      <div className="h-48 bg-gradient-to-br from-brand-blue to-dark-navy flex items-center justify-center">
        <FiBookOpen className="w-16 h-16 text-white/30" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h2 className="font-bold text-dark-navy text-xl mb-2 group-hover:text-brand-accent transition-colors">
          {course.title}
        </h2>
        <p className="text-sm text-text-gray line-clamp-3 mb-4 flex-1">
          {course.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-text-gray">
            <span className="flex items-center gap-1">
              <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
              {course.rating || 4.5}
            </span>
            <span>{(course.learner_count || 0).toLocaleString()} learners</span>
          </div>
          <span className="text-sm font-semibold text-brand-accent">
            View Course &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const activeCategory = searchParams.get('category') || categorySlug || null;

  const { data: courses, isLoading } = useQuery({
    queryKey: ['allCourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, nav_item_id')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: navItems } = useQuery({
    queryKey: ['courseNavCategories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('nav_items')
        .select('id, label, path, parent_label, parent_id')
        .not('parent_label', 'is', null)
        .eq('is_active', true)
        .order('sort_order');
      return data || [];
    },
  });

  const categories = useMemo(() => {
    if (!navItems || !courses) return [];
    const map = {};
    const courseIds = new Set(courses.map((c) => c.nav_item_id).filter(Boolean));
    navItems.forEach((ni) => {
      if (courseIds.has(ni.id) || courses.some((c) => c.nav_item_id === ni.id)) {
        const slug = ni.path?.replace(/^\/courses\/?/, '') || ni.label.toLowerCase().replace(/\s+/g, '-');
        if (!map[ni.id]) {
          map[ni.id] = { id: ni.id, label: ni.label, slug, courses: [] };
        }
      }
    });
    courses.forEach((course) => {
      const cat = course.nav_item_id ? map[course.nav_item_id] : null;
      if (cat) {
        cat.courses.push(course);
      }
    });
    return Object.values(map).filter((c) => c.courses.length > 0);
  }, [navItems, courses]);

  const filteredCourses = useMemo(() => {
    if (!activeCategory || !courses) return courses || [];
    const cat = categories.find((c) => c.slug === activeCategory);
    return cat ? cat.courses : [];
  }, [courses, categories, activeCategory]);

  const activeLabel = activeCategory
    ? categories.find((c) => c.slug === activeCategory)?.label || activeCategory
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold text-dark-navy">
          {activeLabel || 'Our Courses'}
        </h1>
        <p className="text-text-gray text-lg mt-3 max-w-2xl mx-auto">
          {activeLabel
            ? `Explore all ${activeLabel} courses`
            : 'Explore our range of courses grouped by category'}
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Button
            onClick={() => setSearchParams({})}
            variant={!activeCategory ? 'pill-active' : 'pill'}
            size="sm"
            shape="pill"
          >
            <FiFilter className="w-4 h-4" />
            All Courses
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.slug })}
              variant={activeCategory === cat.slug ? 'pill-active' : 'pill'}
              size="sm"
              shape="pill"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      )}

      {(!courses || courses.length === 0) ? (
        <div className="text-center py-16">
          <FiBookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-text-gray">No courses available yet.</p>
        </div>
      ) : activeCategory && filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <FiBookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-text-gray">No courses found in this category.</p>
        </div>
      ) : activeCategory ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          {categories.map((cat) => (
            <section key={cat.id}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-dark-navy">{cat.label}</h2>
                <Button
                  onClick={() => setSearchParams({ category: cat.slug })}
                  variant="link"
                  size="sm"
                >
                  View All &rarr;
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {cat.courses.slice(0, 3).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
