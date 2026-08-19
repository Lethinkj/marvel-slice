import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiCompass, FiArrowRight, FiTarget } from 'react-icons/fi';
import Reveal from '../components/ui/Reveal';

const EXAMS = [
  {
    number: "01",
    title: "IBPS PO / MT",
    subtitle: "Start Your Journey as a Bank Officer",
    description: [
      "The IBPS Probationary Officer / Management Trainee examination is one of the most sought-after banking examinations for graduates who want to begin their career in an officer-level position.",
      "A Probationary Officer is exposed to different areas of banking during the early stages of their career. The role can involve customer service, account operations, loans and credit, branch administration, financial products, and day-to-day banking activities.",
      "It is a strong choice for candidates who want a career with responsibility, structured growth, and opportunities to move into higher managerial positions."
    ],
    difference: "The PO pathway is designed for candidates aiming directly for an officer role. It generally involves a Preliminary Examination, Main Examination, and Interview.",
    idealFor: "Graduates who want leadership responsibilities, career progression, and a long-term career in banking.",
    badge: "Officer Level",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    number: "02",
    title: "IBPS Clerk / Customer Service Associate",
    subtitle: "Be the First Point of Contact for Customers",
    description: [
      "The IBPS Clerk recruitment, now associated with the Customer Service Associate role, is an excellent entry point into the banking sector.",
      "Customer Service Associates work closely with customers and support essential branch operations. Their responsibilities may include account services, cash-related activities, documentation, customer requests, and assisting customers with banking products and services.",
      "The role provides practical exposure to how a bank operates while offering a structured path for professional growth."
    ],
    difference: "Unlike PO recruitment, the usual Clerk/CSA selection process does not include an interview. Candidates are selected through the examination stages specified for the recruitment cycle.",
    idealFor: "Candidates who enjoy customer interaction, branch operations, and want to enter the banking sector through a clerical/customer-service position.",
    badge: "Clerical / Customer Service",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    number: "03",
    title: "IBPS RRB Officer Scale I",
    subtitle: "Build a Career Closer to the Community",
    description: [
      "Regional Rural Banks play an important role in providing banking and financial services to rural and semi-urban communities.",
      "The IBPS RRB Officer Scale I examination is designed for candidates seeking an officer-level position in a Regional Rural Bank.",
      "An Officer Scale I can work across areas such as branch operations, customer services, agricultural and rural banking, credit-related activities, and other banking functions.",
      "The role offers the opportunity to combine a professional banking career with direct exposure to communities and local economic activity."
    ],
    difference: "The RRB Officer Scale I role is specifically connected with Regional Rural Banks, giving candidates an opportunity to work in a banking environment focused strongly on rural and semi-urban customers.",
    idealFor: "Candidates interested in officer-level banking roles and who are comfortable working with rural and semi-urban communities.",
    badge: "Regional Rural Bank Officer",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    number: "04",
    title: "IBPS RRB Office Assistant",
    subtitle: "Begin with Strong Banking Fundamentals",
    description: [
      "The RRB Office Assistant role provides an opportunity to begin a banking career within the Regional Rural Banking ecosystem.",
      "Office Assistants support day-to-day branch activities and interact directly with customers. Their work can involve account-related services, documentation, cash and transaction support, customer assistance, and routine branch operations.",
      "For many candidates, this role provides a practical foundation for understanding banking operations while building valuable professional experience."
    ],
    difference: "The position is focused on office and customer-service responsibilities within Regional Rural Banks rather than the officer-level responsibilities associated with Scale I recruitment.",
    idealFor: "Candidates looking for an accessible entry into banking and who are interested in serving customers in rural and semi-urban regions.",
    badge: "Regional Rural Bank Assistant",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    number: "05",
    title: "IBPS Specialist Officer",
    subtitle: "Turn Your Specialisation into a Banking Career",
    description: [
      "Banking is not limited to general banking and customer service. Modern banks also require professionals with expertise in technology, agriculture, law, human resources, marketing, and other specialised fields.",
      "IBPS Specialist Officer recruitment provides opportunities for candidates with specific educational backgrounds to enter banking through specialist positions.",
      "Depending on the recruitment cycle, specialist roles can include IT Officer, Agriculture Field Officer, Law Officer, Rajbhasha Adhikari, HR/Personnel Officer, and Marketing Officer.",
      "Instead of starting with a general banking profile, Specialist Officer candidates bring their existing academic or professional specialisation into the banking environment."
    ],
    difference: "The eligibility requirements and examination content are linked to the specific specialist position. Candidates therefore need to meet the educational requirements of the post they are targeting.",
    idealFor: "Graduates and professionals with a relevant specialist qualification who want to combine their technical or professional expertise with a career in banking.",
    badge: "Specialised Roles",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200"
  }
];

export default function Banking() {
  const navigate = useNavigate();

  function handleBackNavigation(e) {
    if (e) e.preventDefault();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 sm:pb-24">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200/80 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-orange transition-colors mb-6 cursor-pointer group"
          >
            <FiArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-orange transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>

          <Reveal variant="up" className="max-w-4xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-orange/10 text-brand-orange border border-brand-orange/20 mb-4">
              <FiCompass className="w-3.5 h-3.5" /> Career Path & Examination Guide
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-navy leading-tight mb-4">
              Banking
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-blue mb-6">
              Build Your Career in Banking
            </h2>
            <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed">
              <p>
                Banking is one of India's most popular career paths for graduates who are looking for stability, professional growth, and opportunities to work across different areas of financial services.
              </p>
              <p>
                The Institute of Banking Personnel Selection (IBPS) conducts recruitment examinations for several public-sector banking positions. These examinations open doors to roles ranging from customer-facing branch operations to officer-level responsibilities and specialised banking functions.
              </p>
              <p>
                Whether you're starting your preparation from scratch or looking for the right exam to target, understanding the different IBPS opportunities is the first step.
              </p>
              <p className="font-semibold text-slate-800">
                Explore the major IBPS examinations below and find the path that matches your career goals.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Examinations Cards List */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          {EXAMS.map((exam) => (
            <Reveal
              key={exam.number}
              variant="up"
              className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-6 sm:p-8 lg:p-10"
            >
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <span className="text-2xl sm:text-3xl font-black text-brand-orange bg-amber-50 border border-amber-200/80 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                    {exam.number}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy">
                        {exam.title}
                      </h2>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${exam.badgeBg}`}>
                        {exam.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-brand-blue">
                      {exam.subtitle}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {exam.description.map((p, idx) => (
                  <p key={idx} className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <FiTarget className="w-4 h-4 text-brand-orange" />
                    <span>What makes it different?</span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed font-normal">
                    {exam.difference}
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <FiCheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Ideal for</span>
                  </div>
                  <p className="text-blue-950 text-sm leading-relaxed font-medium">
                    {exam.idealFor}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Summary & Guidance Section */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal variant="up" className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy">
              Find the Path That Fits You
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Every banking career begins with choosing the right entry point.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-brand-orange uppercase tracking-wider block">Officer Roles</span>
                <p className="text-slate-700 text-sm leading-relaxed">
                  If you want an officer-level career, <strong className="text-dark-navy">IBPS PO/MT</strong> and <strong className="text-dark-navy">RRB Officer Scale I</strong> are strong options to explore.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">Branch Operations</span>
                <p className="text-slate-700 text-sm leading-relaxed">
                  If you prefer customer service and branch operations, <strong className="text-dark-navy">IBPS Clerk/CSA</strong> and <strong className="text-dark-navy">RRB Office Assistant</strong> provide direct entry routes into banking.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Specialised Expertise</span>
                <p className="text-slate-700 text-sm leading-relaxed">
                  If you already have a specialised academic background, <strong className="text-dark-navy">IBPS Specialist Officer</strong> can help you take that expertise into the banking sector.
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-base leading-relaxed pt-2">
              The right choice depends on your qualification, interests, preferred work environment, and long-term career goals.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="pt-12 sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal variant="up" className="bg-gradient-to-r from-[#1B365D] via-[#1E56C7] to-[#1B365D] rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                Your Banking Career Starts with the Right Choice
              </h2>
              <p className="text-amber-300 font-bold text-base sm:text-lg tracking-wide uppercase">
                Understand the role. Know the eligibility. Prepare with purpose.
              </p>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Choose the examination that matches your goals and take the first step toward building a career in banking.
              </p>
              <div className="pt-4 flex justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
                >
                  Get Started / Contact Us <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
