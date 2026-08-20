import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiCheckCircle, FiArrowRight, FiTarget, FiChevronDown, FiX, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal, { Stagger, StaggerItem } from '../components/ui/Reveal';
import AccordionItem from '../components/ui/AccordionItem';
import ModularCareerCTA from '../components/ui/ModularCareerCTA';
import { supabase } from '../lib/supabaseClient';
import { trackRegister, trackFormSubmit } from '../lib/analytics';

const FAQS = [
  {
    question: "What are the key eligibility criteria for IBPS examinations?",
    answer: "For IBPS PO, Clerk, and RRB roles, a recognized Bachelor's degree in any discipline is generally required. Age limits usually range between 20 to 30 years for PO and 18 to 28 years for Clerk/Assistant, with age relaxation applicable for reserved categories. For IBPS Specialist Officer (SO), specific degree qualifications in IT, Agriculture, Law, HR, or Marketing are mandatory."
  },
  {
    question: "Is there a personal interview stage for all IBPS exams?",
    answer: "No. IBPS PO/MT, RRB Officer Scale I, and Specialist Officer (SO) include a personal interview after the Main examination. However, for clerical and office assistant positions like IBPS Clerk/CSA and RRB Office Assistant, selection is based purely on written examination performance without a personal interview."
  },
  {
    question: "Can final-year college students apply for IBPS recruitment?",
    answer: "Yes, final-year students can apply provided their final graduation results are declared on or before the official document verification / registration cutoff date specified in the official IBPS notification for that recruitment cycle."
  },
  {
    question: "How many public sector and rural banks recruit through IBPS?",
    answer: "IBPS conducts recruitment for 11 major Public Sector Banks across India (including Bank of Baroda, Punjab National Bank, Canara Bank, Union Bank, etc.) as well as over 40 Regional Rural Banks (RRBs) operating across various states."
  },
  {
    question: "What is the typical selection process and exam pattern?",
    answer: "Most IBPS examinations follow a two-tier objective online exam format: a Preliminary Exam (testing Reasoning, Quantitative Aptitude, and English) followed by a Main Exam (including General/Banking Awareness and Computer Knowledge). Officer-level posts also include a final interview stage."
  }
];

const EXAMS = [
  {
    id: 'section-01',
    number: '01',
    title: 'IBPS PO / MT',
    subtitle: 'Start Your Journey as a Bank Officer',
    badge: 'OFFICER LEVEL',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200/80',
    image: '/images/banking/banking_ibps_po_1787149162525.jpg',
    imageAlt: 'IBPS PO Officer in modern bank office',
    imageLeft: true,
    paragraphs: [
      'The IBPS Probationary Officer / Management Trainee examination is one of the most sought-after banking examinations for graduates who want to begin their career in an officer-level position.',
      'A Probationary Officer is exposed to different areas of banking during the early stages of their career. The role can involve customer service, account operations, loans and credit, branch administration, financial products, and day-to-day banking activities.',
      'It is a strong choice for candidates who want a career with responsibility, structured growth, and opportunities to move into higher managerial positions.'
    ],
    difference: 'The PO pathway is designed for candidates aiming directly for an officer role. It generally involves a Preliminary Examination, Main Examination, and Interview.',
    idealFor: 'Graduates who want leadership responsibilities, career progression, and a long-term career in banking.'
  },
  {
    id: 'section-02',
    number: '02',
    title: 'IBPS Clerk / Customer Service Associate',
    subtitle: 'Be the First Point of Contact for Customers',
    badge: 'CLERICAL / CUSTOMER SERVICE',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/80',
    image: '/images/banking/banking_ibps_clerk_1787149180592.jpg',
    imageAlt: 'IBPS Clerk Customer Service Associate assisting customer',
    imageLeft: false,
    paragraphs: [
      'The IBPS Clerk recruitment, now associated with the Customer Service Associate role, is an excellent entry point into the banking sector.',
      'Customer Service Associates work closely with customers and support essential branch operations. Their responsibilities may include account services, cash-related activities, documentation, customer requests, and assisting customers with banking products and services.',
      'The role provides practical exposure to how a bank operates while offering a structured path for professional growth.'
    ],
    difference: 'Unlike PO recruitment, the usual Clerk/CSA selection process does not include an interview. Candidates are selected through the examination stages specified for the recruitment cycle.',
    idealFor: 'Candidates who enjoy customer interaction, branch operations, and want to enter the banking sector through a clerical/customer-service position.'
  },
  {
    id: 'section-03',
    number: '03',
    title: 'IBPS RRB Officer Scale I',
    subtitle: 'Build a Career Closer to the Community',
    badge: 'REGIONAL RURAL BANK OFFICER',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    image: '/images/banking/banking_rrb_officer_1787149492894.jpg',
    imageAlt: 'IBPS RRB Officer interacting with rural community',
    imageLeft: true,
    paragraphs: [
      'Regional Rural Banks play an important role in providing banking and financial services to rural and semi-urban communities.',
      'The IBPS RRB Officer Scale I examination is designed for candidates seeking an officer-level position in a Regional Rural Bank.',
      'An Officer Scale I can work across areas such as branch operations, customer services, agricultural and rural banking, credit-related activities, and other banking functions.',
      'The role offers the opportunity to combine a professional banking career with direct exposure to communities and local economic activity.'
    ],
    difference: 'The RRB Officer Scale I role is specifically connected with Regional Rural Banks, giving candidates an opportunity to work in a banking environment focused strongly on rural and semi-urban customers.',
    idealFor: 'Candidates interested in officer-level banking roles and who are comfortable working with rural and semi-urban communities.'
  },
  {
    id: 'section-04',
    number: '04',
    title: 'IBPS RRB Office Assistant',
    subtitle: 'Begin with Strong Banking Fundamentals',
    badge: 'REGIONAL RURAL BANK ASSISTANT',
    badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200/80',
    image: '/images/banking/banking_hero_editorial_1787149136213.jpg',
    imageAlt: 'IBPS RRB Office Assistant branch operations',
    imageLeft: false,
    paragraphs: [
      'The RRB Office Assistant role provides an opportunity to begin a banking career within the Regional Rural Banking ecosystem.',
      'Office Assistants support day-to-day branch activities and interact directly with customers. Their work can involve account-related services, documentation, cash and transaction support, customer assistance, and routine branch operations.',
      'For many candidates, this role provides a practical foundation for understanding banking operations while building valuable professional experience.'
    ],
    difference: 'The position is focused on office and customer-service responsibilities within Regional Rural Banks rather than the officer-level responsibilities associated with Scale I recruitment.',
    idealFor: 'Candidates looking for an accessible entry into banking and who are interested in serving customers in rural and semi-urban regions.'
  },
  {
    id: 'section-05',
    number: '05',
    title: 'IBPS Specialist Officer',
    subtitle: 'Turn Your Specialisation into a Banking Career',
    badge: 'SPECIALISED ROLES',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    image: '/images/banking/banking_ibps_po_1787149162525.jpg',
    imageAlt: 'IBPS Specialist Officer IT & Finance expertise',
    imageLeft: true,
    paragraphs: [
      'Banking is not limited to general banking and customer service. Modern banks also require professionals with expertise in technology, agriculture, law, human resources, marketing, and other specialised fields.',
      'IBPS Specialist Officer recruitment provides opportunities for candidates with specific educational backgrounds to enter banking through specialist positions.',
      'Depending on the recruitment cycle, specialist roles can include IT Officer, Agriculture Field Officer, Law Officer, Rajbhasha Adhikari, HR/Personnel Officer, and Marketing Officer.',
      'Instead of starting with a general banking profile, Specialist Officer candidates bring their existing academic or professional specialisation into the banking environment.'
    ],
    difference: 'The eligibility requirements and examination content are linked to the specific specialist position. Candidates therefore need to meet the educational requirements of the post they are targeting.',
    idealFor: 'Graduates and professionals with a relevant specialist qualification who want to combine their technical or professional expertise with a career in banking.'
  }
];

export default function Banking() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function closeApplyModal() {
    if (isSubmitting) return;
    setShowApplyModal(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormErrors({});
    setIsSubmitted(false);
  }

  async function handleApplySubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!formName.trim()) errs.name = 'Please enter your full name';
    if (!formEmail.trim()) errs.email = 'Please enter your email address';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) errs.email = 'Please enter a valid email address';
    if (!formPhone.trim()) errs.phone = 'Please enter your phone number';

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);

    const payload = {
      course_title: 'Banking',
      button_clicked: 'Apply Now',
      full_name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      terms_accepted: true,
    };

    const { error } = await supabase.from('course_enquiries').insert(payload);

    if (error) {
      setFormErrors({ form: 'Submission failed. Please try again.' });
      setIsSubmitting(false);
      return;
    }

    trackRegister('Banking');
    trackFormSubmit('Banking');

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormErrors({});
  }

  const { data: upcomingImageData } = useQuery({
    queryKey: ['homeSections', 'upcoming_image'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .eq('section_key', 'upcoming_image')
        .maybeSingle();
      if (error) return null;
      return data?.content?.image_url || null;
    },
  });

  const upcomingImage = upcomingImageData || '/images/banking/banking_hero_editorial_1787149136213.jpg';

  function handleBackNavigation(e) {
    if (e) e.preventDefault();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* 1. HERO — EDITORIAL HEADER */}
      <section className="relative bg-white pt-8 pb-12 sm:pb-16 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors mb-6 cursor-pointer group"
          >
            <FiArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-orange transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>

          <Reveal variant="up" className="max-w-4xl mx-auto text-center space-y-10 sm:space-y-12">
            <div className="inline-flex flex-col items-center mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-navy leading-[1.15]">
                Build Your Career in Banking
              </h1>
              <div className="mt-3.5 h-[3px] bg-brand-orange rounded-full w-4/5" />
            </div>

            <p className="text-slate-600 text-base sm:text-lg leading-[1.85] font-normal max-w-3xl mx-auto">
              Banking is one of India's most popular career paths for graduates who are looking for stability, professional growth, and opportunities to work across different areas of financial services. The Institute of Banking Personnel Selection (IBPS) conducts recruitment examinations for several public-sector banking positions. These examinations open doors to roles ranging from customer-facing branch operations to officer-level responsibilities and specialised banking functions. Explore the major IBPS examinations below and find the path that matches your career goals.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. 5 EDITORIAL EXAM SECTIONS */}
      <div className="divide-y divide-slate-200/60">
        {EXAMS.map((exam) => (
          <section
            key={exam.id}
            id={exam.id}
            className={`py-12 sm:py-16 lg:py-20 transition-colors ${
              exam.number === '01' || exam.number === '03' || exam.number === '05'
                ? 'bg-slate-50/60'
                : 'bg-white'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Image Column */}
                <Reveal
                  variant={exam.imageLeft ? 'left' : 'right'}
                  className={`lg:col-span-5 ${exam.imageLeft ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/80 group">
                    <img
                      src={exam.image}
                      alt={exam.imageAlt}
                      className="w-full h-[280px] sm:h-[340px] lg:h-[380px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/40 via-transparent to-transparent opacity-40" />
                  </div>
                </Reveal>

                {/* Content Column */}
                <Reveal
                  variant={exam.imageLeft ? 'right' : 'left'}
                  className={`lg:col-span-7 space-y-5 ${exam.imageLeft ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  {/* Large Editorial Section Number */}
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-brand-orange/80 tracking-tighter leading-none font-mono">
                      {exam.number}
                    </span>
                    <div className="h-0.5 w-10 bg-brand-orange/40 rounded-full" />
                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase border ${exam.badgeStyle}`}>
                      {exam.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-dark-navy leading-tight">
                      {exam.title}
                    </h2>
                    <h3 className="text-sm sm:text-base font-semibold text-brand-blue mt-1">
                      {exam.subtitle}
                    </h3>
                  </div>

                  {/* Controlled Reading Width Paragraphs */}
                  <div className="space-y-3.5 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {exam.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  {/* Clean Editorial Info Blocks */}
                  <div className="grid sm:grid-cols-2 gap-5 pt-4 border-t border-slate-200/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-brand-orange uppercase tracking-wider">
                        <FiTarget className="w-4 h-4 shrink-0 text-brand-orange" />
                        <span>What Makes It Different?</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {exam.difference}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-brand-blue uppercase tracking-wider">
                        <FiCheckCircle className="w-4 h-4 shrink-0 text-brand-blue" />
                        <span>Ideal For</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {exam.idealFor}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* 3. EDITORIAL INFOGRAPHIC FULL-WIDTH CAREER CTA BANNER SECTION */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-[#0a192f] text-white overflow-hidden w-full border-y border-white/10 shadow-lg">
        {/* EMBEDDED HIGH-PERFORMANCE KEYFRAME ANIMATIONS */}
        <style>{`
          @keyframes cta-bg-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes solar-orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes solar-counter {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          .cta-banner-bg {
            background: linear-gradient(135deg, #09172a 0%, #123370 40%, #1e56c7 75%, #0b2042 100%);
            background-size: 200% 200%;
            animation: cta-bg-flow 18s ease-in-out infinite;
          }
          .solar-orbit-ring {
            animation: solar-orbit 24s linear infinite;
          }
          .solar-node-upright {
            animation: solar-counter 24s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .cta-banner-bg, .solar-orbit-ring, .solar-node-upright {
              animation: none !important;
            }
          }
        `}</style>

        {/* LAYER 1: MULTI-TONE NAVY & BLUE GRADIENT */}
        <div className="absolute inset-0 cta-banner-bg pointer-events-none" />

        {/* LAYER 2: SOFT AMBIENT GLOW ORBS */}
        <div className="absolute -top-32 -left-20 w-[450px] h-[450px] rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-[450px] h-[450px] rounded-full bg-brand-orange/20 blur-3xl pointer-events-none" />

        {/* FOREGROUND SITE-CONTAINED CONTENT CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* LEFT COLUMN: SOLAR SYSTEM SPACE THEME GRAPHIC ILLUSTRATION (~50% width) */}
            <Reveal variant="left" className="lg:col-span-6 flex items-center justify-center">
              <div className="relative w-full max-w-md h-[260px] sm:h-[320px] flex items-center justify-center">
                {/* Concentric Solar System Orbit Rings (SVG) */}
                <svg className="absolute inset-0 w-full h-full text-white/20 pointer-events-none" viewBox="0 0 300 300">
                  <circle cx="150" cy="150" r="115" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
                  <circle cx="150" cy="150" r="65" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* CENTRAL CORE PLANET (HIGH-CONTRAST VISIBLE CORE) */}
                <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#1E56C7] border-2 border-brand-orange shadow-[0_0_30px_rgba(30,86,199,0.8)] flex flex-col items-center justify-center p-2 text-center group">
                  <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FiTarget className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white mt-1">
                    Banking
                  </span>
                </div>

                {/* CONTINUOUS ROTATING SOLAR SYSTEM ORBIT CONTAINER */}
                <div className="solar-orbit-ring absolute w-[220px] h-[220px] sm:w-[250px] sm:h-[250px] flex items-center justify-center pointer-events-none">
                  {/* PLANET 1 (TOP / 0°) — FINANCIAL GROWTH */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
                    <div className="solar-node-upright flex flex-col items-center">
                      <div className="w-13 h-13 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg flex flex-col items-center justify-center p-1.5 hover:scale-110 transition-transform bg-gradient-to-b from-white/20 to-white/5">
                        <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center">
                          <FiChevronDown className="w-3.5 h-3.5 text-amber-300 transform rotate-180" />
                        </div>
                        <span className="text-[8px] font-extrabold text-white mt-0.5">Growth</span>
                      </div>
                    </div>
                  </div>

                  {/* PLANET 2 (RIGHT / 90°) — CAREER STABILITY */}
                  <div className="absolute top-1/2 -right-3 -translate-y-1/2 pointer-events-auto">
                    <div className="solar-node-upright flex flex-col items-center">
                      <div className="w-13 h-13 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg flex flex-col items-center justify-center p-1.5 hover:scale-110 transition-transform bg-gradient-to-b from-white/20 to-white/5">
                        <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center">
                          <FiCheckCircle className="w-3.5 h-3.5 text-brand-orange" />
                        </div>
                        <span className="text-[8px] font-extrabold text-white mt-0.5">Stability</span>
                      </div>
                    </div>
                  </div>

                  {/* PLANET 3 (BOTTOM / 180°) — IBPS OFFICER */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto">
                    <div className="solar-node-upright flex flex-col items-center">
                      <div className="w-13 h-13 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg flex flex-col items-center justify-center p-1.5 hover:scale-110 transition-transform bg-gradient-to-b from-white/20 to-white/5">
                        <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center">
                          <FiArrowRight className="w-3.5 h-3.5 text-amber-300 transform -rotate-45" />
                        </div>
                        <span className="text-[8px] font-extrabold text-white mt-0.5">Officer</span>
                      </div>
                    </div>
                  </div>

                  {/* PLANET 4 (LEFT / 270°) — 100% SELECTION */}
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 pointer-events-auto">
                    <div className="solar-node-upright flex flex-col items-center">
                      <div className="w-13 h-13 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg flex flex-col items-center justify-center p-1.5 hover:scale-110 transition-transform bg-gradient-to-b from-white/20 to-white/5">
                        <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center">
                          <span className="text-[9px] font-extrabold text-brand-orange">100%</span>
                        </div>
                        <span className="text-[8px] font-bold text-white mt-0.5">Selection</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FLOATING DECORATIVE DIAMONDS & STAR NODES (◇ ✦) */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono text-amber-300/80 pointer-events-none">✦</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono text-amber-300/80 pointer-events-none">✦</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-300/80 pointer-events-none">◇</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-300/80 pointer-events-none">◇</span>
              </div>
            </Reveal>

            {/* RIGHT COLUMN: HEADING, ORANGE DIVIDER, DESCRIPTION & BUTTON (~50% width) */}
            <Reveal variant="right" className="lg:col-span-6 space-y-4 text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-white leading-[1.16] tracking-tight max-w-[540px]">
                Your Banking Career Starts with <br className="hidden sm:inline" />
                the Right Choice
              </h2>

              {/* Orange Accent Line Divider (Inspired directly by reference image) */}
              <div className="w-20 h-[3.5px] bg-brand-orange rounded-full my-4" />

              <p className="!text-white text-white text-sm sm:text-base leading-relaxed max-w-lg font-medium" style={{ color: '#ffffff' }}>
                Find the banking exam that matches your goals, understand the role, and start preparing with confidence.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  className="group inline-flex items-center gap-2.5 h-[48px] px-7 sm:px-8 bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange/90 hover:to-amber-500/90 text-white rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <span>Explore Banking Paths</span>
                  <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. COURSE HIGHLIGHTS & UPCOMING IMAGE SECTION */}
      <section id="why-prepare-section" className="py-16 sm:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Heading & 4 Course Bullet Points */}
            <Reveal variant="left" className="lg:col-span-7 space-y-6">
                <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-dark-navy leading-tight">
                  Why Prepare for Banking <br />
                  Exams with Us?
                </h2>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Our specialized Banking & IBPS coaching program is designed to build strong concepts, enhance speed and accuracy, and provide end-to-end guidance from Prelims to Final Interviews.
              </p>

              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3.5">
                  <div className="p-1 rounded-full bg-amber-50 border border-amber-200 text-brand-orange mt-0.5 shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-navy text-base sm:text-lg">Comprehensive Syllabus Coverage</h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      In-depth preparation for Quantitative Aptitude, Reasoning Ability, English Language, and General/Banking Awareness.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="p-1 rounded-full bg-amber-50 border border-amber-200 text-brand-orange mt-0.5 shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-navy text-base sm:text-lg">Structured Prelims & Mains Training</h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Targeted strategy covering two-tier objective exams, speed tests, and descriptive paper practice.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="p-1 rounded-full bg-amber-50 border border-amber-200 text-brand-orange mt-0.5 shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-navy text-base sm:text-lg">Expert Banking Faculty & Mentorship</h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Learn directly from experienced competitive exam specialists and former banking professionals.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="p-1 rounded-full bg-amber-50 border border-amber-200 text-brand-orange mt-0.5 shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-navy text-base sm:text-lg">Full-Length Mock Tests & Analytics</h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Regular section-wise speed tests, exam-pattern simulations, and detailed performance tracking.
                    </p>
                  </div>
                </li>
              </ul>
            </Reveal>

            {/* Right Column: Upcoming Image (Same dimensions as Home page) */}
            <Reveal variant="right" className="lg:col-span-5 flex justify-center lg:justify-end self-end mt-8 lg:mt-16">
              <div className="w-full h-[320px] lg:w-[480px] lg:h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-md group">
                <img
                  src={upcomingImage}
                  alt="Banking Course & Upcoming Classes"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS SECTION */}
      <section className="pt-8 pb-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <div className="inline-flex flex-col items-center">
                <h2 className="font-bold text-2xl sm:text-3xl text-dark-navy">Frequently Asked Questions</h2>
                <div className="mt-3 h-[3px] bg-brand-orange rounded-full w-4/5" />
              </div>
            </div>
          </Reveal>

          <Stagger className="space-y-2 mt-12 w-full max-w-4xl mx-auto">
            {FAQS.map((faq, i) => (
              <StaggerItem key={i}>
                <AccordionItem
                  title={faq.question}
                  isOpen={openFaqIndex === i}
                  onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                >
                  <p className="text-gray-500 text-base leading-relaxed pt-2">{faq.answer}</p>
                </AccordionItem>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* APPLY NOW REGISTRATION MODAL */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header — Brand Orange bg-brand-orange */}
              <div className="bg-brand-orange text-white px-6 py-5 flex items-center justify-between relative">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold leading-snug">
                    Enquiry
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-white/20 text-white border border-white/30 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Banking
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <div className="p-6 sm:p-7">
                {isSubmitted ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                      <FiCheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-dark-navy">Application Submitted!</h4>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                      Thank you for applying. Our banking academic advisors will reach out to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={closeApplyModal}
                      className="mt-2 w-full py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    {formErrors.form && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                        {formErrors.form}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                          formErrors.name
                            ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                            : 'border-slate-200 focus:border-brand-blue bg-slate-50/50 focus:bg-white'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                          formErrors.email
                            ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                            : 'border-slate-200 focus:border-brand-blue bg-slate-50/50 focus:bg-white'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                          formErrors.phone
                            ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                            : 'border-slate-200 focus:border-brand-blue bg-slate-50/50 focus:bg-white'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit Application</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
