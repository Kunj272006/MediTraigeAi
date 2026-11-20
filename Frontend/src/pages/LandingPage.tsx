import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { audioAlert } from '../lib/audioAlert';
import {
  Lock,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Clock,
  BarChart3,
  ChevronRight,
  Volume2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [alertPlaying, setAlertPlaying] = useState(false);
  const [testToast, setTestToast] = useState(false);

  const handleTestAlert = () => {
    setAlertPlaying(true);
    setTestToast(true);
    audioAlert.playSeriousAlarm();
    setTimeout(() => {
      setAlertPlaying(false);
    }, 2800);
    setTimeout(() => {
      setTestToast(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900">
      
      {/* Top Navigation Bar matching Image 1 */}
      <Navbar />

      {/* Floating Audio Alert Toast */}
      {testToast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-red-600 text-white shadow-2xl border border-red-400 flex items-center gap-3 animate-bounce">
          <Volume2 className="w-5 h-5 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold block">Serious Alert Triggered</span>
            <span>Emergency Red priority auditory tone is sounding.</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HERO SECTION: Exact Replicant of Design Image 1           */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 flex flex-col justify-between">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
          
          {/* ------------------------------------------------------- */}
          {/* LEFT COLUMN: Hero Copy, CTA Buttons & Trust Metrics      */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Enterprise Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <span className="w-5 h-0.5 bg-slate-400" />
              <span>Enterprise Hospital Triage Software</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] font-normal tracking-tight text-slate-950 leading-[1.12]">
              Right Care, <br />
              <span className="italic font-serif text-[#138A72]">at the Right Time.</span>
            </h1>

            {/* Clear Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-normal">
              A specialized hospital platform for emergency departments and outpatient clinics.
              Prioritize critical patients, monitor live telemetry and trigger audible alerts — all in one place.
            </p>

            {/* 3 Feature Pills */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-slate-700 text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-teal-700" />
                <span>Real-time Triage Queue</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-slate-700 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Secure & Compliant</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-slate-700 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>Built for Hospital Teams</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0B3B36] hover:bg-[#072522] text-white text-xs sm:text-sm font-semibold shadow-xs transition-transform hover:scale-[1.02] group cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-300" />
                <span>Hospital Staff Sign In</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={handleTestAlert}
                className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  alertPlaying ? 'ring-2 ring-red-500 bg-red-50 text-red-700' : ''
                }`}
              >
                <Play className={`w-3.5 h-3.5 fill-current ${alertPlaying ? 'text-red-600 animate-spin' : 'text-slate-700'}`} />
                <span>Test Serious Condition Alert</span>
              </button>
            </div>

            {/* Trust Metrics Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 max-w-lg">
              <div>
                <span className="font-bold text-lg sm:text-xl text-slate-900 block tracking-tight">
                  500+
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Hospitals Trust Us
                </span>
              </div>

              <div>
                <span className="font-bold text-lg sm:text-xl text-slate-900 block tracking-tight">
                  2M+
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Patients Managed
                </span>
              </div>

              <div>
                <span className="font-bold text-lg sm:text-xl text-slate-900 block tracking-tight">
                  99.9%
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Uptime & Reliable
                </span>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT COLUMN: Hospital Imagery & Live Triage Overlay     */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-6 relative">
            
            {/* Visual Container with Hospital Emergency Background */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 aspect-[4/3] bg-slate-900 group">
              
              <img
                src="/hero_emergency_bg.jpg"
                alt="Hospital Emergency Department Triage Workstation"
                className="w-full h-full object-cover object-center filter saturate-[0.9] brightness-[0.82] transition-transform duration-700 group-hover:scale-102"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />

              {/* Triage Workstation Monitor Mockup in Background */}
              <div className="absolute bottom-6 left-6 right-6 sm:left-10 sm:right-10 max-w-sm backdrop-blur-md bg-slate-950/80 border border-white/15 rounded-2xl p-3.5 shadow-2xl text-white">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-teal-300">Live Triage Queue</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[9px]">+ New Patient</span>
                </div>
                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded">
                    <span>PT-0091 Rahul Mehta (56/M)</span>
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      Red 5m
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded">
                    <span>PT-0090 Sita Devi (42/F)</span>
                    <span className="text-amber-400 font-bold">Yellow 18m</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded">
                    <span>PT-0089 Arjun Singh (28/M)</span>
                    <span className="text-emerald-400 font-bold">Green 32m</span>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* Floating Glassmorphic Triage Cards (Exact Reference)   */}
              {/* ----------------------------------------------------- */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 space-y-2.5 max-w-[270px] w-full z-20">
                
                {/* Red Card: Serious Treatment Required */}
                <div className="backdrop-blur-md bg-white/90 rounded-2xl p-3 border border-red-200/90 shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700">Red</span>
                        <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                          5-10 MINS
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 block mt-0.5">
                        Serious treatment required
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Triggers automatic loud audio alert
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                  </div>
                </div>

                {/* Yellow Card: Priority Examination */}
                <div className="backdrop-blur-md bg-white/90 rounded-2xl p-3 border border-amber-200/90 shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700">Yellow</span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          30 MIN-1 HR
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 block mt-0.5">
                        Condition requires priority examination
                      </span>
                    </div>
                  </div>
                </div>

                {/* Green Card: Routine Consultation */}
                <div className="backdrop-blur-md bg-white/90 rounded-2xl p-3 border border-emerald-200/90 shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">Green</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          2-4 HOURS
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 block mt-0.5">
                        Routine consultation and standard queueing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Black Card: Recorded for Documentation */}
                <div className="backdrop-blur-md bg-white/90 rounded-2xl p-3 border border-slate-300/90 shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Black</span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                          DECEASED
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 block mt-0.5">
                        Recorded for documentation
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* BOTTOM DARK BANNER: Exact Replicant of Design Image 1     */}
        {/* ========================================================= */}
        <section id="features" className="mt-12 rounded-3xl bg-[#062622] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-teal-900/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Pillar 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-300">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-white">Faster Response Times</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Get critical patients the care they need sooner.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-white">Better Workflow</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Streamlined triage and patient flow.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-white">Secure & Compliant</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Built with privacy and security in mind.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-300">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-white">Designed for Hospital Teams</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Doctors, nurses and authorized staff.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MEDITRIAGE AI</span>
            <span>—</span>
            <span>Right Care, Right Time.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-800 transition-colors">About</Link>
            <Link to="/pricing" className="hover:text-slate-800 transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-slate-800 transition-colors">Hospital Login</Link>
            <Link to="/jeevan" className="hover:text-slate-800 transition-colors">Jeevan Emergency</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
