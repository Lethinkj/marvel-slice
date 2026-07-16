import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';
import { FiChevronRight, FiBriefcase, FiBookOpen, FiTarget } from 'react-icons/fi';
import Button from '../ui/Button';

const serviceIcons = [FiBriefcase, FiBookOpen, FiTarget];

export default function ServicesSection({ section }) {
  if (!section) return null;

  const c = section.content || {};
  const heading = section.heading || 'Featured Services';
  const intro = c.intro || '';
  const leftImageUrl = c.left_image_url || '';
  const leftHeading = c.left_heading || 'Transform Your Future with Industry-Focused Training';
  const leftDescription = c.left_description || '';
  const ctaText = c.cta_text || 'Explore Our Services';
  const ctaLink = c.cta_link || '#';
  const servicesList = c.services_list || [];
  const serviceCards = c.service_cards || [];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-center text-dark-navy mb-6">
          {heading}
        </Reveal>
        {intro && (
          <Reveal className="text-text-gray max-w-2xl mx-auto mb-12 text-center">
            <p>{intro}</p>
          </Reveal>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <Reveal variant="right" className="flex flex-col">
            {leftImageUrl ? (
              <img
                src={leftImageUrl}
                alt={leftHeading}
                className="w-full h-72 object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-72 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-accent" />
            )}
            <h3 className="font-bold text-xl mt-6 text-dark-navy">{leftHeading}</h3>
            {leftDescription && (
              <p className="text-text-gray mt-3">{leftDescription}</p>
            )}
            <Button
              variant="accent"
              shape="xl"
              href={ctaLink}
              className="mt-4 self-start"
            >
              {ctaText} <FiChevronRight />
            </Button>
          </Reveal>

          <Reveal variant="left" className="flex flex-col justify-center">
            {servicesList.map((service, i) => {
              const Icon = serviceIcons[i] || FiBriefcase;
              return (
                <div key={i}>
                  <div className="flex gap-4 py-5">
                    <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-1">
                      <Icon className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-dark-navy">{service.title}</h4>
                      <p className="text-text-gray text-sm mt-1">{service.description}</p>
                    </div>
                  </div>
                  {i < servicesList.length - 1 && <div className="border-b border-gray-100" />}
                </div>
              );
            })}
          </Reveal>
        </div>

        {serviceCards.length > 0 && (
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {serviceCards.map((card, i) => (
              <StaggerItem key={i}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-brand-blue to-brand-accent flex items-center justify-center">
                      <FiTarget className="w-8 h-8 text-white/70" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="font-semibold text-dark-navy">{card.title}</h4>
                    <p className="text-text-gray text-sm mt-2">{card.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
