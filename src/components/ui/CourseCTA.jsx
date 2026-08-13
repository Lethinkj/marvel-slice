import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiZap,
  FiCode,
  FiShield,
  FiTrendingUp,
  FiStar,
  FiAward,
  FiUsers,
  FiClock,
  FiBookOpen,
  FiVideo,
  FiCalendar,
  FiRefreshCw,
  FiMessageCircle,
  FiBriefcase,
  FiGlobe,
  FiCpu,
  FiDatabase,
  FiLayers,
  FiArrowRight,
  FiCheckCircle
} from 'react-icons/fi';

const ICON_MAP = {
  zap: FiZap,
  code: FiCode,
  shield: FiShield,
  trending: FiTrendingUp,
  star: FiStar,
  award: FiAward,
  users: FiUsers,
  clock: FiClock,
  book: FiBookOpen,
  video: FiVideo,
  calendar: FiCalendar,
  refresh: FiRefreshCw,
  message: FiMessageCircle,
  briefcase: FiBriefcase,
  globe: FiGlobe,
  cpu: FiCpu,
  database: FiDatabase,
  layers: FiLayers,
  check: FiCheckCircle
};

function useReducedMotion() {
  const [shouldReduce, setShouldReduce] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduce(mediaQuery.matches);
    const handleChange = (e) => setShouldReduce(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  return shouldReduce;
}

function WaveBackground({ backgroundImage }) {
  if (backgroundImage) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08021a]/90 via-[#140633]/85 to-[#0a031e]/70 backdrop-blur-[2px]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep purple / indigo gradient depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#08021a] via-[#140633] to-[#0a031e]" />

      {/* Slowly moving purple gradient glow */}
      <motion.div
        className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(124, 58, 237, 0.15) 50%, transparent 75%)'
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="absolute -bottom-20 -left-20 w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(79, 70, 229, 0.15) 50%, transparent 75%)'
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />

      {/* Soft Orange CTA Backlight Glow */}
      <div
        className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(255, 159, 28, 0.25) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)'
        }}
      />

      {/* Fine Futuristic Purple Wave Lines - Top Right */}
      <svg
        className="absolute top-0 right-0 w-[600px] lg:w-[850px] h-[400px] lg:h-[550px] opacity-75 pointer-events-none"
        viewBox="0 0 850 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="url(#purple-wave-grad-1)" strokeWidth="1.2">
          {Array.from({ length: 20 }).map((_, i) => (
            <path
              key={i}
              d={`M ${220 + i * 24} 0 C ${370 + i * 18} ${120 + i * 14}, ${520 + i * 12} ${260 + i * 9}, 850 ${320 + i * 10}`}
              opacity={0.15 + (i % 5) * 0.06}
            />
          ))}
        </g>
        <defs>
          <linearGradient id="purple-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff9f1c" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>

      {/* Fine Futuristic Purple Wave Lines - Bottom Left */}
      <svg
        className="absolute bottom-0 left-0 w-[600px] lg:w-[800px] h-[400px] lg:h-[500px] opacity-65 pointer-events-none"
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="url(#purple-wave-grad-2)" strokeWidth="1.2">
          {Array.from({ length: 18 }).map((_, i) => (
            <path
              key={i}
              d={`M 0 ${180 + i * 18} C ${210 + i * 15} ${240 + i * 12}, ${410 + i * 10} ${340 + i * 8}, ${780 + i * 4} 500`}
              opacity={0.12 + (i % 4) * 0.07}
            />
          ))}
        </g>
        <defs>
          <linearGradient id="purple-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '15%', left: '18%', size: '3px', color: '#ff9f1c', delay: 0 },
          { top: '35%', left: '72%', size: '4px', color: '#c084fc', delay: 1 },
          { top: '68%', left: '12%', size: '3px', color: '#a855f7', delay: 2 },
          { top: '82%', left: '58%', size: '2px', color: '#ff9f1c', delay: 0.5 },
          { top: '22%', left: '42%', size: '3px', color: '#818cf8', delay: 1.5 },
          { top: '62%', left: '88%', size: '4px', color: '#ff9f1c', delay: 2.5 },
          { top: '12%', left: '84%', size: '2px', color: '#c084fc', delay: 3 },
          { top: '88%', left: '28%', size: '3px', color: '#818cf8', delay: 1.8 },
        ].map((pt, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full"
            style={{
              top: pt.top,
              left: pt.left,
              width: pt.size,
              height: pt.size,
              backgroundColor: pt.color,
              boxShadow: `0 0 8px ${pt.color}`,
            }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 3.5 + (idx % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: pt.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Badge({ badge, shouldReduceMotion }) {
  if (!badge) return null;
  const iconName = typeof badge === 'object' ? (badge.icon || 'zap') : 'zap';
  const text = typeof badge === 'object' ? badge.text : badge;
  if (!text) return null;
  const IconComp = ICON_MAP[iconName] || FiZap;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.00 }}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[#ff9f1c] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm shadow-purple-950/50 backdrop-blur-md w-fit"
    >
      <IconComp className="w-4 h-4 text-[#ff9f1c] shrink-0" />
      <span>{text}</span>
    </motion.div>
  );
}

function Heading({ title, highlightedTitle, shouldReduceMotion }) {
  if (!title && !highlightedTitle) return null;

  return (
    <motion.h2
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.08 }}
      className="text-white font-extrabold tracking-tight leading-[1.08] max-w-2xl text-left"
      style={{
        fontSize: 'clamp(2.2rem, 4vw, 3.85rem)',
        textWrap: 'balance'
      }}
    >
      {title && <span>{title}</span>}{' '}
      {highlightedTitle && (
        <span className="text-[#ff9f1c] inline-block font-extrabold drop-shadow-[0_0_20px_rgba(255,159,28,0.3)]">
          {highlightedTitle}
        </span>
      )}
    </motion.h2>
  );
}

function Description({ description, shouldReduceMotion }) {
  if (!description || !description.trim()) return null;
  return (
    <motion.p
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.16 }}
      className="text-slate-300 font-normal leading-relaxed max-w-[620px] text-left"
      style={{
        fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)'
      }}
    >
      {description}
    </motion.p>
  );
}

function FeatureItem({ icon, title, description }) {
  if (!title && !description) return null;
  const IconComp = typeof icon === 'string' ? (ICON_MAP[icon] || FiZap) : icon;

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-[#170a38]/80 backdrop-blur-md border border-purple-500/25 shadow-lg shadow-purple-950/40 hover:border-purple-400/50 hover:bg-[#200f49]/90 hover:-translate-y-0.5 transition-all duration-300 group min-w-0">
      <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-400/30 flex items-center justify-center shrink-0 shadow-inner group-hover:border-amber-400/50 group-hover:scale-105 transition-all">
        {IconComp ? (
          typeof IconComp === 'function' || typeof IconComp === 'object' ? (
            <IconComp className="w-5 h-5 text-[#ff9f1c] group-hover:text-amber-300 transition-colors" />
          ) : (
            <span className="text-[#ff9f1c] font-bold text-sm">{IconComp}</span>
          )
        ) : (
          <FiZap className="w-5 h-5 text-[#ff9f1c]" />
        )}
      </div>
      <div className="flex flex-col text-left leading-tight min-w-0">
        {title && (
          <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
            {title}
          </span>
        )}
        {description && (
          <span className="text-xs font-medium text-purple-200/70 mt-0.5 truncate">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

function FeatureList({ features, shouldReduceMotion }) {
  if (!features || !Array.isArray(features) || features.length === 0) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.24 }}
      className="flex flex-wrap gap-3.5 sm:gap-4 w-full"
    >
      {features.map((feature, index) => (
        <div key={feature.id ?? index} className="flex-1 min-w-[130px] sm:min-w-[160px]">
          <FeatureItem
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        </div>
      ))}
    </motion.div>
  );
}

function FuturisticCTAButton({ text, onClick, href, ariaLabel, shouldReduceMotion }) {
  if (!text) return null;
  const [isHovered, setIsHovered] = useState(false);
  const Component = href ? motion.a : motion.button;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
      className="flex items-center justify-center w-full lg:w-auto"
    >
      <Component
        {...(href ? { href } : { type: 'button', onClick })}
        aria-label={ariaLabel || (typeof text === 'string' ? text : '')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group cursor-pointer select-none inline-flex items-center justify-center min-w-[240px] min-h-[76px] px-8 sm:px-10 py-5 w-full sm:w-[360px] lg:w-auto focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-xl"
        whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Outer Parallelogram Outer Frame & Glow */}
        <div
          className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
          style={{
            transform: 'skewX(-14deg)',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(15, 7, 36, 0.95) 50%, rgba(255, 159, 28, 0.35) 100%)',
            boxShadow: isHovered
              ? '0 0 35px rgba(255, 159, 28, 0.45), 0 0 70px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255, 159, 28, 0.2)'
              : '0 0 22px rgba(255, 159, 28, 0.25), 0 0 45px rgba(139, 92, 246, 0.35), inset 0 0 12px rgba(255, 159, 28, 0.1)',
            border: '2px solid rgba(168, 85, 247, 0.8)',
          }}
        >
          {/* Inner Dark Overlay */}
          <div className="absolute inset-[2px] bg-[#0d0424]/90 backdrop-blur-xl rounded-[10px]" />

          {/* Glowing Inner Orange Border Accent */}
          <div className="absolute inset-[3px] rounded-[9px] border border-amber-500/40 group-hover:border-amber-400/70 transition-colors" />

          {/* Top Left Futuristic Orange Tech Hatch Bar */}
          <div className="absolute -top-[3px] left-6 sm:left-8 flex items-center gap-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 px-3 py-[2px] rounded-t-sm shadow-[0_0_12px_#ff9f1c]">
            <div className="flex gap-[3px] opacity-90">
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
            </div>
          </div>

          {/* Bottom Right Futuristic Orange Tech Hatch Bar */}
          <div className="absolute -bottom-[3px] right-6 sm:right-8 flex items-center gap-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 px-3 py-[2px] rounded-b-sm shadow-[0_0_12px_#ff9f1c]">
            <div className="flex gap-[3px] opacity-90">
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0d0424] transform -skew-x-12" />
            </div>
          </div>

          {/* Outer Corner Tech Tabs */}
          <span className="absolute -left-[4px] top-1/2 -translate-y-1/2 w-[6px] h-[18px] bg-purple-400/80 rounded-r-xs shadow-[0_0_8px_#a855f7]" />
          <span className="absolute -right-[4px] top-1/2 -translate-y-1/2 w-[6px] h-[18px] bg-amber-400/80 rounded-l-xs shadow-[0_0_8px_#ff9f1c]" />
        </div>

        {/* Un-skewed Inner Content */}
        <div className="relative z-10 flex items-center justify-center gap-3.5 whitespace-nowrap">
          <span className="text-[#ff9f1c] group-hover:text-amber-300 font-extrabold text-xl sm:text-2xl tracking-wide transition-colors">
            {text}
          </span>
          <motion.div
            animate={{ x: isHovered && !shouldReduceMotion ? 6 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-[#ff9f1c] group-hover:text-amber-300 transition-colors shrink-0"
          >
            <FiArrowRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </motion.div>
        </div>
      </Component>
    </motion.div>
  );
}

export default function CourseCTA(props) {
  const shouldReduceMotion = useReducedMotion();
  const {
    course,
    badge,
    title,
    highlightedTitle,
    description,
    features,
    ctaText,
    ctaLink,
    backgroundImage,
    onCtaClick,
    className = ''
  } = props;

  // 1. Dynamic Badge (no hardcoded fallback text)
  const finalBadge = badge || course?.cta_badge || null;

  // 2. Dynamic Title & Highlighted Title (purely derived from props or course DB fields)
  let finalTitle = title || '';
  let finalHighlight = highlightedTitle || '';

  if (!finalTitle && course) {
    const rawHeading = course.cta_heading || course.title;
    if (rawHeading && rawHeading.trim()) {
      if (rawHeading.includes(' with ')) {
        const parts = rawHeading.split(' with ');
        finalTitle = parts[0];
        finalHighlight = `with ${parts.slice(1).join(' with ')}`;
      } else if (rawHeading.includes(' for ')) {
        const parts = rawHeading.split(' for ');
        finalTitle = parts[0];
        finalHighlight = `for ${parts.slice(1).join(' for ')}`;
      } else {
        finalTitle = rawHeading;
        finalHighlight = '';
      }
    }
  }

  // 3. Dynamic Description (purely derived from props or course DB fields)
  const finalDescription = description || course?.cta_description || course?.description || '';

  // 4. Dynamic Features (only from explicit features prop or course.cta_features)
  const finalFeatures = features || course?.cta_features || null;

  // 5. Dynamic CTA Text, Link & Background Image (purely derived from props or course DB fields)
  const finalCtaText = ctaText || course?.cta_text || course?.cta_left || course?.cta_label || '';
  const finalCtaLink = ctaLink || course?.cta_link || '';
  const finalBgImage = backgroundImage || course?.cta_background_image || course?.background_image || null;

  return (
    <section className={`relative w-full max-w-[1900px] mx-auto min-h-[480px] lg:min-h-[600px] overflow-hidden my-8 sm:my-12 flex items-center ${className}`}>
      <WaveBackground backgroundImage={finalBgImage} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] items-center gap-8 lg:gap-[clamp(2rem,5vw,6rem)]"
        >
          {/* Left Column Content */}
          <div className="flex flex-col items-start gap-5 sm:gap-6 text-left w-full">
            <Badge badge={finalBadge} shouldReduceMotion={shouldReduceMotion} />

            <Heading
              title={finalTitle}
              highlightedTitle={finalHighlight}
              shouldReduceMotion={shouldReduceMotion}
            />

            <Description
              description={finalDescription}
              shouldReduceMotion={shouldReduceMotion}
            />

            <FeatureList
              features={finalFeatures}
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>

          {/* Right Column CTA Button */}
          <div className="flex items-center justify-center lg:justify-end w-full mt-4 lg:mt-0">
            <FuturisticCTAButton
              text={finalCtaText}
              href={finalCtaLink}
              onClick={onCtaClick ? () => onCtaClick(finalCtaText) : undefined}
              ariaLabel={finalCtaText ? `${finalCtaText} - ${finalTitle} ${finalHighlight}`.trim() : ''}
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
