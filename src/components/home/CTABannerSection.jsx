import { FiArrowRight } from 'react-icons/fi';
import Reveal from '../ui/Reveal';

export default function CTABannerSection({ section }) {
  if (!section) return null;

  const { heading, subheading, description, cta_text, cta_link } = section.content || {};

  if (!heading && !description) return null;

  return (
    <section className="relative overflow-hidden shadow-2xl" style={{ backgroundColor: '#1a1a2e' }}>
      <div className="absolute inset-0" style={{ backgroundColor: '#74a916', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="absolute inset-0" style={{ backgroundColor: '#5a8a10', clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left text-white">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {heading || 'Ready to start your dream career?'}
              </h2>
              {subheading && (
                <p className="text-white/60 mt-2 text-sm sm:text-base font-medium uppercase tracking-wider">{subheading}</p>
              )}
              {description && (
                <p className="text-white/80 mt-3 max-w-xl text-base sm:text-lg">{description}</p>
              )}
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <a
                href={cta_link ? `tel:${cta_link}` : undefined}
                className="inline-flex items-center justify-center gap-3 px-[30px] py-[15px] rounded-full bg-gradient-to-r from-white to-orange-100 text-brand-orange font-semibold shadow-lg shadow-brand-orange/20 hover:shadow-xl hover:shadow-brand-orange/30 hover:brightness-95 transition-all shrink-0"
              >
                <span className="flex flex-col items-start">
                  <span className="text-sm font-bold">{cta_text || 'Request a Call Back'}</span>
                  {cta_link && <span className="text-xs font-medium text-brand-orange/70">{cta_link}</span>}
                </span>
                <FiArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
