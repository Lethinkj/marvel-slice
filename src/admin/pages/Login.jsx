import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-navy-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Marvel Slice</h1>
          <p className="text-white/60 text-sm mt-2">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <h2 className="text-lg font-bold text-dark-navy text-center">Sign In</h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
              placeholder="admin@marvelslice.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                placeholder="Enter password" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-navy transition-colors">
                {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-accent text-white py-2.5 rounded-xl font-semibold hover:bg-brand-blue transition-colors disabled:opacity-50 shadow-sm">
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiLogIn className="w-4 h-4" />
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
