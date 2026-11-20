import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { StethoscopeIllustration } from '../components/StethoscopeIllustration';
import {
  ArrowRight,
  Stethoscope,
  Building2,
  Mic,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  MapPin
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col justify-center w-full">
        
        {/* ========================================================= */}
        {/* SCREEN 1: HERO CONTAINER (Exact Reference Screen 1)       */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-slate-200/80 shadow-sm relative overflow-hidden">
          
          {/* Ambient Mint Radial Glow (Subtle & Apple Health Inspired) */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-bl from-teal-100/50 via-emerald-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Your Health. Our Priority.</span>
              </div>

              {/* Headline */}
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Your health <br />
                deserves the <br />
                <span className="text-[#138A72]">right attention.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed font-normal">
                Understand your symptoms. Find the right care. Get help when it matters.
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/assess"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0B3B36] hover:bg-[#072522] text-white text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] group"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-300" />
                  <span>Check Symptoms</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  to="/hospitals"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold transition-all hover:border-slate-300"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Find Hospitals</span>
                </Link>
              </div>

              {/* Subtle Voice Prompt Link */}
              <div className="pt-2">
                <Link
                  to="/assess?voice=1"
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-teal-50">
                    <Mic className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-700" />
                  </div>
                  <span>Prefer speaking? Describe your symptoms naturally.</span>
                </Link>
              </div>

            </div>

            {/* Right Stethoscope Visual (Pristine High-Resolution Vector) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <StethoscopeIllustration className="w-72 sm:w-88 h-72 sm:h-88" />
            </div>

          </div>

          {/* ========================================================= */}
          {/* "HOW IT WORKS" 3-STEP BANNER (Matching Mockup Strip)      */}
          {/* ========================================================= */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-4">
                <h2 className="font-bold text-base text-slate-900">How it works</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get the right guidance in just a few steps.
                </p>
              </div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                
                {/* Step 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">1</span>
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      Describe your symptoms
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-300 ml-auto">→</span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">2</span>
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      Get an AI assessment and guidance
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-300 ml-auto">→</span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">3</span>
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      Find nearby hospitals or get emergency help
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* EMERGENCY BANNER AT BOTTOM (Matching Mockup Strip)        */}
          {/* ========================================================= */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#FDF2F2] border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-red-950 block">Need immediate help?</span>
                <span className="text-xs text-red-800/90 block">
                  Access emergency assistance for life-threatening situations.
                </span>
              </div>
            </div>

            <Link
              to="/emergency"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#D93829] hover:bg-[#C02F21] text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              Call Emergency Services
            </Link>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/logo_icon.png" alt="MediTriage" className="h-5 w-auto" />
            <span className="font-semibold text-slate-800">MediTriage AI</span>
            <span>• Clinical Decision Support Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-800 transition-colors">About</Link>
            <Link to="/hospitals" className="hover:text-slate-800 transition-colors">Find Hospitals</Link>
            <Link to="/emergency" className="hover:text-slate-800 transition-colors text-red-600 font-semibold">Emergency 108</Link>
            <Link to="/login" className="hover:text-slate-800 transition-colors">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
