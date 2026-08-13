import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

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

function DynamicBackground({ background, shouldReduceMotion }) {
  if (!background) return null;

  const bgStr = String(background).trim();
  const isImageUrl = bgStr.startsWith('http') || bgStr.startsWith('/') || bgStr.startsWith('data:') || bgStr.includes('.') || bgStr.includes('/');

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* Dynamic Background Image / Gradient asset fetched from DB */}
      <div
        className="cta-background absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: isImageUrl ? `url("${bgStr}")` : undefined,
          background: !isImageUrl ? bgStr : undefined,
        }}
      />

      {/* Readability Gradient Overlay */}
      <div
        className="cta-overlay absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(3, 5, 26, 0.90) 0%, rgba(3, 5, 26, 0.72) 48%, rgba(3, 5, 26, 0.40) 100%)'
        }}
      />
    </motion.div>
  );
}

function FuturisticCTAButton({ text, onClick, href, ariaLabel, shouldReduceMotion }) {
  if (!text) return null;
  const [isHovered, setIsHovered] = useState(false);
  const Component = href ? motion.a : motion.button;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut", delay: 0.15 }}
      className="flex items-center justify-center w-full lg:w-auto"
    >
      <Component
        {...(href ? { href } : { type: 'button', onClick })}
        aria-label={ariaLabel || (typeof text === 'string' ? text : '')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group cursor-pointer select-none inline-flex items-center justify-center min-w-[220px] min-h-[68px] px-8 py-4 w-full sm:w-[320px] lg:w-auto focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-xl"
        whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Futuristic Parallelogram Frame with Neon Border & Accent Marks */}
        <div
          className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
          style={{
            transform: 'skewX(-14deg)',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(13, 4, 36, 0.92) 50%, rgba(255, 159, 28, 0.35) 100%)',
            boxShadow: isHovered
              ? '0 0 35px rgba(255, 159, 28, 0.45), 0 0 70px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255, 159, 28, 0.2)'
              : '0 0 22px rgba(255, 159, 28, 0.25), 0 0 45px rgba(139, 92, 246, 0.35), inset 0 0 12px rgba(255, 159, 28, 0.1)',
            border: '2px solid rgba(168, 85, 247, 0.8)',
          }}
        >
          {/* Inner Dark Glass Center with Backdrop Blur */}
          <div className="absolute inset-[2px] bg-[#0c0422]/90 backdrop-blur-xl rounded-[10px]" />

          {/* Inner Orange Glowing Accent Line */}
          <div className="absolute inset-[3px] rounded-[9px] border border-amber-500/40 group-hover:border-amber-400/70 transition-colors" />

          {/* Top Left Orange Tech Hatch Bar */}
          <div className="absolute -top-[3px] left-6 sm:left-8 flex items-center gap-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 px-3 py-[2px] rounded-t-sm shadow-[0_0_12px_#ff9f1c]">
            <div className="flex gap-[3px] opacity-90">
              <span className="w-[3px] h-[6px] bg-[#0c0422] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0c0422] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0c0422] transform -skew-x-12" />
            </div>
          </div>

          {/* Bottom Right Orange Tech Hatch Bar */}
          <div className="absolute -bottom-[3px] right-6 sm:right-8 flex items-center gap-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 px-3 py-[2px] rounded-b-sm shadow-[0_0_12px_#ff9f1c]">
            <div className="flex gap-[3px] opacity-90">
              <span className="w-[3px] h-[6px] bg-[#0c0422] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0c0422] transform -skew-x-12" />
              <span className="w-[3px] h-[6px] bg-[#0c0422] transform -skew-x-12" />
            </div>
          </div>

          {/* Corner Tabs */}
          <span className="absolute -left-[4px] top-1/2 -translate-y-1/2 w-[6px] h-[18px] bg-purple-400/80 rounded-r-xs shadow-[0_0_8px_#a855f7]" />
          <span className="absolute -right-[4px] top-1/2 -translate-y-1/2 w-[6px] h-[18px] bg-amber-400/80 rounded-l-xs shadow-[0_0_8px_#ff9f1c]" />
        </div>

        {/* Un-skewed Content */}
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

export default function CourseCTA({
  ctaHeading,
  ctaDescription,
  buttonText,
  background,
  // Props Aliases for complete backwards compatibility:
  cta_heading,
  cta_description,
  cta_text,
  cta_background_image,
  ctaBackground,
  title,
  description,
  course,
  href,
  onClick,
  onCtaClick,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();

  // Dynamic Content Resolution (Dynamic 4 properties)
  const finalHeading = ctaHeading || cta_heading || title || course?.ctaHeading || course?.cta_heading || course?.title || '';
  const finalDescription = ctaDescription || cta_description || description || course?.ctaDescription || course?.cta_description || course?.description || '';
  const finalButtonText = buttonText || cta_text || course?.buttonText || course?.cta_text || course?.cta_left || '';
  const finalBackground = background || ctaBackground || cta_background_image || course?.ctaBackground || course?.cta_background_image || course?.background_image || null;

  const finalHref = href || course?.cta_link || undefined;
  const handleButtonClick = onClick || (onCtaClick ? () => onCtaClick(finalButtonText) : undefined);

  return (
    <section className={`relative w-full max-w-[1900px] mx-auto min-h-[480px] lg:min-h-[600px] overflow-hidden my-8 sm:my-12 flex items-center ${className}`}>
      {/* Background & Overlay Layer */}
      <DynamicBackground background={finalBackground} shouldReduceMotion={shouldReduceMotion} />

      {/* Fixed Two-Column Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] items-center gap-8 lg:gap-[clamp(2rem,5vw,6rem)]">
          {/* Left Column (Heading + Description) */}
          <div className="flex flex-col items-start gap-4 sm:gap-5 text-left w-full">
            {finalHeading && (
              <motion.h2
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
                className="text-white font-extrabold tracking-tight leading-[1.1] max-w-[800px] text-left"
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 3.2rem)',
                  textWrap: 'balance'
                }}
              >
                {finalHeading}
              </motion.h2>
            )}

            {finalDescription && (
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut", delay: 0.1 }}
                className="text-slate-300 font-normal leading-relaxed max-w-[620px] text-left"
                style={{
                  fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)'
                }}
              >
                {finalDescription}
              </motion.p>
            )}
          </div>

          {/* Right Column (Button) */}
          <div className="flex items-center justify-center lg:justify-end w-full mt-4 lg:mt-0">
            <FuturisticCTAButton
              text={finalButtonText}
              href={finalHref}
              onClick={handleButtonClick}
              ariaLabel={finalButtonText ? `${finalButtonText} - ${finalHeading}`.trim() : ''}
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
