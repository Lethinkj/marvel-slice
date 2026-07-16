import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiArrowLeft, FiArrowRight, FiUsers, FiBarChart2, FiClock, FiBookOpen, FiAward, FiCode, FiChevronDown, FiPlus, FiMinus, FiVideo, FiCalendar, FiRefreshCw, FiMessageCircle, FiBriefcase, FiGlobe, FiCpu, FiDatabase, FiLayers, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi';
import Button from '../components/ui/Button';
import CourseCard from '../components/ui/CourseCard';
import Reveal, { Stagger, StaggerItem } from '../components/ui/Reveal';
import { useCourse, useRelatedCourses } from '../hooks/useSupabase';

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

const HIGHLIGHT_ICONS = {
  code: FiCode, star: FiStar, award: FiAward, users: FiUsers,
  clock: FiClock, target: FiBarChart2, book: FiBookOpen,
  video: FiVideo, calendar: FiCalendar, refresh: FiRefreshCw,
  message: FiMessageCircle, briefcase: FiBriefcase, globe: FiGlobe,
  cpu: FiCpu, database: FiDatabase, layers: FiLayers,
  zap: FiZap, shield: FiShield, trending: FiTrendingUp,
};

function CourseTabs({ tabs, curriculum }) {
  const allTabs = [];
  if (tabs && tabs.length > 0) {
    tabs.forEach((t, i) => allTabs.push({ id: t.id || `admin-${i}`, label: t.label, type: 'admin', data: t }));
  }
  if (curriculum && curriculum.length > 0) {
    allTabs.push({ id: 'curriculum', label: 'Curriculum', type: 'curriculum', data: curriculum });
  }
  if (allTabs.length === 0) return null;

  const [active, setActive] = useState(0);
  const [pulsing, setPulsing] = useState(null);
  const [openMod, setOpenMod] = useState(null);
  const activeTab = allTabs[active];

  function handleTabClick(i) {
    setPulsing(i);
    setTimeout(() => setPulsing(null), 400);
    setActive(i);
    setOpenMod(null);
  }

  function renderCurriculum(cur) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cur.map((mod, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5">
              <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">Module {i + 1}</span>
              <h3 className="font-semibold text-dark-navy mt-1 mb-2">{mod.title}</h3>
              {mod.description && <p className="text-sm text-gray-500 mb-3">{mod.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span>{mod.topics?.length || 0} lessons</span>
              </div>
              {mod.topics?.length > 0 && (
                <>
                  <button
                    onClick={() => setOpenMod(openMod === i ? null : i)}
                    className="flex items-center gap-1 text-xs font-medium text-brand-accent hover:underline"
                  >
                    {openMod === i ? 'Hide' : 'Show'} lessons
                    <FiChevronDown className={`w-3 h-3 transition-transform ${openMod === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openMod === i && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                      {mod.topics.map((topic, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/60 shrink-0" />
                          {topic}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start gap-2 mb-0">
          {allTabs.map((t, i) => (
            <div key={t.id} className="flex flex-col items-center">
              <button
                onClick={() => handleTabClick(i)}
                className={`relative transition-all duration-[400ms] px-5 py-2 text-sm font-semibold whitespace-nowrap rounded-lg ${
                  pulsing === i ? 'animate-pulse-scale' : ''
                } ${
                  i === active
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'bg-transparent text-dark-navy border-2 border-dark-navy hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
              {i === active && (
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-brand-accent relative z-10" />
              )}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mt-0">
          <Reveal>
            {activeTab.type === 'curriculum'
              ? renderCurriculum(activeTab.data)
              : (() => {
                  const t = activeTab.data;
                  const content = t.content || {};
                  return (
                    <div>
                      {content.heading && <h2 className="text-2xl font-bold text-dark-navy text-center mb-4">{content.heading}</h2>}
                      {content.paragraph && <p className="text-gray-600 leading-relaxed text-center max-w-2xl mx-auto mb-6">{content.paragraph}</p>}
                      {content.text && <div className="text-gray-700 leading-relaxed whitespace-pre-line">{content.text}</div>}
                      {!content.heading && !content.paragraph && !content.text && <p className="text-gray-400 text-center">Content coming soon.</p>}
                    </div>
                  );
                })()
            }
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function OverviewSection({ course }) {
  if (!course) return null;

  return (
    <section id="overview" data-section="overview" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {course.highlights?.length > 0 && (
          <div className="mb-12">
            <Reveal as="h3" className="text-2xl font-bold text-dark-navy text-center mb-6">Key Highlights</Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {course.highlights.map((h, i) => (
                <Reveal key={h.id || i}>
                  <div className="bg-white rounded-xl shadow-sm flex items-center gap-4 p-4 h-[72px]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div className="shrink-0 w-1 self-stretch rounded-full bg-blue-500" />
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      {(() => {
                        const IconComp = HIGHLIGHT_ICONS[h.icon] || FiAward;
                        return <IconComp className="w-5 h-5 text-indigo-400" />;
                      })()}
                    </div>
                    <span className="font-semibold text-dark-navy text-sm">{h.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}



function ProjectsSection({ projects }) {
  if (!projects || projects.length === 0) return null;
  return (
    <section id="projects" data-section="projects" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8">Hands-On Projects</Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <StaggerItem key={p.id || i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4">
                <FiBookOpen className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="font-bold text-dark-navy mb-2">{p.title}</h3>
              {p.difficulty && <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{p.difficulty}</span>}
              {p.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                  {p.technologies.map((tech, j) => (
                    <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tech}</span>
                  ))}
                </div>
              )}
              {p.description && <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}



function CertificationSection({ certifications }) {
  if (!certifications || certifications.length === 0) return null;
  return (
    <section id="certification" data-section="certification" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8 text-center">Certification</Reveal>
        <div className="max-w-4xl mx-auto">
          {certifications.map((cert, i) => (
            <Reveal key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="grid md:grid-cols-2">
                {(cert.image_url || cert.certificate_image_url) && (
                  <div className="bg-gray-50 flex items-center justify-center p-8">
                    <img src={cert.image_url || cert.certificate_image_url} alt="Certification" className="max-w-full max-h-48 object-contain" />
                  </div>
                )}
                <div className="p-8 flex flex-col justify-center">
                  {cert.description && <p className="text-gray-700 mb-4 leading-relaxed">{cert.description}</p>}
                  {cert.skills_earned?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-dark-navy mb-2">Skills You'll Earn</p>
                      <div className="flex flex-wrap gap-2">
                        {cert.skills_earned.map((s, j) => (
                          <span key={j} className="text-xs bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cert.recognized_companies?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-dark-navy mb-2">Recognized by</p>
                      <div className="flex flex-wrap gap-2">
                        {cert.recognized_companies.map((c, j) => (
                          <span key={j} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ faqs }) {
  if (!faqs || faqs.length === 0) return null;
  const [open, setOpen] = useState(null);
  return (
    <section id="faqs" data-section="faqs" className="py-16 bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8 text-center">Frequently Asked Questions</Reveal>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.id || i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-dark-navy hover:bg-gray-50 transition-colors gap-3"
              >
                <span>{f.question}</span>
                <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                  {open === i ? <FiMinus className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />}
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">{f.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedCoursesWithId({ courseId }) {
  const { data: related } = useRelatedCourses(courseId);
  const displayCourses = related?.slice(0, 4) || [];
  if (displayCourses.length === 0) return null;
  return (
    <div>
      <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCourses.map((rc) => (
          <StaggerItem key={rc.id} className="h-full">
            <CourseCard course={rc} bannerSize="sm" variant="initial" />
          </StaggerItem>
        ))}
      </Stagger>
      {related.length > 4 && (
        <div className="text-center mt-8">
          <Link to="/courses" className="inline-flex items-center gap-2 text-brand-accent font-semibold hover:underline">
            View More Courses <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { data: course, isLoading } = useCourse(slug);

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

  const embedUrl = course.video_url ? getYoutubeEmbedUrl(course.video_url) : null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-accent mb-6 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-14">
            <div className="lg:col-span-3">
              <h1 className="text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold text-dark-navy leading-[1.15]">
                {course.title}
                {course.status && course.status !== 'Active' && (
                  <span className={`ml-3 inline-block align-middle text-xs font-semibold px-2.5 py-1 rounded-full ${
                    course.status === 'Coming Soon' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {course.status}
                  </span>
                )}
              </h1>
              {course.subtitle && (
                <p className="mt-3 text-lg text-brand-accent font-medium">{course.subtitle}</p>
              )}
              <p className="mt-4 text-base text-gray-600 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-dark-navy">{course.rating || 4.5}</span>
                  <span className="text-gray-400">({course.review_count || 0} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <FiUsers className="w-4 h-4" />
                  {(course.learner_count || 0).toLocaleString()} learners
                </span>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8">
                <Button variant="accent" size="lg" to="#enroll" className="w-full sm:w-auto">Enroll Now</Button>
                <Button variant="outline" size="lg" to="#brochure" className="w-full sm:w-auto">Download Brochure</Button>
              </div>
            </div>
            <div className="lg:col-span-2">
              {embedUrl ? (
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={`${embedUrl}&mute=1&controls=1`}
                    title="Course Introduction Video"
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 p-12 text-center">
                  <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Course preview video</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>



      {/* Overview */}
      <OverviewSection course={course} />

      {/* Course Tabs (includes Curriculum) */}
      <CourseTabs tabs={course.course_tabs} curriculum={course.curriculum} />

      {/* CTA Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="bg-gradient-to-r from-brand-blue to-blue-700 rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-white shadow-lg">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">Ready to start your learning journey?</h3>
              <p className="text-white/80 mt-2">Enroll now and gain industry-ready skills with expert mentors.</p>
            </div>
            <Button variant="outline" size="lg" className="shrink-0 whitespace-nowrap border-white text-white hover:bg-white hover:text-brand-accent">Enroll Now →</Button>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <ProjectsSection projects={course.projects} />

      {/* Certification */}
      <CertificationSection certifications={course.certifications} />

      {/* Related Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8">More Courses You Might Like</Reveal>
          <RelatedCoursesWithId courseId={course.id} />
        </div>
      </section>

      {/* FAQs */}
      <FAQSection faqs={course.faqs} />
    </div>
  );
}
