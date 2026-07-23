import { FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Reveal from '../ui/Reveal';

export default function CTABannerSection({ section }) {
  if (!section) return null;

  const { heading, subheading, description, phone_number } = section.content || {};

  if (!heading && !description) return null;

  return (
    <section className="relative">
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #e8e0f7 0%, #f0ecf9 40%, #ede8f5 70%, #f5f0fa 100%)',
        }}
      >
        {/* Soft decorative blobs */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(108,76,224,0.12) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(30,86,199,0.08) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute top-8 left-1/2 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 60%)',
            transform: 'translateX(-50%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-20 py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
              {/* Left Column */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight text-[#1A1A2E]">
                  {heading || (
                    <>
                      Ready to start your{' '}
                      <span className="text-[#6C4CE0]">dream career</span>?
                    </>
                  )}
                </h2>
                {(description || subheading) && (
                  <p className="mt-5 text-base sm:text-lg text-neutral-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    {description || subheading || 'Join thousands of successful students who have transformed their careers with Marvel Slice. Get in touch with our counselors today.'}
                  </p>
                )}
              </div>

              {/* Right Column */}
              <div className="shrink-0 flex flex-col items-center lg:items-end gap-3">
                <div
                  className="flex items-center gap-5 px-7 py-5 rounded-2xl bg-white"
                  style={{
                    boxShadow: '0 6px 24px rgba(108,76,224,0.1)',
                    border: '1px solid rgba(108,76,224,0.08)',
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                      Request a Call Back
                    </span>
                    <span className="mt-1.5 text-xl font-bold text-[#1A1A2E] tracking-wide">
                      {phone_number || '+91 6380 957 390'}
                    </span>
                  </div>
                  <motion.a
                    href={`tel:${(phone_number || '+916380957390').replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1E56C7] text-white shrink-0 shadow-lg shadow-[#1E56C7]/30"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPhone className="w-6 h-6" />
                  </motion.a>
                </div>
                <span className="text-sm text-neutral-400 lg:pr-2">
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
