import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { audioAlert } from '../lib/audioAlert';
import { type HospitalAccount } from '../types';
import { SUBSCRIPTION_PLANS, getHospitalSession } from '../lib/hospitalAuth';
import {
  ArrowRight,
  Volume2,
  CheckCircle2,
  Lock,
  Play,
  Zap,
  ShieldCheck,
  Users,
  Clock,
  BarChart2,
  ChevronRight,
  Stethoscope,
  Siren,
  AlertTriangle,
  EyeOff
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [alarmActive, setAlarmActive] = useState(false);
  const [session, setSession] = useState<HospitalAccount | null>(getHospitalSession());

  useEffect(() => {
    const handleAuthChange = () => setSession(getHospitalSession());
    window.addEventListener('hospital_auth_changed', handleAuthChange);
    return () => window.removeEventListener('hospital_auth_changed', handleAuthChange);
  }, []);

  const handleTestSoundAlert = () => {
    setAlarmActive(true);
    audioAlert.playSeriousAlarm();
    setTimeout(() => setAlarmActive(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between selection:bg-teal-500/15 selection:text-teal-900 font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Urgent Emergency Dispatch Top Banner */}
        <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs py-2 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between w-full gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 font-bold tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>108 EMERGENCY MEDICAL DISPATCH GRID: Zero-registration instant ALS/BLS dispatch & hospital sync</span>
            </div>
            <Link
              to="/jeevan"
              className="bg-white text-red-700 hover:bg-slate-100 font-extrabold px-3 py-1 rounded-full text-[11px] shadow whitespace-nowrap transition-transform hover:scale-105"
            >
              Request Ambulance / SOS →
            </Link>
          </div>
        </div>
        
        {/* ========================================================= */}
        {/* HERO SECTION: Exact Match to User Redesign Mockup */}
        {/* ========================================================= */}
        <section className="relative w-full overflow-hidden min-h-[640px] lg:min-h-[720px] flex items-center">
          
          {/* Full-bleed Hospital Emergency Background Photography */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero_emergency_bg.jpg"
              alt="Hospital Emergency Department Triage Station"
              className="w-full h-full object-cover object-center filter saturate-[0.95] brightness-[0.98]"
            />
            {/* Luminous light wash: white gradient on left giving maximum text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-45% to-white/20 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column (7 cols): Editorial Typography & Actions */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-7 animate-fade-in-up">
                
                {/* Accent Line + Tagline Kicker */}
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-[2px] bg-teal-800" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-teal-800 uppercase">
                    Enterprise Hospital Triage Software
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-[68px] font-normal tracking-tight text-slate-900 leading-[1.05]">
                  Right Care, <br />
                  at the <span className="italic font-serif text-[#0E7A68]">Right Time.</span>
                </h1>

                {/* Subtitle Paragraph */}
                <p className="text-sm sm:text-base text-slate-600 max-w-lg font-normal leading-relaxed">
                  Clinical emergency triage platform to prioritize critical patients and monitor live telemetry.
                </p>

                {/* 3 Quick Highlight Badges */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-700 font-semibold pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5 text-teal-700" />
                    </div>
                    <span>Real-time Triage</span>
                  </div>
                  
                  <span className="hidden sm:inline text-slate-300">|</span>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    </div>
                    <span>Secure & Compliant</span>
                  </div>
                  
                  <span className="hidden sm:inline text-slate-300">|</span>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-teal-700" />
                    </div>
                    <span>Hospital Teams</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    to="/jeevan"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs sm:text-sm font-extrabold hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-600/30 transition-all hover:scale-105 group animate-pulse"
                  >
                    <span>🚨</span>
                    <span>108 Emergency Response (Instant SOS)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to={session ? "/staff/dashboard" : "/login"}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#0B3B36] text-white text-xs sm:text-sm font-semibold hover:bg-[#072623] shadow-md hover:shadow-lg transition-all group"
                  >
                    <Lock className="w-4 h-4 text-emerald-300" />
                    <span>{session ? "Open Triage Queue" : "Hospital Sign In"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleTestSoundAlert}
                    className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-full border text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm ${
                      alarmActive
                        ? 'bg-rose-100 border-rose-500 text-rose-800 animate-pulse'
                        : 'bg-white/90 border-slate-300 text-slate-800 hover:bg-white shadow-xs'
                    }`}
                    title="Hear audible chime triggered when a serious condition is detected"
                  >
                    <Play className={`w-3.5 h-3.5 ${alarmActive ? 'text-rose-600 animate-bounce' : 'text-slate-800 fill-slate-800'}`} />
                    <span>{alarmActive ? 'Playing Siren...' : 'Test Sound Alert'}</span>
                  </button>
                </div>

                {/* Trust Proof Stats Row */}
                <div className="flex items-center gap-6 sm:gap-8 pt-4 border-t border-slate-200/80 max-w-lg">
                  <div>
                    <span className="font-sans font-bold text-lg sm:text-xl text-slate-900 block tracking-tight">500+</span>
                    <span className="text-[11px] text-slate-500 font-medium">Hospitals</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div>
                    <span className="font-sans font-bold text-lg sm:text-xl text-slate-900 block tracking-tight">2M+</span>
                    <span className="text-[11px] text-slate-500 font-medium">Patients</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div>
                    <span className="font-sans font-bold text-lg sm:text-xl text-slate-900 block tracking-tight">99.9%</span>
                    <span className="text-[11px] text-slate-500 font-medium">Uptime</span>
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): 4 Floating Frosted Glass Urgency Cards */}
              <div className="lg:col-span-5 space-y-3.5 max-w-md ml-auto w-full animate-fade-in-up animation-delay-150">
                
                {/* Urgency Card 1: Red */}
                <div className="backdrop-blur-md bg-black/45 hover:bg-black/55 border border-rose-500/40 rounded-2xl p-4 text-white shadow-2xl transition-all duration-300 group">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/25 border border-rose-400/50 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Siren className="w-5 h-5 text-rose-300 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">Red</span>
                          <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-950/80 border border-rose-500/50 px-2 py-0.5 rounded-full">
                            5-10 MINS
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="font-medium text-slate-100 text-xs leading-snug">
                        Immediate emergency resuscitation
                      </p>
                      <p className="text-[11px] text-rose-300/90 mt-0.5 flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>Workstation sound alert</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Urgency Card 2: Yellow */}
                <div className="backdrop-blur-md bg-black/45 hover:bg-black/55 border border-amber-500/40 rounded-2xl p-4 text-white shadow-2xl transition-all duration-300 group">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <AlertTriangle className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">Yellow</span>
                        <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-full">
                          30 MIN-1 HR
                        </span>
                      </div>
                      <p className="text-xs text-slate-200/90 leading-snug">
                        Priority urgent examination
                      </p>
                    </div>
                  </div>
                </div>

                {/* Urgency Card 3: Green */}
                <div className="backdrop-blur-md bg-black/45 hover:bg-black/55 border border-emerald-500/40 rounded-2xl p-4 text-white shadow-2xl transition-all duration-300 group">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">Green</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full">
                          2-4 HOURS
                        </span>
                      </div>
                      <p className="text-xs text-slate-200/90 leading-snug">
                        Standard consultation queue
                      </p>
                    </div>
                  </div>
                </div>

                {/* Urgency Card 4: Black */}
                <div className="backdrop-blur-md bg-black/45 hover:bg-black/55 border border-white/20 rounded-2xl p-4 text-white shadow-2xl transition-all duration-300 group">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/40 border border-slate-500/50 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <EyeOff className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">Black</span>
                        <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-900/90 border border-slate-600 px-2 py-0.5 rounded-full">
                          DECEASED
                        </span>
                      </div>
                      <p className="text-xs text-slate-300/90 leading-snug">
                        Clinician documented only
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* BOTTOM DARK FEATURE RIBBON (Dock Bar) */}
        {/* ========================================================= */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
          <div className="bg-[#062420] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-teal-800/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-900/50 border border-teal-700/50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-white">Faster Response</h4>
                <p className="text-xs text-teal-200/80">
                  Immediate critical routing
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-900/50 border border-teal-700/50 flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-white">Better Workflow</h4>
                <p className="text-xs text-teal-200/80">
                  Streamlined patient flow
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-900/50 border border-teal-700/50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-white">Secure & Compliant</h4>
                <p className="text-xs text-teal-200/80">
                  Encrypted clinical data
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-900/50 border border-teal-700/50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-white">Hospital Teams</h4>
                <p className="text-xs text-teal-200/80">
                  Built for doctors & nurses
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SUBSCRIPTION & PRICING SECTION (#pricing) */}
        {/* ========================================================= */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-3 py-0.5 rounded-full">
              Hospital Licensing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-slate-900">
              Subscription Plans
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-white border-2 border-teal-800 shadow-xl ring-4 ring-teal-50'
                    : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold text-slate-500">
                      {plan.durationLabel}
                    </span>
                    {plan.savings && (
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-3xl sm:text-4xl font-medium text-slate-900">
                      {plan.priceFormatted}
                    </span>
                    <span className="text-xs text-slate-500">
                      / {plan.durationLabel}
                    </span>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    to="/staff/subscription"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      plan.popular
                        ? 'bg-[#0B3B36] text-white hover:bg-[#072623] shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <span>Subscribe {plan.priceFormatted}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Safety Notice & Premium Brand Footer */}
      <footer className="w-full border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src="/logo_horizontal.png"
              alt="MEDITRIAGE AI"
              className="h-7 w-auto object-contain"
              style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
            />
            <span>•</span>
            <span>© 2026 MEDITRIAGE AI Healthcare</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link to="/login" className="hover:text-teal-900 transition-colors">
              Hospital Login
            </Link>
            <Link to="/staff/subscription" className="hover:text-teal-900 transition-colors">
              Plans
            </Link>
            <span className="text-slate-400">HIPAA Aligned</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
