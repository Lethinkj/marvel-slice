import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiArrowLeft, FiCheckCircle, FiUsers, FiBarChart2, FiClock, FiMonitor, FiBookOpen, FiAward, FiCode, FiChevronDown } from 'react-icons/fi';
import Button from '../components/ui/Button';
import CourseCard from '../components/ui/CourseCard';
import Reveal, { Stagger, StaggerItem } from '../components/ui/Reveal';
import { useCourse, useRelatedCourses, useSiteSettings } from '../hooks/useSupabase';

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

function AdminTabsSection({ tabs }) {
  if (!tabs || tabs.length === 0) return null;
  const [active, setActive] = useState(0);
  const [pulsing, setPulsing] = useState(null);
  const tab = tabs[active];
  const { data: site } = useSiteSettings();

  function handleTabClick(i) {
    setPulsing(i);
    setTimeout(() => setPulsing(null), 400);
    setActive(i);
  }

  function renderContent(t) {
    if (t.content_type === 'overview' || t.content_type === 'syllabus') {
      return (
        <div>
          {t.content?.heading && <h2 className="text-2xl font-bold text-dark-navy text-center mb-4">{t.content.heading}</h2>}
          {t.content?.paragraph && <p className="text-gray-600 leading-relaxed text-center max-w-2xl mx-auto mb-8">{t.content.paragraph}</p>}
          <div className="w-16 h-1 bg-brand-accent rounded-full mx-auto mb-8" />
          {t.content?.subheading && <h3 className="text-lg font-semibold text-dark-navy mb-5">{t.content.subheading}</h3>}
          {t.content?.qa?.length > 0 && (
            <div className="space-y-4">
              {t.content.qa.map((item, qi) => (
                <div key={qi} className="border border-gray-200 rounded-xl overflow-hidden">
                  <details className="group">
                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-dark-navy hover:bg-gray-50 transition-colors list-none">
                      <span>{item.question}</span>
                      <FiChevronDown className="w-5 h-5 text-brand-accent transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-4">
                      {item.answers?.length > 0 && (
                        <ul className="space-y-2">
                          {item.answers.map((a, ai) => (
                            <li key={ai} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/60 shrink-0 mt-2" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
          {t.content?.text && !t.content?.qa?.length && <div className="text-gray-700 leading-relaxed">{t.content.text}</div>}
          {!t.content?.heading && !t.content?.paragraph && !t.content?.qa?.length && !t.content?.text && <p className="text-gray-400">No content added yet.</p>}
        </div>
      );
    }
    if (t.content_type === 'pricing') {
      return <div className="text-gray-700 leading-relaxed max-w-3xl">{t.content?.text || 'No content added yet.'}</div>;
    }
    if (t.content_type === 'apply_now') {
      return (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 max-w-xl mx-auto">
          <FiCode className="w-12 h-12 text-brand-accent mx-auto mb-4" />
          <p className="text-lg font-semibold text-dark-navy mb-2">Ready to get started?</p>
          <p className="text-gray-500 mb-6">Take the next step in your learning journey.</p>
          <Button variant="accent" size="lg">Apply Now</Button>
        </div>
      );
    }
    return <div className="text-gray-700 leading-relaxed whitespace-pre-line">{t.content?.text || ''}</div>;
  }

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab buttons - pentagon on active, rectangle inactive, same size */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {tabs.map((t, i) => (
            <button
              key={t.id || i}
              onClick={() => handleTabClick(i)}
              className={`relative transition-all duration-[400ms] px-6 text-sm font-semibold whitespace-nowrap flex items-center ${
                pulsing === i ? 'animate-pulse-scale' : ''
              }`}
              style={{
                clipPath: i === active ? 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' : 'none',
                height: '44px',
                borderRadius: i === active ? '0' : '10px',
                background: i === active ? 'var(--color-brand-accent)' : 'transparent',
                border: i === active ? 'none' : '2px solid var(--color-dark-navy)',
                color: i === active ? '#fff' : 'var(--color-dark-navy)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          {/* Left column — content */}
          <div className="lg:col-span-2">
            <Reveal>{renderContent(tab)}</Reveal>
          </div>

          {/* Right column — sticky sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Reveal>
              <div className="bg-gradient-to-br from-brand-accent to-brand-blue rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-1">Talk To Us</h3>
                <p className="text-white/70 text-sm mb-5">Have questions? We're here to help.</p>
                {site?.contact_phone && (
                  <a href={`tel:${site.contact_phone}`} className="block text-lg font-semibold mb-6 hover:text-white/80 transition-colors">
                    {site.contact_phone}
                  </a>
                )}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm leading-relaxed text-white/90">
                      "This course completely transformed my career. The hands-on projects were incredibly valuable."
                    </p>
                    <p className="text-xs text-white/60 mt-2 font-medium">— A Past Student</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm leading-relaxed text-white/90">
                      "The mentorship and curriculum exceeded my expectations. Highly recommended!"
                    </p>
                    <p className="text-xs text-white/60 mt-2 font-medium">— A Past Student</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
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
        <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-4">
          Course Overview
        </Reveal>

        {course.description && (
          <p className="text-gray-600 leading-relaxed mb-10 max-w-4xl">{course.description}</p>
        )}

        {course.checklist_items?.length > 0 && (
          <div className="mb-12">
            <Reveal as="h3" className="text-lg font-semibold text-dark-navy mb-4">
              Key Learning Outcomes
            </Reveal>
            <Stagger className="grid sm:grid-cols-2 gap-3 max-w-4xl">
              {course.checklist_items.map((item, i) => (
                <StaggerItem key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-brand-accent" />
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}

        {course.highlights?.length > 0 && (
          <div className="mb-12">
            <Reveal as="h3" className="text-lg font-semibold text-dark-navy mb-4 text-center">
              Course Highlights
            </Reveal>
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {course.highlights.map((h, i) => (
                <StaggerItem key={h.id || i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  {h.icon && <FiAward className="w-8 h-8 text-brand-accent mx-auto mb-3" />}
                  <p className="font-semibold text-dark-navy text-sm">{h.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}

        {course.overview_faqs?.length > 0 && (
          <div className="mb-12">
            <Reveal as="h3" className="text-lg font-semibold text-dark-navy mb-4">
              What You Need to Know
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-4 max-w-4xl">
              {course.overview_faqs.map((f, i) => (
                <Reveal key={f.id || i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-dark-navy mb-2 text-sm">{f.question}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.answer}</p>
                  {f.list_items?.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {f.list_items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/60 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CurriculumSection({ curriculum }) {
  if (!curriculum || curriculum.length === 0) return null;
  const [open, setOpen] = useState(null);
  return (
    <section id="curriculum" data-section="curriculum" className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8">Course Curriculum</Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {curriculum.map((mod, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                      onClick={() => setOpen(open === i ? null : i)}
                      className="flex items-center gap-1 text-xs font-medium text-brand-accent hover:underline"
                    >
                      {open === i ? 'Hide' : 'Show'} lessons
                      <FiChevronDown className={`w-3 h-3 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                    </button>
                    {open === i && (
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
      </div>
    </section>
  );
}

function PricingSection({ fees }) {
  if (!fees || fees.length === 0) return null;
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8 text-center">Pricing Plans</Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {fees.map((f, i) => (
            <StaggerItem key={f.id || i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{f.plan_name}</p>
              <p className="text-4xl font-extrabold text-dark-navy mt-3">₹{f.price?.toLocaleString() || '—'}</p>
              <p className="text-sm text-gray-400 mt-1">{f.currency || 'INR'}</p>
              {f.cta_label && <Button variant="accent" size="sm" className="mt-6 w-full">{f.cta_label}</Button>}
            </StaggerItem>
          ))}
        </Stagger>
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

function InstructorSection({ instructor }) {
  if (!instructor) return null;
  return (
    <section id="instructor" data-section="instructor" className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8 text-center">Your Instructor</Reveal>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {instructor.image_url ? (
              <img src={instructor.image_url} alt={instructor.name} className="w-24 h-24 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0">
                <FiUsers className="w-10 h-10 text-brand-accent" />
              </div>
            )}
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-dark-navy">{instructor.name}</h3>
              {instructor.designation && <p className="text-brand-accent font-medium text-sm">{instructor.designation}</p>}
              {instructor.experience && <p className="text-sm text-gray-500 mt-0.5">{instructor.experience} experience</p>}
              {instructor.bio && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{instructor.bio}</p>}
              {instructor.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                  {instructor.skills.map((s, j) => (
                    <span key={j} className="text-xs bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
                className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-dark-navy hover:bg-gray-50 transition-colors"
              >
                <span>{f.question}</span>
                <FiChevronDown className={`w-5 h-5 text-brand-accent transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
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
  if (!related || related.length === 0) return null;
  return (
    <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {related.map((rc) => (
        <StaggerItem key={rc.id} className="h-full">
          <CourseCard course={rc} bannerSize="sm" variant="initial" />
        </StaggerItem>
      ))}
    </Stagger>
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
              {course.course_fees?.length > 0 && (
                <div className="mt-4 bg-brand-accent/5 rounded-xl p-5 border border-brand-accent/10 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Starting from</p>
                  <p className="text-3xl font-extrabold text-brand-orange mt-1">
                    ₹{course.course_fees[0].price?.toLocaleString() || 'Contact Us'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{course.course_fees[0].plan_name || 'Full Course'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3 text-sm">
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
              <FiMonitor className="w-5 h-5 text-brand-accent" />
              <div>
                <p className="font-semibold">{course.mode || 'Both'}</p>
                <p className="text-xs text-gray-400">Mode</p>
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

      {/* Overview */}
      <OverviewSection course={course} />

      {/* Course Tabs (admin-created) */}
      <AdminTabsSection tabs={course.course_tabs} />

      {/* Curriculum */}
      <CurriculumSection curriculum={course.curriculum} />

      {/* Pricing (shown between Curriculum and Projects) */}
      <PricingSection fees={course.course_fees} />

      {/* Projects */}
      <ProjectsSection projects={course.projects} />

      {/* CTA Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="bg-gradient-to-r from-brand-blue to-brand-accent rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-white shadow-lg">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">Ready to start your learning journey?</h3>
              <p className="text-white/80 mt-2">Enroll now and gain industry-ready skills with expert mentors.</p>
            </div>
            <Button variant="outline" size="lg" className="shrink-0 whitespace-nowrap border-white text-white hover:bg-white hover:text-brand-accent">Enroll Now →</Button>
          </Reveal>
        </div>
      </section>

      {/* Instructor */}
      <InstructorSection instructor={course.instructor} />

      {/* Certification */}
      <CertificationSection certifications={course.certifications} />

      {/* FAQs */}
      <FAQSection faqs={course.faqs} />

      {/* Related Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal as="h2" className="text-2xl font-bold text-dark-navy mb-8">More Courses You Might Like</Reveal>
          <RelatedCoursesWithId courseId={course.id} />
        </div>
      </section>
    </div>
  );
}
