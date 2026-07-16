import { FiArrowRight } from 'react-icons/fi';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';

export default function CTABannerSection({ section }) {
  if (!section) return null;

  const { heading, description, cta_text, cta_link } = section.content || {};

  if (!heading && !description) return null;

  return (
    <section className="relative overflow-hidden bg-gray-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Reveal>
          <div className="bg-gradient-to-br from-brand-blue to-blue-800 rounded-2xl shadow-lg p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left text-white">
              <h2 className="text-xl sm:text-2xl font-bold">
                {heading || 'Ready to start your dream career?'}
              </h2>
              {description && (
                <p className="text-white/80 mt-2 max-w-xl">{description}</p>
              )}
            </div>
            <Button
              variant="outline-white"
              shape="xl"
              href={cta_link ? `tel:${cta_link}` : undefined}
              className="shrink-0"
            >
              {cta_text || 'Request a Call Back'}
              <FiArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
