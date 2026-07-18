import Reveal from '../ui/Reveal';

export default function EmpoweringSection({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Empowering Careers';
  const description = section.content?.description || '';

  if (!description) return null;

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
            <h2 className="font-bold text-2xl sm:text-3xl text-dark-navy mb-5">
              {heading}
            </h2>
            <p className="text-text-gray text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              {description}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
