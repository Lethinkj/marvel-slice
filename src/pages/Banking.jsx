import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiArrowRight, FiTarget } from 'react-icons/fi';
import Reveal, { Stagger, StaggerItem } from '../components/ui/Reveal';
import AccordionItem from '../components/ui/AccordionItem';

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
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors mb-6 cursor-pointer group"
          >
            <FiArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-orange transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>

          <Reveal variant="up" className="max-w-4xl space-y-5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark-navy leading-[1.1] tracking-tight">
              Build Your Career in Banking
            </h1>

            <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-[1.75]">
              <p className="font-medium text-slate-700">
                Banking is one of India's most popular career paths for graduates who are looking for stability, professional growth, and opportunities to work across different areas of financial services.
              </p>
              <p>
                The Institute of Banking Personnel Selection (IBPS) conducts recruitment examinations for several public-sector banking positions. These examinations open doors to roles ranging from customer-facing branch operations to officer-level responsibilities and specialised banking functions.
              </p>
              <p className="text-sm sm:text-base font-semibold text-brand-blue pt-1">
                Explore the major IBPS examinations below and find the path that matches your career goals.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. 5 EDITORIAL EXAM SECTIONS */}
      <div className="divide-y divide-slate-200/60">
        {EXAMS.map((exam) => (
          <section
            key={exam.id}
            id={exam.id}
            className={`py-16 sm:py-24 lg:py-28 transition-colors ${
              exam.number === '01' || exam.number === '03' || exam.number === '05'
                ? 'bg-slate-50/60'
                : 'bg-white'
            }`}
          >
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                {/* Image Column */}
                <Reveal
                  variant={exam.imageLeft ? 'left' : 'right'}
                  className={`lg:col-span-5 ${exam.imageLeft ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 group">
                    <img
                      src={exam.image}
                      alt={exam.imageAlt}
                      className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/40 via-transparent to-transparent opacity-40" />
                  </div>
                </Reveal>

                {/* Content Column */}
                <Reveal
                  variant={exam.imageLeft ? 'right' : 'left'}
                  className={`lg:col-span-7 space-y-6 ${exam.imageLeft ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  {/* Large Editorial Section Number */}
                  <div className="flex items-center gap-4">
                    <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-brand-orange/80 tracking-tighter leading-none font-mono">
                      {exam.number}
                    </span>
                    <div className="h-0.5 w-12 bg-brand-orange/40 rounded-full" />
                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase border ${exam.badgeStyle}`}>
                      {exam.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-navy leading-tight">
                      {exam.title}
                    </h2>
                    <h3 className="text-base sm:text-lg font-bold text-brand-blue mt-1">
                      {exam.subtitle}
                    </h3>
                  </div>

                  {/* Controlled Reading Width Paragraphs */}
                  <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-[1.75] max-w-[680px]">
                    {exam.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  {/* Clean Editorial Info Blocks (No Heavy Cards!) */}
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200/80">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-brand-orange uppercase tracking-wider">
                        <FiTarget className="w-4 h-4 shrink-0 text-brand-orange" />
                        <span>What Makes It Different?</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {exam.difference}
                      </p>
                    </div>

                    <div className="space-y-1.5">
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

      {/* 4. FULL-WIDTH CTA BANNER SECTION */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-[#1B365D] via-[#1E56C7] to-[#1B365D] text-white relative overflow-hidden w-full">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Reveal variant="up" className="max-w-3xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
              Your Banking Career Starts with the Right Choice
            </h2>

            <p className="text-amber-300 font-bold text-base sm:text-lg tracking-wide">
              Understand the role. Know the eligibility. Prepare with purpose.
            </p>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Choose the examination that matches your goals and take the first step toward building a career in banking.
            </p>

            <div className="pt-4 flex justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
              >
                <span>Get Started / Contact Us</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
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
    </div>
  );
}
