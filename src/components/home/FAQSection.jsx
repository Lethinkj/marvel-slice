import AccordionItem from '../ui/AccordionItem';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';

export default function FAQSection({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Frequently Asked Questions';
  const items = section.content?.items || [];

  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-dark-navy mb-10">
          {heading}
        </Reveal>
        <Stagger className="space-y-4">
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <AccordionItem title={item.question}>
                <p className="text-text-gray text-base leading-relaxed">{item.answer}</p>
              </AccordionItem>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
