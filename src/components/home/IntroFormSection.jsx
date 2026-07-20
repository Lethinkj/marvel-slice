import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiBriefcase, FiStar, FiClock, FiAward, FiTarget, FiSend, FiPhone, FiMail, FiUser, FiCheckCircle, FiLoader } from 'react-icons/fi';
import Reveal, { Stagger, StaggerItem } from '../ui/Reveal';
import { supabase } from '../../lib/supabaseClient';

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

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      setFormMsg({ type: 'error', text: 'Please fill all fields' });
      return;
    }
    if (!agreeTerms) {
      setFormMsg({ type: 'error', text: 'Please agree to the terms and conditions.' });
      return;
    }
    setSubmitting(true);
    setFormMsg(null);
    const { error } = await supabase.from('form_submissions').insert({
      full_name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
    });
    if (error) {
      setFormMsg({ type: 'error', text: 'Submission failed. Please try again.' });
      setSubmitting(false);
      return;
    }
    fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
      }),
    }).catch(() => {});
    setFormMsg({ type: 'success', text: 'Thank you! We will get back to you soon.' });
    setFormName(''); setFormEmail(''); setFormPhone('');
    setAgreeTerms(false);
    setSubmitting(false);
  }

  const features = rawPills.map((label) => ({ label, icon: FiCheckCircle }));

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#1B3A6B 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-6 gap-10 lg:gap-16 items-start">
          <Reveal variant="up" className="lg:col-span-4 space-y-7">
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
              <Link
                to="/courses?parent=software-learning"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-orange text-white font-semibold text-sm hover:bg-brand-orange/90 transition-colors"
              >
                Software Learning
              </Link>
              <Link
                to="/courses?parent=competitive-exam"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-orange text-white font-semibold text-sm hover:bg-brand-orange/90 transition-colors"
              >
                Competitive Exam
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" className="lg:col-span-2">
            <div className="rounded-2xl shadow-lg overflow-hidden max-w-sm w-full lg:ml-auto" style={{ backgroundColor: '#74a916' }}>
              {/* diagonal header: white left / orange right */}
              <div className="relative h-28" style={{ backgroundColor: '#ff8415' }}>
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(0 0, 55% 0, 35% 100%, 0 100%)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div className="h-full flex items-center pl-8">
                    <span className="text-2xl font-serif font-bold" style={{ color: '#ff8415' }}>Career</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-end">
                  <span className="bg-white rounded-[6px] px-5 py-2 text-lg font-serif font-bold shadow-sm mr-2" style={{ color: '#ff8415' }}>
                    Counselling
                  </span>
                </div>
              </div>

              {/* green body with subtle texture */}
              <div className="relative p-6">
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.04]"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 50 Q 30 20 50 50 T 90 50\' stroke=\'white\' fill=\'none\' stroke-width=\'2\'/%3E%3C/svg%3E")',
                    backgroundSize: '120px 120px',
                  }}
                />
                {formMsg && formMsg.text !== 'Please agree to the terms and conditions.' && (
                  <div className={`relative z-10 p-3 mb-4 text-sm font-medium rounded ${formMsg.type === 'success' ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'}`}>
                    {formMsg.text}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                  <input type="text" placeholder="Your Name" value={formName} onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-5 py-3.5 border-0 text-sm bg-white rounded-[8px] outline-none placeholder-gray-400 focus:ring-2 focus:ring-white/50 transition-all" />
                  <input type="email" placeholder="your@email.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-5 py-3.5 border-0 text-sm bg-white rounded-[8px] outline-none placeholder-gray-400 focus:ring-2 focus:ring-white/50 transition-all" />
                  <input type="tel" placeholder="Your Phone Number" value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-5 py-3.5 border-0 text-sm bg-white rounded-[8px] outline-none placeholder-gray-400 focus:ring-2 focus:ring-white/50 transition-all" />
                  {formMsg?.type === 'error' && formMsg?.text === 'Please agree to the terms and conditions.' && (
                    <p className="text-red-300 text-xs">{formMsg.text}</p>
                  )}
                  <label className="flex items-start gap-3 cursor-pointer pt-1">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 w-4 h-4 border-white/50 accent-white" />
                    <span className="text-sm text-white/90 leading-relaxed">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-300 underline hover:text-blue-200">Terms of Use</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-blue-300 underline hover:text-blue-200">Privacy Policy</a>.
                    </span>
                  </label>
                  <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-7 py-3.5 bg-[#ff8415] text-white font-bold rounded hover:bg-[#ff8415]/90 transition-colors disabled:opacity-70 text-base">
                    {submitting ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
                    {submitting ? 'Submitting...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
