import Reveal from '../ui/Reveal';

export default function EmpoweringSection({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Empowering Careers';
  const description = section.content?.description || '';

  return (
    <section className="bg-bg-light py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Reveal as="h2" className="font-bold text-2xl sm:text-3xl text-dark-navy mb-6">
          {heading}
        </Reveal>
        <Reveal className="text-text-gray text-base sm:text-lg leading-relaxed">
          <p>{description}</p>
        </Reveal>
      </div>
    </section>
  );
}
