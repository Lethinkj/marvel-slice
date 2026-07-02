import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';
import Card from '../ui/Card';

export default function RelatedCourses() {
  const { data: courses } = useQuery({
    queryKey: ['featuredCourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data || [];
    },
  });

  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-dark-navy">
            Latest Courses
          </h2>
          <Link to="/courses" className="text-brand-accent font-medium text-base hover:underline">
            View All &rarr;
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((rc) => (
            <Link key={rc.id} to={`/courses/${rc.slug}`}>
              <Card borderAccent={false} className="overflow-hidden h-full">
                <img
                  src={`https://placehold.co/400x250/1E56C7/white?text=${encodeURIComponent(rc.title?.split(' ')[0] || 'Course')}`}
                  alt={rc.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="font-bold text-dark-navy text-lg mb-3">{rc.title}</h3>
                  <p className="text-sm text-text-gray line-clamp-2 mb-3">{rc.description}</p>
                  <div className="flex items-center gap-4 text-base text-text-gray">
                    <span className="flex items-center gap-1.5">
                      <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                      {rc.rating || 4.5} ({rc.review_count || 0})
                    </span>
                    <span>{(rc.learner_count || 0).toLocaleString()} Learners</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
