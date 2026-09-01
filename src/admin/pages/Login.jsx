import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSupabase';
import { trackLogin } from '../../lib/analytics';
import { 
  FiEye, FiEyeOff, FiAlertCircle, 
  FiShield, FiClock, FiX, FiLock
} from 'react-icons/fi';

/* ========================================================= */
/* MODULAR FORGOT PASSWORD MODAL                             */
/* ========================================================= */
function ForgotPasswordModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full text-center space-y-5 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#5B4DF5] flex items-center justify-center mx-auto">
          <FiLock className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Reset Administrator Password</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            For security reasons, password resets must be issued by the Super Administrator. Please contact support at <strong>support@marvelslice.com</strong>.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4E40E5] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

/* ========================================================= */
/* MAIN LOGIN PAGE CONTAINER                                 */
/* ========================================================= */
export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const logoUrl = settings?.logo_url || "/apple-touch-icon.png";

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({ email: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  const [ipBlocked, setIpBlocked] = useState(false);
  const [ipBlockRemaining, setIpBlockRemaining] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('admin_session_expired') === 'true') {
      setSessionExpiredMsg('Your session has expired due to inactivity. Please sign in again.');
      sessionStorage.removeItem('admin_session_expired');
    }

    const checkLockout = () => {
      const blockedUntil = parseInt(localStorage.getItem('admin_ip_blocked_until') || '0', 10);
      if (blockedUntil && Date.now() < blockedUntil) {
        setIpBlocked(true);
        const minsLeft = Math.ceil((blockedUntil - Date.now()) / (60 * 1000));
        setIpBlockRemaining(minsLeft);
      } else {
        setIpBlocked(false);
        localStorage.removeItem('admin_ip_blocked_until');
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 10000);
    return () => clearInterval(interval);
  }, []);

  function validateEmailStr(val) {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address.';
    return '';
  }

  function validatePasswordStr(val) {
    if (!val) return 'Password is required.';
    return '';
  }

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

    const blockedUntil = parseInt(localStorage.getItem('admin_ip_blocked_until') || '0', 10);
    if (blockedUntil && Date.now() < blockedUntil) {
      const minsLeft = Math.ceil((blockedUntil - Date.now()) / (60 * 1000));
      setError(`Your IP address is temporarily blocked for ${minsLeft} more minutes due to multiple failed login attempts.`);
      return;
    }

    setTouched({ email: true, password: true });

    const emailErr = validateEmailStr(email);
    const passErr = validatePasswordStr(password);
    setFieldErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) return;

    setLoading(true);
    try {
      await login(email.trim(), password, false);
      trackLogin('admin');
      localStorage.removeItem('admin_failed_attempts');
      localStorage.removeItem('admin_ip_blocked_until');
      navigate('/admin', { replace: true });
    } catch (err) {
      const errMsg = err.message || 'Invalid email or password. Please try again.';
      
      const attempts = (parseInt(localStorage.getItem('admin_failed_attempts') || '0', 10)) + 1;
      localStorage.setItem('admin_failed_attempts', String(attempts));

      if (attempts >= 5 || errMsg.toLowerCase().includes('blocked') || errMsg.toLowerCase().includes('locked')) {
        const lockoutTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('admin_ip_blocked_until', String(lockoutTime));
        setIpBlocked(true);
        setIpBlockRemaining(15);
        setError('Your IP address has been blocked for 15 minutes due to multiple failed login attempts.');
      } else {
        setError(`${errMsg} (${5 - attempts} attempts remaining before IP lockout)`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#5D64F5] via-[#6C73FF] to-[#888EFF] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden font-sans selection:bg-[#5B4DF5] selection:text-white">
      
      {/* Background Organic Wave Layers & Ambience */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full bg-[#4046D4]/40 blur-3xl pointer-events-none" />
      
      {/* Top Right Decorative Dot Matrix Grid */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-25 hidden sm:block"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFFFFF 1.75px, transparent 1.75px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Decorative Wave Curves */}
      <svg className="absolute bottom-0 left-0 w-full h-80 pointer-events-none opacity-20" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
        <path d="M0,96L80,117.3C160,139,320,181,480,181.3C640,181,800,139,960,133.3C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" fill="#FFFFFF" />
      </svg>

      {/* Main 2-Column Focus-Style Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[1000px] min-h-[560px] bg-white rounded-3xl sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(30,40,120,0.3)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-20"
      >
        
        {/* ===================================================== */}
        {/* LEFT COLUMN: Logo & Isometric 3D Security Graphic     */}
        {/* ===================================================== */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#EEF2FF] via-[#F4F7FE] to-[#F8FAFC] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
          
          {/* Top Brand Logo */}
          <div className="flex items-center gap-2.5 z-10">
            <img
              src={logoUrl || "/apple-touch-icon.png"}
              alt="Marvel Slice"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="text-xl font-extrabold tracking-tight text-brand-blue">
              Marvel <span className="text-brand-orange">Slice</span>
            </span>
          </div>

          {/* Center Isometric 3D Illustration */}
          <div className="my-auto py-6 sm:py-8 flex items-center justify-center relative w-full">
            <svg viewBox="0 0 460 380" className="w-full max-w-[390px] drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Gradients */}
                <linearGradient id="screenFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="60%" stopColor="#5B56F6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="checkBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
                <linearGradient id="coralCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
                <linearGradient id="lockFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <filter id="docCardShadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="-2" dy="6" stdDeviation="5" floodColor="#3B4265" floodOpacity="0.15" />
                </filter>
                <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0D9488" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* 1. Isometric Floor Platforms & Scattered Diamond Tiles */}
              <g opacity="0.85">
                {/* Main Ground Soft Shading */}
                <path d="M230,350 L380,260 L230,175 L80,260 Z" fill="#E8EEFC" opacity="0.6" />
                <path d="M220,335 L350,255 L220,180 L90,255 Z" fill="#EEF3FE" opacity="0.8" />

                {/* Floating Isometric Diamonds */}
                <path d="M60,195 L95,175 L60,155 L25,175 Z" fill="#DDE6FC" opacity="0.75" />
                <path d="M120,345 L155,325 L120,305 L85,325 Z" fill="#DDE6FC" opacity="0.8" />
                <path d="M380,180 L415,160 L380,140 L345,160 Z" fill="#DDE6FC" opacity="0.75" />
                <path d="M430,270 L465,250 L430,230 L395,250 Z" fill="#E2EBFE" opacity="0.6" />
                <path d="M270,360 L300,343 L270,325 L240,343 Z" fill="#E2EBFE" opacity="0.7" />
                <path d="M190,135 L220,118 L190,100 L160,118 Z" fill="#E2EBFE" opacity="0.5" />
              </g>

              {/* 2. Main 3D Standing Screen (Isometric View) */}
              <g>
                {/* Screen Floor Shadow */}
                <path d="M100,295 L270,195 L310,218 L140,318 Z" fill="#C5D3F8" opacity="0.4" />

                {/* Screen 3D Back Frame / Thickness */}
                <path d="M90,270 L260,172 L260,62 L90,160 Z" fill="#2563EB" opacity="0.9" />
                <path d="M90,160 L260,62 L275,70 L105,168 Z" fill="#93C5FD" />
                <path d="M90,270 L105,278 L105,168 L90,160 Z" fill="#1D4ED8" />

                {/* Screen White Outer Border Frame */}
                <path d="M100,275 L270,177 L270,67 L100,165 Z" fill="#FFFFFF" />

                {/* Inner Screen Display (Gradient Blue) */}
                <path d="M106,268 L264,177 L264,76 L106,167 Z" fill="url(#screenFaceGrad)" />

                {/* Screen Header White Bar */}
                <path d="M106,167 L264,76 L264,98 L106,189 Z" fill="#FFFFFF" opacity="0.15" />

                {/* Avatar Placeholder Container (Left side of screen) */}
                <path d="M120,242 L165,216 L165,152 L120,178 Z" fill="#3B82F6" opacity="0.45" />
                <path d="M120,242 L165,216 L165,152 L120,178 Z" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
                
                {/* User Avatar Inside Container */}
                <ellipse cx="142" cy="178" rx="10" ry="11" fill="#FFFFFF" opacity="0.85" />
                <path d="M127,222 C127,205 157,205 157,222 Z" fill="#FFFFFF" opacity="0.85" />

                {/* Content Indicator Bars (Right side of screen) */}
                <path d="M180,148 L248,109" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
                <path d="M180,170 L238,137" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
                <path d="M180,188 L225,162" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />

                {/* Lower Thin Accent Line */}
                <path d="M180,210 L250,170" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
              </g>

              {/* 3. Floating Verified Checkmark Badge (Top-Left corner of screen) */}
              <g filter="url(#badgeShadow)">
                <circle cx="98" cy="155" r="23" fill="#FFFFFF" />
                <circle cx="98" cy="155" r="20" fill="url(#checkBadgeGrad)" />
                <path d="M89,155 L95,161 L108,148" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              {/* 4. 3D Cyan / Turquoise Padlock (Sitting on Right) */}
              <g>
                {/* Lock Shadow */}
                <path d="M280,265 L360,218 L385,232 L305,280 Z" fill="#C5D3F8" opacity="0.5" />

                {/* Metallic Lock Shackle (3D Arched Bar) */}
                <path d="M315,195 C315,145 358,145 358,195" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M315,195 C315,145 358,145 358,195" stroke="#F1F5F9" strokeWidth="7" strokeLinecap="round" fill="none" />

                {/* Padlock 3D Box Body */}
                {/* Left Side Extrusion */}
                <path d="M292,246 L312,234 L312,178 L292,190 Z" fill="#0891B2" />
                {/* Top Side Extrusion */}
                <path d="M292,190 L312,178 L374,214 L354,226 Z" fill="#67E8F9" />
                {/* Front Face (Facing right-isometric) */}
                <path d="M312,234 L374,198 L374,256 L312,292 Z" fill="url(#lockFrontGrad)" />

                {/* Keyhole */}
                <circle cx="343" cy="242" r="5" fill="#0E7490" />
                <path d="M343,244 L343,256" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* 5. Standing White Document Sheet (Front-Left Foreground) */}
              <g filter="url(#docCardShadow)">
                {/* Paper Body */}
                <path d="M125,248 C125,248 178,217 178,217 L178,318 C178,318 132,345 125,340 C120,336 125,248 125,248 Z" fill="#FFFFFF" />
                
                {/* Orange Header Strip on Document */}
                <path d="M135,252 L170,232" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />

                {/* Document Grey Text Lines */}
                <path d="M135,268 L165,251" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                <path d="M135,282 L162,266" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                <path d="M135,296 L158,283" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

                {/* Cyan Action Pill at Bottom of Document */}
                <path d="M144,318 L158,310" stroke="#06B6D4" strokeWidth="4.5" strokeLinecap="round" />
              </g>

              {/* 6. Flat Coral ID Card (Floor Foreground) */}
              <g>
                {/* Card Shadow */}
                <path d="M218,272 L285,233 L325,256 L258,295 Z" fill="#FCA5A5" opacity="0.35" />

                {/* Card Thickness */}
                <path d="M212,267 L252,290 L252,295 L212,272 Z" fill="#BE123C" />
                <path d="M252,290 L318,252 L318,257 L252,295 Z" fill="#E11D48" />

                {/* Card Top Face */}
                <path d="M212,267 L278,229 L318,252 L252,290 Z" fill="url(#coralCardGrad)" />

                {/* Card Profile Elements */}
                <circle cx="245" cy="260" r="7.5" fill="#FFFFFF" opacity="0.9" />
                <path d="M260,250 L298,242" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                <path d="M260,260 L290,254" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              </g>
            </svg>
          </div>

          <div />
        </div>

        {/* ===================================================== */}
        {/* RIGHT COLUMN: Modern Clean Login Form                 */}
        {/* ===================================================== */}
        <div className="md:col-span-7 bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          
          {/* Welcome Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Welcome to <span className="text-brand-blue">Marvel</span> <span className="text-brand-orange">Slice</span>!
            </h1>
          </div>

          {/* IP Lockout Warning Banner */}
          {ipBlocked && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-left space-y-0.5"
            >
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <FiShield className="w-4 h-4 shrink-0 text-rose-600" />
                <span>IP ACCESS BLOCKED (15 MIN LOCKOUT)</span>
              </div>
              <p className="text-xs text-rose-600 leading-snug">
                Access from your IP address / device has been temporarily blocked for {ipBlockRemaining || 15} minutes due to multiple failed login attempts.
              </p>
            </motion.div>
          )}

          {/* Session Expired Banner */}
          {sessionExpiredMsg && !ipBlocked && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs font-medium text-left"
            >
              <FiClock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{sessionExpiredMsg}</div>
            </motion.div>
          )}

          {/* Error Alert Banner */}
          {error && !ipBlocked && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-[#FFF0F2] border border-[#FFD0D6] rounded-xl flex items-start gap-2.5 text-left"
            >
              <FiAlertCircle className="w-4 h-4 text-[#FF3B5C] shrink-0 mt-0.5" />
              <div className="text-xs font-semibold text-[#E02444] leading-snug">
                {error}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            
            {/* Email Address Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                disabled={ipBlocked || loading}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                placeholder="admin@marvelslice.com"
                className={`w-full h-12 px-4 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-2xs disabled:opacity-50 disabled:bg-slate-50 ${
                  touched.email && fieldErrors.email 
                    ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500' 
                    : 'border-slate-200 focus:ring-4 focus:ring-[#5B4DF5]/15 focus:border-[#5B4DF5]'
                }`}
              />
              {touched.email && fieldErrors.email && (
                <p className="text-rose-600 text-xs flex items-center gap-1 mt-1 font-medium">
                  <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  disabled={ipBlocked || loading}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-4 pr-11 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-2xs disabled:opacity-50 disabled:bg-slate-50 ${
                    touched.password && fieldErrors.password 
                      ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500' 
                      : 'border-slate-200 focus:ring-4 focus:ring-[#5B4DF5]/15 focus:border-[#5B4DF5]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p className="text-rose-600 text-xs flex items-center gap-1 mt-1 font-medium">
                  <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Actions: Forgot Password on Left, Login Button on Right */}
            <div className="pt-3 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs font-semibold text-[#5B4DF5] hover:text-[#4E40E5] hover:underline transition-all cursor-pointer"
              >
                Forgot password?
              </button>

              <button
                type="submit"
                disabled={loading || ipBlocked}
                className="px-9 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#5B4DF5] to-[#7B61FF] hover:brightness-105 active:scale-95 text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[#5B4DF5]/30 hover:shadow-xl hover:shadow-[#5B4DF5]/40 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : ipBlocked ? (
                  <span>Access Blocked ({ipBlockRemaining || 15}m)</span>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>
          </form>

        </div>

      </motion.div>

      {/* Forgot Password Modal Component */}
      <ForgotPasswordModal open={forgotModalOpen} onClose={() => setForgotModalOpen(false)} />
    </div>
  );
}
