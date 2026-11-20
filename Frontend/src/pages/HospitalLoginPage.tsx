import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginHospital, registerHospitalTrial } from '../lib/hospitalAuth';
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  HelpCircle,
  Calendar,
  Zap,
  Users,
  Check,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

export const HospitalLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'signin' | 'onboarding'
  const [mode, setMode] = useState<'signin' | 'onboarding'>(
    location.pathname.includes('onboarding') ? 'onboarding' : 'signin'
  );
  const [onboardingStep, setOnboardingStep] = useState<number>(1); // 1 to 5

  // ===================== SIGN IN STATE =====================
  const [hospitalId, setHospitalId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // ===================== ONBOARDING FORM STATE =====================
  const [hospitalName, setHospitalName] = useState('City General Hospital');
  const [hospitalType, setHospitalType] = useState('Multi-Speciality');
  const [newHospitalId, setNewHospitalId] = useState('HOSP-METRO-01');
  const [city, setCity] = useState('Dehradun');
  const [stateName, setStateName] = useState('Uttarakhand');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('123, Rajpur Road, Dehradun');

  const [adminFullName, setAdminFullName] = useState('Dr. Sharma');
  const [adminEmail, setAdminEmail] = useState('dr.sharma@cityhospital.org');
  const [newPassword, setNewPassword] = useState('Hospital@2026');
  const [confirmPassword, setConfirmPassword] = useState('Hospital@2026');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [adminRole, setAdminRole] = useState('Administrator');
  const [contactNumber, setContactNumber] = useState('98765 43210');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Password criteria check
  const hasMinLen = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  // Trial dates
  const today = new Date();
  const formatNiceDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const trialStartFormatted = formatNiceDate(today);
  const trialEndDateObj = new Date(today);
  trialEndDateObj.setDate(trialEndDateObj.getDate() + 7);
  const trialEndFormatted = formatNiceDate(trialEndDateObj);

  // Handle Login
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

  // Add team member
  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      setTeamMembers([...teamMembers, newMemberEmail.trim()]);
      setNewMemberEmail('');
      setShowAddMember(false);
    }
  };

  // Submit registration
  const handleCreateAccount = () => {
    setIsLoading(true);
    setTimeout(() => {
      registerHospitalTrial({
        hospitalName,
        hospitalType,
        hospitalId: newHospitalId,
        city,
        state: stateName,
        country,
        address,
        fullName: adminFullName,
        workEmail: adminEmail,
        password: newPassword,
        adminRole,
        contactNumber,
        teamMembers,
        trialStartDate: trialStartFormatted,
        trialEndDate: trialEndFormatted
      });
      setIsLoading(false);
      setOnboardingStep(5); // Show "Trial Activated"
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FBFBFA] text-slate-800 font-sans selection:bg-teal-500/15 selection:text-teal-800">
      
      {/* ========================================================= */}
      {/* LEFT HALF: Cinematic Hospital Visual & Information        */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden flex-col justify-between p-12 xl:p-16 text-white select-none">
        
        {/* Full-bleed background hospital visual with smooth zoom hover */}
        <img
          src="/hospital_atrium.jpg"
          alt="Modern Hospital Facility"
          className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[0.88] brightness-[0.68] transition-transform duration-1000 hover:scale-105"
        />
        
        {/* Cinematic Gradient Overlays for clinical depth & contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-900/40" />
        <div className="absolute inset-0 bg-[#0B3B36]/25 mix-blend-multiply" />

        {/* Top: Brand Logo Glass Card */}
        <div className="relative z-10 flex items-center justify-between animate-fade-in">
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

        {/* Middle/Bottom: Editorial Slogan & Pillar List */}
        <div className="relative z-10 space-y-6 max-w-lg animate-fade-in-up">
          
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300">
            <span className="w-4 h-0.5 bg-teal-400" />
            <span>Hospital Access Portal</span>
          </div>

          <h1 className="font-serif text-4xl xl:text-5xl font-normal text-white tracking-tight leading-[1.15]">
            Smarter Triage for <br />
            <span className="italic font-serif text-teal-200">Better Care.</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-light">
            A secure portal for hospital teams to manage the triage queue, patient records and clinical workflows — all in one place.
          </p>

          {/* 3 Pillar Checklist matching Screen 1 */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-teal-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Real-time triage queue</span>
                <span className="text-[11px] text-slate-300">Stay informed on critical cases</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Secure and compliant</span>
                <span className="text-[11px] text-slate-300">Role-based access with audit logs</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5 text-teal-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Built for hospital teams</span>
                <span className="text-[11px] text-slate-300">Doctors, nurses and authorized staff</span>
              </div>
            </div>
          </div>

          {/* Bottom Card: 7-day free trial CTA */}
          <button
            type="button"
            onClick={() => {
              setMode('onboarding');
              setOnboardingStep(1);
            }}
            className="w-full text-left p-4 rounded-2xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/30 backdrop-blur-md transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-teal-300" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-teal-200 block font-medium">New to Meditriage AI?</span>
                <span className="text-sm font-semibold text-white group-hover:text-teal-200 transition-colors flex items-center gap-1.5">
                  Start your 7-day free trial
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </button>

        </div>

        {/* Bottom Left Copyright */}
        <div className="relative z-10 text-[11px] text-slate-400 font-light pt-4 border-t border-white/10 flex items-center justify-between">
          <span>© 2026 MEDITRIAGE AI Healthcare</span>
          <span>HIPAA / CDSS Aligned</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT HALF: Sign In Form OR 5-Step Onboarding Wizard      */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#FBFBFA]">
        
        {/* Right Top Header */}
        <div className="flex items-center justify-between w-full pb-4">
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors"
            >
              <span>Need help?</span>
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </button>

            {showHelp && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 text-xs text-slate-600 space-y-2 z-50 animate-fade-in">
                <span className="font-bold text-slate-900 block">Hospital Access Assistance</span>
                <p>For credential issues, doctor/nurse staff assignment, or trial activations, contact support:</p>
                <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-teal-700">
                  Email: support@meditriage.ai
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SCREEN 1: SIGN IN VIEW                                    */}
        {/* ========================================================= */}
        {mode === 'signin' && (
          <div className="max-w-[420px] w-full mx-auto my-auto py-4 animate-fade-in">
            <div className="space-y-6">
              
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight">
                  Welcome back
                </h2>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                
                {/* Input 1: Unique Hospital ID (Empty by default) */}
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

                {/* Input 2: Staff ID / Email (Empty by default) */}
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

                {/* Input 3: Password (Empty by default) */}
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

                {/* Remember device checkbox only - NO 'Forgot password?' */}
                <div className="flex items-center text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-700 border-slate-300 focus:ring-teal-700"
                    />
                    <span>Remember device</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#0B3B36] hover:bg-[#072522] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all mt-4 disabled:opacity-50 group cursor-pointer"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Workstation'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Start 7-day free trial CTA */}
                <div className="pt-4 text-center border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('onboarding');
                      setOnboardingStep(1);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 transition-colors"
                  >
                    <span>New to Meditriage AI? Start your 7-day free trial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREENS 2-6: 5-STEP HOSPITAL ONBOARDING WIZARD            */}
        {/* ========================================================= */}
        {mode === 'onboarding' && (
          <div className="max-w-[480px] w-full mx-auto my-auto py-2 animate-fade-in">
            
            {/* Top Stepper Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
                {[
                  { num: 1, label: 'Hospital Details' },
                  { num: 2, label: 'Credentials' },
                  { num: 3, label: 'Team Info' },
                  { num: 4, label: 'Review' },
                  { num: 5, label: 'Complete' }
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        onboardingStep === s.num
                          ? 'bg-teal-700 text-white shadow-xs'
                          : onboardingStep > s.num
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {onboardingStep > s.num ? '✓' : s.num}
                    </div>
                    <span
                      className={`mt-1 text-[10px] hidden sm:block ${
                        onboardingStep === s.num ? 'text-teal-800 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Progress bar line */}
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-teal-700 h-full transition-all duration-300"
                  style={{ width: `${((onboardingStep - 1) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* STEP 1: Hospital Information (Screen 2)              */}
            {/* ----------------------------------------------------- */}
            {onboardingStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    Hospital Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tell us about your hospital to get started.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. City General Hospital"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hospital Type</label>
                    <select
                      value={hospitalType}
                      onChange={(e) => setHospitalType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                    >
                      <option value="Multi-Speciality">Multi-Speciality</option>
                      <option value="General Hospital">General Hospital</option>
                      <option value="Trauma Center">Trauma Center</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Government Hospital">Government Hospital</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Unique Hospital ID</label>
                    <input
                      type="text"
                      value={newHospitalId}
                      onChange={(e) => setNewHospitalId(e.target.value.toUpperCase())}
                      placeholder="e.g. HOSP-METRO-01"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Dehradun"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">State</label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                      >
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Hospital Address</label>
                      <span className="text-[10px] text-slate-400">{address.length}/200</span>
                    </div>
                    <textarea
                      rows={2}
                      value={address}
                      maxLength={200}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter full address"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* STEP 2: Create Administrator Account (Screen 3)      */}
            {/* ----------------------------------------------------- */}
            {onboardingStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    Create Administrator Account
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set up your administrator credentials.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={adminFullName}
                      onChange={(e) => setAdminFullName(e.target.value)}
                      placeholder="e.g. Dr. Sharma"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="e.g. dr.sharma@cityhospital.org"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-teal-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Password checklist */}
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLen ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'}`}>
                          ✓
                        </span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasUppercase ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'}`}>
                          ✓
                        </span>
                        <span>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'}`}>
                          ✓
                        </span>
                        <span>One number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasSpecial ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'}`}>
                          ✓
                        </span>
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-teal-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* STEP 3: Team Information (Screen 4)                  */}
            {/* ----------------------------------------------------- */}
            {onboardingStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    Team Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Add initial team details. You can invite more team members later.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Administrator Role</label>
                    <select
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Chief Medical Officer">Chief Medical Officer</option>
                      <option value="Head of Emergency">Head of Emergency</option>
                      <option value="Lead Triage Nurse">Lead Triage Nurse</option>
                      <option value="IT Administrator">IT Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Additional Team Members (Optional)
                    </label>
                    {teamMembers.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 mb-2 text-xs">
                        <span className="font-mono text-slate-700">{m}</span>
                        <button
                          type="button"
                          onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {showAddMember ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="nurse@cityhospital.org"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddMember}
                          className="px-3 py-2 bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddMember(true)}
                        className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-xs text-slate-600 hover:border-teal-700 hover:text-teal-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add team member</span>
                      </button>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-700 border-slate-300 focus:ring-teal-700 mt-0.5"
                      />
                      <span>
                        I agree to the <span className="text-teal-700 underline font-medium">Terms of Service</span> and{' '}
                        <span className="text-teal-700 underline font-medium">Privacy Policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!agreedTerms}
                    onClick={() => setOnboardingStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* STEP 4: Review & Confirm (Screen 5)                   */}
            {/* ----------------------------------------------------- */}
            {onboardingStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    Review & Confirm
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Please review your information before creating the account.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Card 1: Hospital Details */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-800">Hospital Details</span>
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(1)}
                        className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Hospital Name</span>
                        <span className="font-semibold text-slate-800">{hospitalName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Hospital Type</span>
                        <span>{hospitalType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Unique Hospital ID</span>
                        <span className="font-mono text-teal-800 font-semibold">{newHospitalId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Location</span>
                        <span>{city}, {stateName}, {country}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Address</span>
                        <span>{address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Administrator Details */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-800">Administrator Details</span>
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Name</span>
                        <span className="font-semibold text-slate-800">{adminFullName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Email</span>
                        <span className="text-slate-800">{adminEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Role</span>
                        <span>{adminRole}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">Contact</span>
                        <span>+91 {contactNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Trial Information */}
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-950 text-sm">7-Day Free Trial</span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900">
                            Active on Signup
                          </span>
                        </div>
                        <p className="text-[11px] text-teal-800 mt-0.5">
                          Full access to all features for 7 days. No credit card required.
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-teal-200/60">
                          <div>
                            <span className="text-[10px] text-teal-700 block">Start Date</span>
                            <span className="font-semibold text-teal-950">{trialStartFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-teal-700 block">End Date</span>
                            <span className="font-semibold text-teal-950">{trialEndFormatted}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleCreateAccount}
                    className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* STEP 5: Trial Activated (Screen 6)                    */}
            {/* ----------------------------------------------------- */}
            {onboardingStep === 5 && (
              <div className="text-center py-6 space-y-6 animate-fade-in">
                
                {/* Big Green Success Badge */}
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-normal text-slate-900 tracking-tight">
                    Your 7-Day Free Trial <br />
                    is Activated!
                  </h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your hospital account has been created successfully. You now have full access to all features for 7 days.
                  </p>
                </div>

                {/* 2 Badges: Hospital ID & Trial Valid Till */}
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Hospital ID</span>
                    <span className="font-mono text-sm font-bold text-teal-800">{newHospitalId}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Trial Valid Till</span>
                    <span className="text-sm font-bold text-slate-800">{trialEndFormatted}</span>
                  </div>
                </div>

                {/* Direct Action: Continue to Dashboard */}
                <div className="pt-2 max-w-sm mx-auto space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate('/staff/dashboard')}
                    className="w-full py-3.5 px-6 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Continue to Hospital Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setHospitalId(newHospitalId);
                      setStaffId(adminEmail);
                      setPassword('');
                    }}
                    className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Or return to Sign In
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        <div />

      </div>

    </div>
  );
};