import React from 'react';

/**
 * HeroBackground Component
 * Modular, reusable, production-grade visual background for Marvel Slice hero sections.
 */
export default function HeroBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Base Clean White & Subtle Gradient Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/35 via-slate-50/30 to-white" />

      {/* Large Soft Marvel Slice BLUE Gradient Area (Right Side Atmospheric Depth) */}
      <div className="absolute -top-36 right-[-10%] w-[750px] h-[750px] rounded-full bg-gradient-to-br from-[#1E56C7]/14 via-blue-200/18 to-transparent blur-3xl" />
      <div className="absolute bottom-[-22%] right-[0%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-300/15 via-indigo-100/10 to-transparent blur-3xl" />

      {/* Subtle Marvel Slice ORANGE Glow (Secondary Accent in Transition Area) */}
      <div className="absolute top-1/3 left-[38%] w-[350px] h-[350px] rounded-full bg-[#F36F21]/7 blur-3xl" />

      {/* Very Subtle Dotted Grid Pattern (Top Right Background) */}
      <div className="absolute top-0 right-0 w-[50%] h-[60%] opacity-25 mix-blend-multiply">
        <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hb-dots-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#1E56C7" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hb-dots-pattern)" />
        </svg>
      </div>

      {/* Elegant Flowing Wave Shape & Thin Curved Decorative Lines */}
      <svg
        className="absolute inset-y-0 right-0 w-full lg:w-[60%] h-full opacity-40"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hbWaveFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E56C7" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="hbStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E56C7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Smooth Flowing Organic Wave Fill */}
        <path d="M320 0 C480 180 380 380 640 600 L800 600 L800 0 Z" fill="url(#hbWaveFill)" />
      </svg>

      {/* Soft Radial Blue Glow Behind Video / Right Visual Container */}
      <div className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[540px] h-[360px] bg-[#1E56C7]/12 rounded-full blur-3xl" />
    </div>
  );
}
