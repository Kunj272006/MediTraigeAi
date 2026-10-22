import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ArrowRight, FileText, Activity, ArrowUpRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex flex-col justify-center">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content (7 cols) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Tagline */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-[1.5px] bg-forest-800"></span>
              <span className="text-[11px] font-bold tracking-widest text-charcoal-500 uppercase">
                Right Care, Right Time
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-charcoal-900 leading-[1.08]">
              Right care. <br />
              <span className="italic font-normal">At the right time.</span>
            </h1>

            {/* Subcopy */}
            <p className="text-base sm:text-lg text-charcoal-600 max-w-xl font-normal leading-relaxed">
              Share your symptoms and available health measurements to receive a preliminary triage assessment and clear next steps. Built to help you get the right care, at the right time.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/assess"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-forest-800 text-ivory-100 text-sm font-semibold hover:bg-forest-900 shadow-apple hover:shadow-apple-hover transition-all group"
              >
                <span>Start assessment</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/staff/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-charcoal-300 text-sm font-semibold text-charcoal-800 hover:bg-ivory-200 transition-colors"
              >
                <span>For healthcare teams</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Visual Card (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Subtle organic pastel flow background glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-forest-50/60 via-amber-50/40 to-rose-50/30 rounded-3xl blur-2xl -z-10" />

            <div className="bg-white/95 backdrop-blur-md border border-charcoal-200/90 rounded-3xl p-6 sm:p-8 shadow-apple space-y-6">
              {/* Triage Status 1: Red */}
              <div className="flex items-start gap-4 pb-4 border-b border-charcoal-100">
                <span className="w-3.5 h-3.5 rounded-full bg-triage-red ring-4 ring-triage-red-light shrink-0 mt-1" />
                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-charcoal-900 text-sm">Red</span>
                    <span className="text-[10px] uppercase font-bold text-triage-red bg-triage-red-light px-2 py-0.5 rounded-full">
                      Emergency
                    </span>
                  </div>
                  <p className="text-charcoal-500 leading-normal">
                    Requires immediate medical attention.
                  </p>
                </div>
              </div>

              {/* Triage Status 2: Yellow */}
              <div className="flex items-start gap-4 pb-4 border-b border-charcoal-100">
                <span className="w-3.5 h-3.5 rounded-full bg-triage-yellow ring-4 ring-triage-yellow-light shrink-0 mt-1" />
                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-charcoal-900 text-sm">Yellow</span>
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-triage-yellow-light px-2 py-0.5 rounded-full">
                      Urgent
                    </span>
                  </div>
                  <p className="text-charcoal-500 leading-normal">
                    Should be seen by a doctor within a few hours.
                  </p>
                </div>
              </div>

              {/* Triage Status 3: Green */}
              <div className="flex items-start gap-4 pb-4 border-b border-charcoal-100">
                <span className="w-3.5 h-3.5 rounded-full bg-triage-green ring-4 ring-triage-green-light shrink-0 mt-1" />
                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-charcoal-900 text-sm">Green</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-triage-green-light px-2 py-0.5 rounded-full">
                      Lower urgency
                    </span>
                  </div>
                  <p className="text-charcoal-500 leading-normal">
                    Can likely wait. Follow recommended advice.
                  </p>
                </div>
              </div>

              {/* Triage Status 4: Black */}
              <div className="flex items-start gap-4">
                <span className="w-3.5 h-3.5 rounded-full bg-triage-black ring-4 ring-triage-black-light shrink-0 mt-1" />
                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-charcoal-900 text-sm">Black</span>
                    <span className="text-[10px] uppercase font-bold text-charcoal-700 bg-triage-black-light px-2 py-0.5 rounded-full">
                      Clinician-recorded deceased status
                    </span>
                  </div>
                  <p className="text-charcoal-500 leading-normal">
                    Used only by authorized healthcare professionals. Never assigned automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step "How It Works" Section */}
        <div id="how-it-works" className="mt-16 sm:mt-24 pt-10 border-t border-charcoal-200/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white/80 border border-charcoal-200/90 rounded-2xl p-6 shadow-subtle hover:shadow-apple transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-2xl font-light text-charcoal-400">01</span>
                <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-sans font-bold text-base text-charcoal-900 mb-2">
                Share details
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Tell us about yourself, your symptoms, and any available health measurements in 1.5–2.5 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/80 border border-charcoal-200/90 rounded-2xl p-6 shadow-subtle hover:shadow-apple transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-2xl font-light text-charcoal-400">02</span>
                <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-sans font-bold text-base text-charcoal-900 mb-2">
                Review symptoms
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We analyze the information using clinically informed, validated hospital triage safety protocols.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/80 border border-charcoal-200/90 rounded-2xl p-6 shadow-subtle hover:shadow-apple transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-2xl font-light text-charcoal-400">03</span>
                <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-sans font-bold text-base text-charcoal-900 mb-2">
                Get next steps
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Receive a preliminary triage category, personal UHID encounter ticket, and plain-language clinical guidance.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Safety Notice Footer Banner */}
      <footer className="w-full pb-6">
        <EmergencyBanner />
      </footer>
    </div>
  );
};
