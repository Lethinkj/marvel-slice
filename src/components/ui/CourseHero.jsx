import React from 'react';
import { FiArrowLeft, FiCheck, FiArrowRight, FiDownload, FiPlay, FiBarChart2 } from 'react-icons/fi';

/**
 * Split a course title into a 2-line visual hierarchy dynamically.
 * Line 1: Primary Marvel Slice Blue
 * Line 2: Dark Navy (matching reference design)
 */
function splitCourseTitle(title) {
  if (!title) return { line1: '', line2: '' };
  const words = title.trim().split(/\s+/);
  if (words.length === 1) {
    return { line1: words[0], line2: '' };
  }
  if (words.length === 2) {
    return { line1: words[0], line2: words[1] };
  }

  const lastWord = words[words.length - 1];
  const commonSuffixes = [
    'masterclass', 'bootcamp', 'program', 'course', 'specialization',
    'certification', 'diploma', 'training', 'essentials', 'fundamentals',
    'advanced', 'pro', 'express', 'complete', 'series'
  ];

  if (commonSuffixes.includes(lastWord.toLowerCase()) && words.length > 2) {
    return {
      line1: words.slice(0, words.length - 1).join(' '),
      line2: lastWord,
    };
  }

  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(' '),
    line2: words.slice(mid).join(' '),
  };
}

export default function CourseHero({
  course,
  handleBackNavigation,
  openEnquiryModal,
  videoPlaying,
  setVideoPlaying,
  trackVideoPlay,
  embedUrl,
}) {
  if (!course) return null;

  const { line1, line2 } = splitCourseTitle(course.title);
  const highlights = course.checklist_items || course.highlights || [];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-slate-50 py-8 sm:py-12 lg:py-16">
      {/* Universal Premium Background Matching Reference Design */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle Light Blue Radial Accent Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-white/80 to-white" />

        {/* Soft Flowing Waves on Right Side */}
        <div className="absolute -top-32 right-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-blue-200/30 via-indigo-100/20 to-transparent blur-3xl" />
        <div className="absolute bottom-[-20%] right-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-blue-300/20 via-blue-100/15 to-transparent blur-3xl" />

        {/* Dotted Background Pattern Grid (Top Right) */}
        <div className="absolute top-0 right-0 w-[55%] h-[60%] opacity-40 mix-blend-multiply">
          <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ref-hero-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.3" fill="#1E56C7" opacity="0.22" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ref-hero-dots)" />
          </svg>
        </div>

        {/* Floating Thin Decorative Outline Circles/Rings */}
        <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="92%" cy="16%" r="28" stroke="#1E56C7" strokeWidth="1.5" strokeOpacity="0.25" />
          <circle cx="46%" cy="92%" r="18" stroke="#1E56C7" strokeWidth="1.5" strokeOpacity="0.2" />
        </svg>

        {/* Soft Blue Backdrop Glow behind Right Visual */}
        <div className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[480px] h-[320px] bg-[#1E56C7]/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        {handleBackNavigation && (
          <button
            type="button"
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E56C7] hover:text-blue-700 transition-colors mb-6 cursor-pointer group"
          >
            <FiArrowLeft className="w-4 h-4 text-[#1E56C7] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        )}

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* 2-Line Dynamic Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight">
              <span className="block text-[#1E56C7]">{line1}</span>
              {line2 && <span className="block text-[#0F172A] mt-1 sm:mt-1.5">{line2}</span>}
            </h1>

            {/* Status Badge */}
            {course.status && course.status !== 'Active' && (
              <span className="inline-block mt-3 align-middle text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60">
                {course.status}
              </span>
            )}

            {/* Description */}
            {course.description && (
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {course.description}
              </p>
            )}

            {/* Dynamic CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 mt-8 w-full sm:w-auto">
              {/* PRIMARY CTA - Marvel Slice Orange */}
              <button
                type="button"
                onClick={() => openEnquiryModal?.(course.cta_left || 'Talk to Advisor')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>{course.cta_left || 'Talk to Advisor'}</span>
                <FiArrowRight className="w-4 h-4 text-white" />
              </button>

              {/* SECONDARY CTA - White with Blue Border */}
              <button
                type="button"
                onClick={() => openEnquiryModal?.(course.cta_right || 'Download Brochure')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-blue-50/50 text-[#1E56C7] font-bold text-sm rounded-xl border-2 border-[#1E56C7] hover:border-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <FiDownload className="w-4 h-4 text-[#1E56C7]" />
                <span>{course.cta_right || 'Download Brochure'}</span>
              </button>
            </div>
          </div>

          {/* Right Column (Video Visual & Pills below Video) ~ 45% width */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center w-full">
            {/* Subtle Blue Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1E56C7]/20 via-blue-400/15 to-indigo-300/20 rounded-3xl blur-2xl transform scale-95 pointer-events-none" />

            <div className="w-full relative z-10 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-2xl shadow-blue-900/10 overflow-hidden group">
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-[#1E56C7] to-brand-orange" />

              <div className="p-1.5 sm:p-2 bg-slate-50/50">
                {embedUrl && !videoPlaying ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video group-hover:scale-[1.01] transition-transform duration-500">
                    {course.hero_image_url ? (
                      <img
                        src={course.hero_image_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <FiBarChart2 className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setVideoPlaying?.(true);
                        trackVideoPlay?.(course.title);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors cursor-pointer"
                      aria-label="Play course video"
                    >
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                        <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                        <FiPlay className="w-7 h-7 text-[#1E56C7] ml-1 relative z-10" />
                      </div>
                    </button>
                  </div>
                ) : embedUrl && videoPlaying ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                    <iframe
                      src={`${embedUrl}?autoplay=1&mute=1&controls=1`}
                      title="Course Introduction Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : course.hero_image_url ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <img
                      src={course.hero_image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl aspect-video bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                    <FiBarChart2 className="w-14 h-14 text-white/30 mb-2" />
                    <p className="text-white/70 text-sm font-medium">{course.title}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist Pills Grid (Max 4 items) */}
            {highlights.length > 0 && (
              <div className="mt-5 w-full relative z-10">
                <div className={`grid gap-2.5 text-left ${highlights.slice(0, 4).length >= 3 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {highlights.slice(0, 4).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow"
                    >
                      <div className="w-5 h-5 rounded-full border border-blue-500 bg-blue-50/40 flex items-center justify-center shrink-0">
                        <FiCheck className="w-3.5 h-3.5 text-[#1E56C7] stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                        {(item || "").slice(0, 90)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
