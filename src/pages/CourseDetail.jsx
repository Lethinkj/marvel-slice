import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiArrowLeft, FiCheckCircle, FiUsers, FiBarChart2, FiClock } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { useCourse, useRelatedCourses } from '../hooks/useSupabase';
import KeyHighlights from '../components/home/KeyHighlights';
import CourseOverview from '../components/home/CourseOverview';

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1`;
  }
  return null;
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { data: course, isLoading } = useCourse(slug);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (showHint) {
      const t = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showHint]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-dark-navy mb-4">Course not found</h1>
        <Link to="/courses" className="text-brand-accent hover:underline">Browse all courses</Link>
      </div>
    );
  }

  const highlightsSection = {
    heading: 'Key Highlights',
    content: { items: course.highlights || [] },
  };

  const overviewSection = {
    heading: 'Course Overview',
    content: {
      description: course.description,
      items: (course.overview_faqs || []).map((f) => ({
        question: f.question,
        answer: f.answer,
        list_items: f.list_items,
      })),
    },
  };

  const embedUrl = course.video_url ? getYoutubeEmbedUrl(course.video_url) : null;

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue to-dark-navy text-white">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
          <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-6 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            <div className="lg:col-span-3">
              <h1 className="text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold leading-[1.15]">
                {course.title}
              </h1>
              <p className="mt-4 text-base text-white/70 leading-relaxed max-w-xl">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-5 mt-6 text-sm">
                <span className="flex items-center gap-1.5 text-white/80">
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-white">{course.rating || 4.5}</span>
                  <span className="text-white/50">({course.review_count || 0} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <FiUsers className="w-4 h-4" />
                  {(course.learner_count || 0).toLocaleString()} learners
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <Button variant="primary-lg" size="xl" to="#enroll">Enroll Now</Button>
                <Button variant="secondary" size="xl" to="#brochure">Download Brochure</Button>
              </div>
            </div>
            <div className="lg:col-span-2">
              {embedUrl ? (
                <div className="relative rounded-xl overflow-hidden shadow-2xl group">
                  <iframe
                    src={`${embedUrl}&mute=1&controls=1`}
                    title="Course Introduction Video"
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {showHint && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1.5 bg-black/60 text-white text-xs rounded-lg backdrop-blur transition-opacity">
                      Video muted — click speaker to unmute
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-white/5 backdrop-blur p-8 text-center border border-white/10">
                    <FiBarChart2 className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">Course preview video</p>
                  </div>
                </div>
              )}
              {course.course_fees && course.course_fees.length > 0 && (
                <div className="mt-4 bg-white/5 backdrop-blur rounded-xl p-5 border border-white/10 text-center">
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Course Fee</p>
                  <p className="text-3xl font-extrabold text-brand-orange mt-1">
                    ₹{course.course_fees[0].price?.toLocaleString() || 'Contact Us'}
                  </p>
                  <p className="text-sm text-white/60 mt-0.5">{course.course_fees[0].plan_name || 'Full Course'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-dark-navy">
              <FiBarChart2 className="w-5 h-5 text-brand-accent" />
              <div>
                <p className="font-semibold">{course.level || 'All Levels'}</p>
                <p className="text-xs text-gray-400">Level</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-dark-navy">
              <FiClock className="w-5 h-5 text-brand-accent" />
              <div>
                <p className="font-semibold">{course.duration || 'Self-paced'}</p>
                <p className="text-xs text-gray-400">Duration</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-dark-navy">
              <FiUsers className="w-5 h-5 text-brand-accent" />
              <div>
                <p className="font-semibold">{(course.learner_count || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-dark-navy">
              <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
              <div>
                <p className="font-semibold">{course.rating || 4.5} / 5.0</p>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {course.checklist_items && course.checklist_items.length > 0 && (
        <section className="py-16 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-dark-navy mb-8">What You'll Learn</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {course.checklist_items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <KeyHighlights section={highlightsSection} />
      <CourseOverview section={overviewSection} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-dark-navy mb-8">
            More Courses You Might Like
          </h2>
          <RelatedCoursesWithId courseId={course.id} />
        </div>
      </section>
    </div>
  );
}

function RelatedCoursesWithId({ courseId }) {
  const { data: related } = useRelatedCourses(courseId);

  if (!related || related.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {related.map((rc) => (
        <Link key={rc.id} to={`/courses/${rc.slug}`}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="h-40 bg-gradient-to-br from-brand-blue/90 to-dark-navy flex items-center justify-center">
            <span className="text-white/15 text-5xl font-bold">{rc.title?.charAt(0)}</span>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-dark-navy group-hover:text-brand-accent transition-colors">{rc.title}</h3>
            <p className="text-sm text-text-gray mt-1.5 line-clamp-2">{rc.description}</p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FiStar className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                {rc.rating || 4.5}
              </span>
              <span>{(rc.learner_count || 0).toLocaleString()} learners</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
