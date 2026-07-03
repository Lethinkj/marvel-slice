import Button from '../ui/Button';
import { usePromoBanner } from '../../hooks/useSupabase';
import Reveal from '../ui/Reveal';

export default function PromoBanner() {
  const { data: banner } = usePromoBanner();

  if (!banner) return null;

  return (
    <section className="bg-dark-navy py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        <Reveal variant="right" className="text-white text-center lg:text-left">
          <h2 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold leading-snug">
            {banner.heading}{' '}
            {banner.highlighted_text && (
              <span className="text-brand-orange">{banner.highlighted_text}</span>
            )}
          </h2>
          {banner.subtext && (
            <p className="mt-3 text-base lg:text-lg text-gray-300 max-w-3xl">
              {banner.subtext}
            </p>
          )}
        </Reveal>
        <Reveal variant="left" className="shrink-0">
          <Button variant="outlineWhite" className="text-base">
            {banner.cta_label || 'Know More'}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
