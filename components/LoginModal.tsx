import React, { useState } from 'react';
import { X, Lock, Mail, Sparkles, CheckCircle, Shield, Zap, BarChart } from './Icons';
import getApiUrl from '../services/apiConfig';
import { GoogleLogin } from '@react-oauth/google';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: { email: string }) => void;
}

const FEATURES = [
  { icon: Zap,       text: 'Unlimited AI-powered pharma queries' },
  { icon: BarChart,  text: 'Live GLP-1 market intelligence & charts' },
  { icon: Shield,    text: 'Patent analysis & clinical trial data' },
  { icon: CheckCircle, text: 'Export reports in PDF, Excel & PPT' },
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (isRegister && password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (isRegister && password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res  = await fetch(`${getApiUrl()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google Authentication failed');
      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong with Google Login');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => { setIsRegister(r => !r); setError(''); };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
      <style>{`
        @keyframes loginFadeIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.08)} }
        .login-card { animation: loginFadeIn 0.28s cubic-bezier(.16,1,.3,1) both; }
        .grad-bg { background: linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0c2a4a 100%); }
        .input-field { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; transition: all .2s; }
        .input-field::placeholder { color: rgba(255,255,255,0.35); }
        .input-field:focus { background: rgba(255,255,255,0.1); border-color: rgba(99,179,237,0.7); box-shadow: 0 0 0 3px rgba(99,179,237,0.15); outline: none; }
        .input-field:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #1e293b inset; -webkit-text-fill-color: #fff; }
        .cta-btn { background: linear-gradient(135deg,#0ea5e9,#6366f1); transition: all .2s; }
        .cta-btn:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.45); }
        .cta-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .orb1 { animation: floatOrb 6s ease-in-out infinite; }
        .orb2 { animation: floatOrb 8s ease-in-out infinite 2s; }
        .orb3 { animation: floatOrb 7s ease-in-out infinite 4s; }
      `}</style>

      <div className="login-card w-full max-w-[900px] rounded-3xl overflow-hidden shadow-2xl flex" style={{ minHeight: 560 }}>

        {/* ── LEFT PANEL — Branding ───────────────────────────────── */}
        <div className="grad-bg relative hidden md:flex flex-col justify-between w-[42%] flex-shrink-0 p-8 overflow-hidden">

          {/* Floating orbs */}
          <div className="orb1 absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#6366f1,transparent 70%)' }} />
          <div className="orb2 absolute -bottom-20 -right-10 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle,#0ea5e9,transparent 70%)' }} />
          <div className="orb3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#a855f7,transparent 70%)' }} />

          {/* Logo + brand */}
          <div className="relative z-10">
            <img
              src="/cc-logo-dark.png"
              alt="CureCoders"
              style={{ width: 220, height: 'auto', maxHeight: 72, objectFit: 'contain' }}
            />
          </div>

          {/* Headline */}
          <div className="relative z-10">
            <h2 className="text-white font-black text-2xl leading-tight mb-3">
              Unlock the Power of<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#38bdf8,#a78bfa)' }}>
                AI Drug Research
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The world's most advanced pharma market intelligence platform — powered by multi-agent AI.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-slate-300 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badge */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
              <img src="/cc-icon.png" alt="" className="w-7 h-7 rounded-lg object-contain flex-shrink-0" />
              <div className="flex -space-x-1.5">
                {['SC','MT','EW','JP'].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-[8px] font-bold text-white border border-white/20">{i[0]}</div>
                ))}
              </div>
              <p className="text-slate-300 text-[11px]"><span className="text-white font-semibold">2,400+</span> pharma researchers trust CureCoders</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Form ──────────────────────────────────── */}
        <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col justify-center px-8 py-10 relative">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mobile logo */}
          <div className="flex md:hidden mb-5">
            <img src="/cc-logo-light.png" alt="CureCoders" style={{ width: 180, height: 'auto', maxHeight: 56, objectFit: 'contain' }} />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {isRegister
                ? 'Start your free pharma intelligence journey'
                : 'Sign in to access your research dashboard'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
              <span className="text-base">⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" style={{ width: 18, height: 18 }} />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" style={{ width: 18, height: 18 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold px-1"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Confirm Password — register only */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" style={{ width: 18, height: 18 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-400 dark:border-red-600'
                        : confirmPassword && confirmPassword === password
                        ? 'border-green-400 dark:border-green-600'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${confirmPassword === password ? 'text-green-500' : 'text-red-500'}`}>
                      {confirmPassword === password ? '✓' : '✗'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Password strength indicator for register */}
            {isRegister && password.length > 0 && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(level => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        password.length >= level * 2
                          ? level <= 1 ? 'bg-red-500' : level <= 2 ? 'bg-orange-500' : level <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  {password.length < 3 ? 'Too short' : password.length < 5 ? 'Weak' : password.length < 7 ? 'Fair' : 'Strong password ✓'}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="cta-btn w-full flex items-center justify-center gap-2.5 py-3.5 text-white font-bold rounded-xl text-sm mt-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{isRegister ? 'Creating account…' : 'Signing in…'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isRegister ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="flex justify-center mb-5 w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="outline"
              size="large"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Switch mode */}
          <div className="text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={switchMode}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-2 hover:underline transition"
            >
              {isRegister ? 'Sign In' : 'Sign Up Free'}
            </button>
          </div>

          {/* Fine print */}
          {isRegister && (
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
              By creating an account, you agree to our{' '}
              <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>.
              <br />No credit card required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
