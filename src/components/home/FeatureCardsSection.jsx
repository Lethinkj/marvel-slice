import Reveal from '../ui/Reveal';
import { FiCheckCircle } from 'react-icons/fi';
import Button from '../ui/Button';

export default function FeatureCardsSection({ section }) {
  if (!section) return null;

  const cards = section.content?.cards || [];

  if (cards.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {cards.map((card, i) => (
            <Reveal key={i} variant={i === 0 ? 'right' : 'left'}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 pb-0">
                  <h3 className="font-bold text-3xl" style={{ color: '#ff8415' }}>
                    {card.heading}
                  </h3>
                </div>
                {card.description && (
                  <div className="px-6 pt-3">
                    <p className="text-text-gray text-base leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                )}
                {card.image_url ? (
                  <div className="px-6 pt-4">
                    <img
                      src={card.image_url}
                      alt={card.heading || ''}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="mx-6 mt-4 h-48 bg-gradient-to-r from-brand-blue to-brand-orange rounded-xl" />
                )}
                <div className="p-6 flex flex-col flex-1">
                  {card.bullets && card.bullets.length > 0 && (
                    <ul className="space-y-2 flex-1">
                      {card.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <FiCheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                          <span className="text-text-gray text-base">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    shape="pill"
                    href={card.button_link || '/courses'}
                    className="mt-6 bg-brand-green text-white px-5 py-2 text-base font-semibold rounded-full hover:bg-brand-green/90 transition-all self-start"
                  >
                    {card.button_text || 'View More'}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
