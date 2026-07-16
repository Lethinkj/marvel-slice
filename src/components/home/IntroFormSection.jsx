import { useState } from 'react';
import { FiBookOpen, FiUsers, FiBriefcase, FiStar, FiClock, FiAward, FiTarget, FiSend, FiPhone, FiMail, FiUser, FiCheckCircle } from 'react-icons/fi';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';
import Button from '../ui/Button';

const DEFAULT_FEATURES = [
  { icon: FiStar, label: 'Expert Trainers' },
  { icon: FiTarget, label: 'Practical Learning' },
  { icon: FiBriefcase, label: 'Placement Support' },
  { icon: FiClock, label: 'Flexible Batches' },
  { icon: FiAward, label: 'Certification' },
];

function getStatIcon(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('course') || l.includes('program')) return FiBookOpen;
  if (l.includes('student') || l.includes('alumni')) return FiUsers;
  if (l.includes('placement')) return FiBriefcase;
  if (l.includes('trainer') || l.includes('expert') || l.includes('faculty')) return FiStar;
  if (l.includes('year') || l.includes('experience')) return FiClock;
  return FiAward;
}

export default function IntroFormSection({ section }) {
  const content = section?.content || {};
  const introText = content.intro_text || '';
  const stats = content.stats || [];
  const rawPills = Array.isArray(content.pill_buttons) ? content.pill_buttons : (content.pill_buttons || '').split('\n').filter(Boolean);
  const formTitle = content.form_title || 'Book Your Free Demo Class';
  const ctaPhone = content.cta_phone || '';

  const features = rawPills.length > 0
    ? rawPills.map((label) => ({ label, icon: FiCheckCircle }))
    : DEFAULT_FEATURES;

  return (
    <section className="relative overflow-hidden bg-gray-50">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#1B3A6B 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Content + Form */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <Reveal variant="up" className="space-y-7">
            {introText && (
              <p className="text-text-gray text-base sm:text-lg leading-relaxed">
                {introText}
              </p>
            )}

            {stats.length > 0 && (
              <Stagger className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => {
                  const Icon = getStatIcon(stat.label);
                  return (
                    <StaggerItem key={i}>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className="w-11 h-11 mx-auto rounded-xl bg-brand-orange/10 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-brand-orange" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-extrabold text-dark-navy">{stat.value}</p>
                        <p className="text-sm text-text-gray mt-1">{stat.label}</p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}

            {features.length > 0 && (
              <Stagger className="grid sm:grid-cols-2 gap-3">
                {features.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <StaggerItem key={i}>
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3.5 hover:shadow-sm hover:border-gray-200 transition-all duration-200">
                        <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-brand-blue" />
                        </div>
                        <span className="text-sm font-medium text-dark-navy">{feat.label}</span>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="orange" size="lg" shape="xl" href={ctaPhone ? `tel:${ctaPhone}` : undefined}>
                Get Started Now
                <FiSend className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" shape="xl" to="/courses">
                Explore Courses
              </Button>
            </div>
          </Reveal>

          <Reveal variant="right">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-dark-navy">{formTitle}</h3>
                <p className="text-sm text-text-gray mt-1">Fill in your details and we&apos;ll get back to you</p>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-navy mb-1">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Your Name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-navy mb-1">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-navy mb-1">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" placeholder="Your Phone Number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all" />
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-orange accent-brand-orange" />
                  <span className="text-sm text-text-gray leading-relaxed">
                    I agree to the terms and conditions and privacy policy.
                  </span>
                </label>
                <Button variant="orange" size="lg" className="w-full justify-center" shape="xl">
                  Submit
                  <FiSend className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
