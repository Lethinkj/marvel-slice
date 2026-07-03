import { FiClock, FiVideo, FiCode, FiAward, FiCalendar, FiRefreshCw, FiMessageCircle } from 'react-icons/fi';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';

const iconMap = {
  FiClock: FiClock,
  FiVideo: FiVideo,
  FiCode: FiCode,
  FiAward: FiAward,
  FiCalendar: FiCalendar,
  FiRefreshCw: FiRefreshCw,
  FiMessageCircle: FiMessageCircle,
};

export default function KeyHighlights({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Key Highlights';
  const items = section.content?.items || [];

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-center text-dark-navy mb-10">
          {heading}
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] || FiClock;
            return (
              <StaggerItem
                key={i}
                className="bg-white border-l-4 border-brand-accent rounded-lg shadow-sm p-5 flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-brand-accent/10 rounded-full flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-brand-accent" />
                </div>
                <span className="font-medium text-dark-navy text-base lg:text-lg">
                  {item.label}
                </span>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
