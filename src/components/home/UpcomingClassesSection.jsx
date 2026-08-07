import { Link } from 'react-router-dom';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';

export default function UpcomingClassesSection({ section }) {
  if (!section) return null;

  const heading = section.heading || '';
  const subheading = section.subheading || '';
  const classes = section.content?.items || [];

  if (!heading && classes.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            {heading && (
              <h2 className="font-bold text-2xl sm:text-3xl text-dark-navy mb-3">{heading}</h2>
            )}
            <div className="w-4/5 max-w-xs h-[3px] bg-brand-orange mx-auto mb-5" />
            {subheading && (
              <p className="text-text-gray text-base sm:text-lg leading-relaxed mb-10">{subheading}</p>
            )}
          </div>
        </Reveal>

        {classes.length > 0 && (
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, i) => (
              <StaggerItem key={i}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                      <FiCalendar className="w-6 h-6 text-brand-orange" />
                    </div>
                    <h4 className="font-semibold text-dark-navy text-lg">{cls.course_name}</h4>
                  </div>
                  {cls.date_time && (
                    <p className="flex items-center gap-2 text-text-gray text-sm mt-3">
                      <FiClock className="w-4 h-4 shrink-0 text-brand-orange" />
                      <span>{cls.date_time}</span>
                    </p>
                  )}
                  <div className="mt-auto pt-5">
                    <Link
                      to={cls.register_link || '#'}
                      className="inline-flex items-center justify-center gap-2 w-full bg-brand-blue text-white text-sm font-semibold py-2.5 px-5 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Register Now <FiArrowRight className="w-4 h-4" />
                    </Link>
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