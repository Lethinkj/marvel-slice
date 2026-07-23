import { FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Reveal from '../ui/Reveal';

export default function CTABannerSection({ section }) {
  if (!section) return null;

  const { heading, subheading, description, phone_number } = section.content || {};

  if (!heading && !description) return null;

  return (
    <section className="relative">
      <div className="rounded-3xl overflow-hidden relative bg-[#0B2D6B]">
        {/* Geometric pattern layer */}
        <div className="absolute inset-0">
          {/* Diagonal blue-to-orange fade */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0B2D6B 0%, #1642a0 25%, #1a8a7d 65%, #2ec4b6 100%)',
            }}
          />
          {/* Decorative circles */}
          <div className="absolute top-[-60px] right-[10%] w-48 h-48 rounded-full border-[3px] border-white/10" />
          <div className="absolute top-[20px] right-[5%] w-28 h-28 rounded-full border-[2px] border-white/8" />
          <div className="absolute bottom-[-40px] left-[15%] w-36 h-36 rounded-full border-[3px] border-white/10" />
          <div className="absolute bottom-[30px] left-[8%] w-20 h-20 rounded-full border-[2px] border-white/8" />
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Soft glow spots */}
          <div
            className="absolute top-0 left-[30%] w-[350px] h-[350px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(23,92,221,0.3) 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute bottom-0 right-[20%] w-[300px] h-[300px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(46,196,182,0.25) 0%, transparent 60%)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-20 py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
              {/* Left Column */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight text-white">
                  {heading || (
                    <>
                      Ready to start your{' '}
                      <span className="text-[#2ec4b6]">dream career</span>?
                    </>
                  )}
                </h2>
                {(description || subheading) && (
                  <p className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    {description || subheading || 'Join thousands of successful students who have transformed their careers with Marvel Slice. Get in touch with our counselors today.'}
                  </p>
                )}
              </div>

              {/* Right Column */}
              <div className="shrink-0 flex flex-col items-center lg:items-end gap-3">
                <div className="flex items-center gap-5 px-7 py-5 rounded-2xl bg-white/[0.12] backdrop-blur-md border border-white/15">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white/55 uppercase tracking-widest">
                      Request a Call Back
                    </span>
                    <span className="mt-1.5 text-xl font-bold text-white tracking-wide">
                      {phone_number || '+91 6380 957 390'}
                    </span>
                  </div>
                  <motion.a
                    href={`tel:${(phone_number || '+916380957390').replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1E56C7] text-white shrink-0 shadow-lg shadow-[#1E56C7]/35"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPhone className="w-6 h-6" />
                  </motion.a>
                </div>
                <span className="text-sm text-white/50 lg:pr-2">
                  Available 24/7 for counseling.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
