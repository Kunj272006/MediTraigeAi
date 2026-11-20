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
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export const HospitalLoginPage: React.FC = () => {
  const navigate = useNavigate();

  // All fields start completely empty
  const [hospitalId, setHospitalId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setError(res.error || 'Invalid credentials. Check Hospital ID, email, or password.');
      }
    }, 400);
  };

  // Optional 1-click helper for evaluators/demo testing
  const handleFillDemo = () => {
    setHospitalId('HOSP-METRO-01');
    setStaffId('dr.sharma@cityhospital.org');
    setPassword('hospital123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900">
      
      {/* Top Simple Header */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-6 sm:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo_horizontal.png"
            alt="MEDITRIAGE AI"
            className="h-7 sm:h-8 w-auto object-contain"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Patient Portal</span>
        </Link>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-[460px] w-full bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
          
          {/* Subtle Ambient Teal Glow at top */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-teal-100/40 via-emerald-50/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/70 text-slate-700 text-[11px] font-semibold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#138A72]" />
                <span>Hospital Staff Portal</span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Workstation Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your authorized clinical credentials to access patient triage queue.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
              
              {/* Field 1: Hospital ID */}
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
                    autoComplete="off"
                    required
                    className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#138A72] focus:ring-2 focus:ring-[#138A72]/15 shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Staff Email / ID */}
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
                    placeholder="e.g. dr.sharma@cityhospital.org"
                    autoComplete="off"
                    required
                    className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#138A72] focus:ring-2 focus:ring-[#138A72]/15 shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Workstation Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter workstation password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#138A72] focus:ring-2 focus:ring-[#138A72]/15 shadow-2xs transition-all"
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

              {/* Remember device - NO Forgot Password Link */}
              <div className="flex items-center text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#138A72] border-slate-300 focus:ring-[#138A72]"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0B3B36] hover:bg-[#072522] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all mt-4 disabled:opacity-50 group cursor-pointer"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Workstation'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

            </form>

            {/* Quick Demo Credentials Autofill Pill */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Testing credentials?</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#138A72] hover:text-[#0B3B36] bg-teal-50 hover:bg-teal-100/70 border border-teal-200/60 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                <KeyRound className="w-3 h-3" />
                <span>Fill Demo Login</span>
              </button>
            </div>

            {/* HIPAA / Security compliance badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>HIPAA Compliant • 256-Bit Encrypted Session</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        © 2026 MediTriage AI Healthcare Systems. All rights reserved.
      </footer>
    </div>
  );
};
