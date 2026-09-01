import Reveal from '../ui/Reveal';

export default function EmpoweringSection({ section }) {
  if (!section) return null;

  const heading = section.heading || '';
  const description = section.content?.description || '';

  if (!heading && !description) return null;

  return (
    <section className="pt-16 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            {heading && (
              <h2 className="font-bold text-2xl sm:text-3xl text-dark-navy whitespace-pre-line">{heading}</h2>
            )}
            <div className="w-16 h-[3px] bg-brand-orange rounded-full mx-auto mt-3 mb-5" />
            {description && (
              <p className="text-text-gray text-sm sm:text-base leading-relaxed whitespace-pre-line">{description}</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
