import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { StethoscopeIllustration } from '../components/StethoscopeIllustration';
import {
  HeartPulse,
  ShieldCheck,
  Clock,
  ArrowRight,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex flex-col justify-center w-full">
        
        {/* Main Card (Matching Screen 6) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-slate-200/80 shadow-sm relative overflow-hidden">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              About MediTriage AI
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              A smart healthcare companion, designed to help you make informed decisions about your health.
            </p>
          </div>

          {/* 3 Feature Cards in Horizontal Row (Matching Screen 6) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Card 1: AI-Powered Guidance */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#138A72]">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                AI-Powered Guidance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Get reliable health guidance based on your symptoms evaluated against clinical protocols.
              </p>
            </div>

            {/* Card 2: Trusted & Safe */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#138A72]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Trusted &amp; Safe
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your privacy and well-being are our priority. We safeguard all your health data securely.
              </p>
            </div>

            {/* Card 3: Always Here */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#138A72]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Always Here
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Access help anytime, anywhere. 24/7 symptom evaluation and rapid emergency ambulance support.
              </p>
            </div>

          </div>

          {/* How It Works Section (Bottom Banner with Stethoscope Graphic) */}
          <div className="pt-8 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900">
                How It Works?
              </h2>
              <p className="text-sm text-slate-600">
                A simple process to get the right care:
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#138A72] shrink-0 mt-0.5" />
                  <span><strong>Step 1:</strong> Type or speak your symptoms naturally into our clinical intake.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#138A72] shrink-0 mt-0.5" />
                  <span><strong>Step 2:</strong> Receive an immediate urgency stratification (High, Moderate, or Routine).</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#138A72] shrink-0 mt-0.5" />
                  <span><strong>Step 3:</strong> Discover nearby verified medical centers or dispatch 108 ambulance units.</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/assess"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B3B36] hover:bg-[#072522] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-300" />
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <StethoscopeIllustration className="w-64 sm:w-80 h-64 sm:h-80" />
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
