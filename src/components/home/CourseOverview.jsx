import AccordionItem from '../ui/AccordionItem';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';

export default function CourseOverview({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Overview';
  const content = section.content || {};
  const description = content.description || '';
  const items = content.items || [];

  if (items.length === 0 && !description) return null;

  return (
    <section className="py-12 sm:py-16 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Reveal as="h2" className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-dark-navy mb-4">
              {heading}
            </Reveal>
            {description && (
              <Reveal as="p" className="text-text-gray text-base lg:text-lg leading-relaxed mb-8">
                {description}
              </Reveal>
            )}

            {items.length > 0 && (
              <Stagger className="space-y-2 w-full max-w-[70%]">
                {items.map((item, i) => (
                  <StaggerItem key={i}>
                    <AccordionItem title={item.question} defaultOpen={i === 0}>
                      <p className="text-text-gray text-base leading-relaxed mb-3">{item.answer}</p>
                      {item.list_items && item.list_items.length > 0 && (
                        <ol className="list-decimal pl-6 space-y-1.5 text-base text-text-gray">
                          {item.list_items.map((li, j) => (
                            <li key={j}>{li}</li>
                          ))}
                        </ol>
                      )}
                    </AccordionItem>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>

          <Reveal variant="left" className="bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl p-6 sm:p-8 text-white">
            <h4 className="font-semibold text-lg sm:text-xl mb-3">Talk To Us</h4>
            <a href="tel:+916380957390" className="text-brand-orange font-bold text-xl sm:text-2xl block mb-6 hover:underline">
              +91 6380957390
            </a>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-sm text-white/70">Angular Developer</p>
                <p className="text-base mt-2 leading-relaxed">
                  "Angular has been the most in-demand framework for enterprise applications."
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-sm text-white/70">Industry Report</p>
                <p className="text-base mt-2 leading-relaxed">
                  "Over 40% of Fortune 500 companies use Angular for their web platforms."
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
