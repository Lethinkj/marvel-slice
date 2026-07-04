import Button from '../ui/Button';

export default function CTABannerSection({ section }) {
  if (!section) return null;

  const { heading, description, cta_text, cta_link } = section.content || {};

  return (
    <section className="bg-brand-green py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-navy">
              {heading || 'Ready to start your dream career?'}
            </h2>
            {description && (
              <p className="text-text-gray mt-2">{description}</p>
            )}
          </div>
          <Button
            variant="accent"
            shape="xl"
            href={cta_link || '#'}
            className="shrink-0 rounded-xl px-8 py-3 text-base"
          >
            {cta_text || 'Request a Call Back'}
          </Button>
        </div>
      </div>
    </section>
  );
}
