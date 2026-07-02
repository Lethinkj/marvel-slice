import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { FiArrowLeft, FiCheckCircle, FiStar, FiBookOpen } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

function SectionRenderer({ section }) {
  switch (section.section_type) {
    case 'text':
      return (
        <div className="max-w-3xl mx-auto">
          {section.heading && <h2 className="text-2xl font-bold text-dark-navy mb-4">{section.heading}</h2>}
          {section.content && <div className="text-text-gray text-base leading-relaxed whitespace-pre-line">{section.content}</div>}
        </div>
      );
    case 'image':
      return (
        <div className="max-w-4xl mx-auto">
          {section.heading && <h2 className="text-2xl font-bold text-dark-navy mb-4 text-center">{section.heading}</h2>}
          {section.image_url && <img src={section.image_url} alt={section.heading || ''} className="w-full rounded-xl shadow-sm" />}
          {section.content && <p className="text-text-gray text-base mt-4 text-center">{section.content}</p>}
        </div>
      );
    case 'cards':
      return (
        <div>
          {section.heading && <h2 className="text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(section.content || '').split('\n').filter(Boolean).map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {section.image_url && <img src={section.image_url} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
                <p className="text-dark-navy font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'features':
      return (
        <div className="max-w-3xl mx-auto">
          {section.heading && <h2 className="text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
          <div className="space-y-4">
            {(section.content || '').split('\n').filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <span className="text-text-gray text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'cta':
      return (
        <div className="bg-gradient-to-r from-brand-blue to-brand-accent rounded-xl p-8 text-center text-white">
          {section.heading && <h2 className="text-2xl font-bold mb-3">{section.heading}</h2>}
          {section.content && <p className="text-white/80 text-base mb-6">{section.content}</p>}
          {section.image_url && (
            <Button to={section.image_url} variant="outline" size="lg">
              {section.heading || 'Learn More'}
            </Button>
          )}
        </div>
      );
    default:
      return null;
  }
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
      <div className="h-44 bg-gradient-to-br from-brand-blue to-dark-navy flex items-center justify-center">
        {course.hero_image_url ? <img src={course.hero_image_url} alt={course.title} className="w-full h-full object-cover" /> : <FiBookOpen className="w-16 h-16 text-white/30" />}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-dark-navy text-lg group-hover:text-brand-accent transition-colors">{course.title}</h3>
        <p className="text-sm text-text-gray mt-2 line-clamp-2 flex-1">{course.description}</p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-text-gray">
          <span className="flex items-center gap-1.5"><FiStar className="w-4 h-4 text-yellow-500 fill-current" />{course.rating || 4.5} ({course.review_count || 0})</span>
          <span>{(course.learner_count || 0).toLocaleString()} Learners</span>
        </div>
      </div>
    </Link>
  );
}

export default function NavPage() {
  const { slug } = useParams();
  const path = `/${slug}`;

  const { data, isLoading } = useQuery({
    queryKey: ['navPageData', path],
    queryFn: async () => {
      const { data: navItem } = await supabase
        .from('nav_items')
        .select('id, label')
        .eq('path', path)
        .eq('is_active', true)
        .maybeSingle();
      if (!navItem) return null;

      const [pageRes, directCoursesRes, childItemsRes] = await Promise.all([
        supabase.from('nav_pages').select('*').eq('nav_item_id', navItem.id).eq('is_published', true).maybeSingle(),
        supabase.from('courses').select('*').eq('nav_item_id', navItem.id).eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('nav_items').select('id').eq('parent_id', navItem.id).eq('is_active', true),
      ]);

      const directCourses = directCoursesRes.data || [];
      const childIds = (childItemsRes.data || []).map(c => c.id);
      let childCourses = [];
      if (childIds.length > 0) {
        const { data } = await supabase.from('courses').select('*').in('nav_item_id', childIds).eq('is_published', true).order('created_at', { ascending: false });
        childCourses = data || [];
      }

      const allCourses = [...directCourses, ...childCourses];
      const unique = allCourses.filter((c, i, a) => a.findIndex(x => x.id === c.id) === i);

      const page = pageRes.data ? { ...pageRes.data, courses: unique, navLabel: navItem.label } : { courses: unique, navLabel: navItem.label };
      return page;
    },
    enabled: !!path,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const hasContent = data && (data.heading || data.subheading || data.sections?.length > 0 || data.courses?.length > 0);

  if (!hasContent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-dark-navy mb-4">Page Not Found</h1>
        <p className="text-text-gray mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-brand-accent hover:underline"><FiArrowLeft className="w-4 h-4" /> Back to Home</Link>
      </div>
    );
  }

  return (
    <div>
      {data.hero_image && (
        <div className="h-72 sm:h-96 w-full overflow-hidden"><img src={data.hero_image} alt="" className="w-full h-full object-cover" /></div>
      )}

      {(data.heading || data.subheading) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {data.heading && <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-navy mb-4">{data.heading}</h1>}
          {data.subheading && <p className="text-lg text-text-gray max-w-2xl mx-auto">{data.subheading}</p>}
        </div>
      )}

      {!data.heading && !data.subheading && data.courses?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-navy mb-4">{data.navLabel}</h1>
          <p className="text-lg text-text-gray max-w-2xl mx-auto">Explore our {data.navLabel?.toLowerCase()} courses</p>
        </div>
      )}

      {data.sections?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-16">
          {data.sections.map((section, i) => <SectionRenderer key={i} section={section} />)}
        </div>
      )}

      {data.courses?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl font-bold text-dark-navy mb-8">
            {data.navLabel ? `${data.navLabel} Courses` : 'Available Courses'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.courses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </div>
      )}
    </div>
  );
}
