import Reveal from '../ui/Reveal';

export default function EmpoweringSection({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Empowering Careers';
  const description = section.content?.description || '';

  if (!description) return null;

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#F7941D 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <Reveal as="h2" className="font-bold text-2xl sm:text-3xl text-dark-navy mb-5">
          {heading}
        </Reveal>
        <Reveal className="text-text-gray text-base sm:text-lg leading-relaxed max-w-2xl mx-auto" delay={0.1}>
          <p>{description}</p>
        </Reveal>
      </div>
    </section>
  );
}
