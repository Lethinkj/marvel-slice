import { FiChevronRight } from 'react-icons/fi';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';

export default function IntroFormSection({ section }) {
  if (!section) return null;

  const content = section.content || {};
  const introText = content.intro_text || '';
  const stats = content.stats || [];
  const pillButtons = Array.isArray(content.pill_buttons) ? content.pill_buttons : (content.pill_buttons || '').split('\n').filter(Boolean);
  const formTitle = content.form_title || 'Career Counselling';

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-8">
            {introText && (
              <Reveal>
                <p className="text-text-gray text-base sm:text-lg leading-relaxed">
                  {introText}
                </p>
              </Reveal>
            )}

            {stats.length > 0 && (
              <Stagger className="grid grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <StaggerItem key={i} className="text-center">
                    <div className="text-3xl sm:text-4xl font-extrabold text-brand-blue">
                      {stat.value}
                    </div>
                    <div className="text-sm sm:text-base text-text-gray mt-1">
                      {stat.label}
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            {pillButtons.length > 0 && (
              <Reveal className="flex flex-wrap gap-3">
                {pillButtons.map((pill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-brand-orange text-brand-orange font-medium text-sm"
                  >
                    {pill}
                    <FiChevronRight className="w-4 h-4" />
                  </span>
                ))}
              </Reveal>
            )}
          </div>

          <Reveal variant="right">
            <div className="border-2 border-brand-green rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-xl text-dark-navy mb-6">{formTitle}</h3>
              <form className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark-navy mb-1.5">Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-navy mb-1.5">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-dark-navy mb-1.5">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Your Phone Number"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-orange accent-brand-orange" />
                  <span className="text-sm text-text-gray leading-relaxed">
                    I agree to the terms and conditions and privacy policy.
                  </span>
                </label>
                <button
                  type="button"
                  className="w-full bg-brand-orange text-white font-semibold rounded-xl py-3 px-6 flex items-center justify-center gap-2 text-base hover:bg-brand-orange/90 transition-colors cursor-pointer"
                >
                  Submit
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
