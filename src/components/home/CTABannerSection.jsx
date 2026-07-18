import { FiArrowRight } from 'react-icons/fi';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';

export default function CTABannerSection({ section }) {
  if (!section) return null;

  const { heading, subheading, description, cta_text, cta_link, background_image, image_url } = section.content || {};
  const bannerUrl = background_image || image_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80';

  if (!heading && !description) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
      </div>
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
