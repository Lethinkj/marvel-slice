import Card from '../ui/Card';

export default function ProjectsSection({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Projects';
  const items = section.content?.items || [];

  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-center text-dark-navy mb-10">
          {heading}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <Card key={i} className="p-8">
              <h3 className="font-bold text-brand-accent text-xl mb-3">
                {item.title}
              </h3>
              <p className="text-text-gray text-base leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
