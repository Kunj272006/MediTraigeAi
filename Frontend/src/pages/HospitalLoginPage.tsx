import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginHospital } from '../lib/hospitalAuth';
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export const HospitalLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [hospitalId, setHospitalId] = useState('HOSP-METRO-01');
  const [staffId, setStaffId] = useState('dr.sharma@cityhospital.org');
  const [password, setPassword] = useState('hospital123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const res = loginHospital(hospitalId, staffId, password);
      setIsLoading(false);

      if (res.success) {
        navigate('/staff/dashboard');
      } else {
        setError(res.error || 'Failed to authenticate credentials. Check Hospital ID & password.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-slate-800 font-sans selection:bg-teal-500/15 selection:text-teal-800">
      
      {/* ========================================================= */}
      {/* LEFT HALF (50vw): Cinematic Hospital Visual & Live Telemetry */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden flex-col justify-between p-12 xl:p-16 text-white select-none">
        
        {/* Full-bleed background hospital visual with smooth zoom hover */}
        <img
          src="/hospital_atrium.jpg"
          alt="Modern Hospital Facility"
          className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[0.9] brightness-[0.72] transition-transform duration-1000 hover:scale-105"
        />
        
        {/* Cinematic Gradient Overlays for clinical depth & contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/60" />
        <div className="absolute inset-0 bg-teal-950/20 mix-blend-multiply" />

        {/* Top: Brand Logo Glass Card */}
        <div className="relative z-10 flex items-center animate-fade-in">
          <Link to="/" className="inline-flex items-center group">
            <div className="backdrop-blur-md bg-white/95 px-4 py-2 rounded-2xl shadow-xl border border-white/50 transition-transform group-hover:scale-[1.02]">
              <img
                src="/logo_horizontal.png"
                alt="MEDITRIAGE AI"
                className="h-8 w-auto object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
              />
            </div>
          </Link>
        </div>

        {/* Middle/Bottom: Editorial Slogan */}
        <div className="relative z-10 space-y-4 max-w-lg animate-fade-in-up">
          <h1 className="font-serif text-4xl xl:text-5xl font-normal text-white tracking-tight leading-[1.12]">
            Right Care, <br />
            <span className="italic font-serif text-teal-300">at the Right Time.</span>
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-300 pt-2 border-t border-white/15">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>HIPAA / CDSS Aligned</span>
          </div>
        </div>

        {/* Bottom Left Copyright */}
        <div className="relative z-10 text-[11px] text-slate-400 font-light">
          © 2026 MEDITRIAGE AI Healthcare
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT HALF (50vw): Pristine, Focused Clinical Login Console */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-14 xl:p-18 bg-[#FBFBFA]">
        
        {/* Right Top Header (Mobile Logo + Need Help Modal) */}
        <div className="flex items-center justify-between w-full pb-6">
          <Link to="/" className="lg:hidden flex items-center">
            <img
              src="/logo_horizontal.png"
              alt="MEDITRIAGE AI"
              className="h-8 w-auto object-contain"
              style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
            />
          </Link>

          <div />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors"
            >
              <span>Need help?</span>
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </button>

            {showHelp && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 text-xs text-slate-600 space-y-2 z-50 animate-fade-in">
                <span className="font-bold text-slate-900 block">Hospital Access Assistance</span>
                <p>For credential issues, doctor/nurse staff assignment, or license renewals, contact your hospital administrator.</p>
                <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-teal-700">
                  Email: support@meditriage.ai
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Centered Login Card Form */}
        <div className="max-w-[420px] w-full mx-auto my-auto py-8 animate-fade-in-up">
          
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight">
                Welcome back
              </h2>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              
              {/* Input 1: Unique Hospital ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Unique Hospital ID
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value.toUpperCase())}
                    placeholder="e.g. HOSP-METRO-01"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-3 focus:ring-teal-700/10 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Input 2: Staff ID / Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Staff ID / Care Team Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="dr.sharma@cityhospital.org"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-3 focus:ring-teal-700/10 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Input 3: Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-3 focus:ring-teal-700/10 shadow-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-700 border-slate-300 focus:ring-teal-700"
                  />
                  <span>Remember device</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset verification dispatched to registered administrator email.')}
                  className="font-medium text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-apple hover:shadow-apple-hover transition-all mt-3 disabled:opacity-50 group"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Workstation'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

            </form>

          </div>

        </div>

        <div />

      </div>

    </div>
  );
};
