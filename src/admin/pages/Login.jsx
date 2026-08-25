import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSupabase';
import { trackLogin } from '../../lib/analytics';
import { SubmitButton } from '../components/FormButtons';
import { FiEye, FiEyeOff, FiLogIn, FiMail, FiLock, FiAlertCircle, FiShield, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation and touch states
  const [touched, setTouched] = useState({ email: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  // Check if session was expired on mount
  useEffect(() => {
    if (sessionStorage.getItem('admin_session_expired') === 'true') {
      setSessionExpiredMsg('Your session has expired due to 15 minutes of inactivity. Please sign in again.');
      sessionStorage.removeItem('admin_session_expired');
    }
  }, []);

  // Validation functions
  function validateEmailStr(val) {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address (e.g. admin@marvelslice.com).';
    return '';
  }

  function validatePasswordStr(val) {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    return '';
  }

  // Live validation handlers
  function handleEmailChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmailStr(val) }));
    }
  }

  function handlePasswordChange(e) {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePasswordStr(val) }));
    }
  }

  function handleBlur(field) {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setFieldErrors(prev => ({ ...prev, email: validateEmailStr(email) }));
    } else if (field === 'password') {
      setFieldErrors(prev => ({ ...prev, password: validatePasswordStr(password) }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSessionExpiredMsg('');

    setTouched({ email: true, password: true });

    const emailErr = validateEmailStr(email);
    const passErr = validatePasswordStr(password);
    setFieldErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) {
      setError('Please fix the errors below to continue.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      trackLogin('admin');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  const logoUrl = settings?.logo_url;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-brand-blue selection:text-white">
      {/* Background Decorative Circles with Website Accent Colors */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />

      {/* Left Column: Website Brand Showcase (visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-slate-200/80 bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40">
        {/* Website Header Logo & Alignment */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          {logoUrl && (
            <img src={logoUrl} alt="Marvel Slice" className="h-12 w-auto object-contain drop-shadow-sm" />
          )}
          <span className="text-2xl font-extrabold text-brand-blue tracking-tight">
            Marvel <span className="text-brand-orange">Slice</span>
          </span>
          <span className="ml-2 px-2.5 py-0.5 rounded-md bg-blue-100/80 text-brand-blue text-xs font-bold uppercase tracking-wider border border-blue-200/60">
            Admin
          </span>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="my-auto max-w-lg space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-brand-blue text-xs font-bold uppercase tracking-wider shadow-xs">
            <FiShield className="w-4 h-4 text-brand-blue" />
            Centralized Control Center
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Manage & Grow Your <span className="text-brand-blue">Marvel</span> <span className="text-brand-orange">Slice</span> Platform
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            Welcome to the administrator portal. Control website content, monitor user submissions, update course listings, and track live analytics effortlessly.
          </p>

          {/* Key Feature Cards */}
          <div className="space-y-3 pt-2">
            {[
              "Real-time analytics & course management",
              "Inquiries, brochure downloads & form submissions",
              "Enterprise-grade role-based access & security"
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3 text-slate-700 text-sm font-semibold shadow-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer Text & Alignment */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xs text-slate-500 flex items-center justify-between pt-6 border-t border-slate-200/60"
        >
          <span>© {new Date().getFullYear()} Marvel Slice. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System Operational
          </span>
        </motion.div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile Header Logo & Text Alignment */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-3 mb-2">
              {logoUrl && (
                <img src={logoUrl} alt="Marvel Slice" className="h-12 w-auto object-contain drop-shadow-sm" />
              )}
              <span className="text-2xl font-extrabold text-brand-blue">
                Marvel <span className="text-brand-orange">Slice</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Sign in to your admin panel</p>
          </div>

          {/* Form Card styled to match Website Card Theme */}
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-2xl p-8 sm:p-10 space-y-6 relative">
            <div className="hidden lg:block space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Sign In</h2>
              <p className="text-slate-500 text-sm">Enter your administrator credentials to access your dashboard</p>
            </div>

            {/* Session Expired Banner */}
            {sessionExpiredMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3 text-amber-800 text-sm"
              >
                <FiClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{sessionExpiredMsg}</div>
              </motion.div>
            )}

            {/* General Submission Error Banner */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3 text-rose-700 text-sm"
              >
                <FiAlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-snug">{error}</div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiMail className={`w-4 h-4 ${touched.email && fieldErrors.email ? 'text-rose-500' : ''}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    autoFocus
                    placeholder="admin@marvelslice.com"
                    className={`w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 ${
                      touched.email && fieldErrors.email 
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500' 
                        : 'border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue'
                    }`}
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <p className="text-rose-600 text-xs flex items-center gap-1.5 mt-1 font-medium">
                    <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiLock className={`w-4 h-4 ${touched.password && fieldErrors.password ? 'text-rose-500' : ''}`} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••••••"
                    className={`w-full h-11 pl-10 pr-11 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 ${
                      touched.password && fieldErrors.password 
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500' 
                        : 'border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="text-rose-600 text-xs flex items-center gap-1.5 mt-1 font-medium">
                    <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Submit Button styled with Website Brand Blue Theme */}
              <div className="pt-2">
                <SubmitButton 
                  type="submit" 
                  saving={loading} 
                  savingLabel="Signing in..." 
                  label="Sign In to Dashboard" 
                  icon={FiLogIn} 
                  className="w-full !h-11 !rounded-xl !bg-brand-blue hover:!bg-blue-700 !text-white !font-semibold shadow-md shadow-brand-blue/20 transition-all duration-200" 
                />
              </div>
            </form>

            {/* Security Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <FiShield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted SSL Session</span>
              </span>
              <span className="text-slate-400">
                Authorized Personnel Only
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
