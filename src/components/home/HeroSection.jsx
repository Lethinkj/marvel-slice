import { motion, useReducedMotion } from 'framer-motion';
import { FiCheckCircle, FiUsers } from 'react-icons/fi';
import Button from '../ui/Button';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';
import { staggerContainer, staggerItem } from '../../lib/motion';

const DEFAULT_BULLETS = [
  'Industry-relevant curriculum designed by experts',
  'Hands-on projects with real-world applications',
  'Personalized mentorship and career guidance',
  'Flexible learning schedule for working professionals',
];

const DEFAULT_STATS = [
  { value: '10,000+', label: 'Courses' },
  { value: '8,500+', label: 'Success Stories' },
  { value: '95%', label: 'Placement Support' },
];

export default function HeroSection({ section }) {
  const reduce = useReducedMotion();
  const container = reduce ? undefined : staggerContainer;
  const item = reduce ? undefined : staggerItem;
  const mount = reduce ? {} : { initial: 'hidden', animate: 'visible' };

  if (!section) return null;

  const content = section.content || {};
  const bannerImage = content.banner_image || '';

  const headline = content.headline || 'Transform Your Career with Expert-Led Learning';
  const description = content.description || '';
  const rawBullets = content.feature_bullets;
  const featureBullets = Array.isArray(rawBullets) ? rawBullets : (rawBullets ? rawBullets.split('\n').filter(Boolean) : DEFAULT_BULLETS);
  const ctaText = content.cta_text || 'Start Your Journey Today';
  const studentImageUrl = content.student_image_url || '';
  const stats = content.stats || DEFAULT_STATS;

  return (
    <section className="relative overflow-hidden">
      {bannerImage ? (
        <>
          <div className="w-full overflow-hidden">
            <img src={bannerImage} alt="" className="w-full h-72 sm:h-96 object-cover" />
          </div>
          {headline && (
            <div className="bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <h1 className="text-[clamp(1.75rem,4vw,3.25rem)] font-extrabold text-dark-navy leading-[1.15] text-pretty">
                  {headline}
                </h1>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ background: 'linear-gradient(135deg, #F7941D 50%, #1B3A6B 50%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">
                <motion.div variants={container} {...mount} className="flex flex-col justify-center">
                  <Reveal as="div" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold text-white w-fit mb-6">
                    <span className="w-2 h-2 rounded-full bg-brand-bright-blue" />
                    Marvel Slice
                  </Reveal>

                  <motion.h1
                    variants={item}
                    className="text-[clamp(1.75rem,4vw,3.25rem)] font-extrabold text-white leading-[1.15] text-pretty"
                  >
                    {headline}
                  </motion.h1>

                  {description && (
                    <motion.p variants={item} className="mt-4 sm:mt-5 text-base sm:text-lg text-white/85 leading-relaxed max-w-xl">
                      {description}
                    </motion.p>
                  )}

                  {featureBullets.length > 0 && (
                    <motion.ul variants={item} className="mt-8 space-y-3">
                      {featureBullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-base text-white">
                          <FiCheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </motion.ul>
                  )}

                  <motion.div variants={item} className="mt-8 sm:mt-10">
                    <Button variant="orange">
                      {ctaText}
                    </Button>
                  </motion.div>
                </motion.div>

                <Reveal variant="right" className="flex self-center">
                  <div className="w-full h-96 rounded-2xl overflow-hidden bg-white/10">
                    {studentImageUrl ? (
                      <img
                        src={studentImageUrl}
                        alt="Students"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/70">
                        <FiUsers className="w-16 h-16" />
                        <span className="text-lg font-medium">Students</span>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          <div className="bg-brand-navy-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Stagger className="grid grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <StaggerItem key={i} className="text-center">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm sm:text-base text-white/70 mt-1">
                      {stat.label}
                    </p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
