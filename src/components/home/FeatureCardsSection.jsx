import Reveal from '../ui/Reveal';
import { FiCheckCircle } from 'react-icons/fi';

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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.heading || ''}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-r from-brand-blue to-brand-accent flex items-center justify-center p-6">
                    <h3 className="text-white font-bold text-xl text-center">
                      {card.heading}
                    </h3>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-dark-navy">
                    {card.heading}
                  </h3>
                  {card.description && (
                    <p className="text-text-gray text-sm mt-2 leading-relaxed">
                      {card.description}
                    </p>
                  )}
                  {card.bullets && card.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {card.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <FiCheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                          <span className="text-text-gray text-sm">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <a
                    href={card.button_link || '#'}
                    className="bg-brand-green text-white rounded-lg px-6 py-2.5 inline-block mt-6 hover:bg-brand-green/90 transition-colors"
                  >
                    {card.button_text || 'View More'}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
