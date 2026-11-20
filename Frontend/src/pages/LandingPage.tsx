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
  Stethoscope,
  Siren,
  Activity,
  HeartPulse,
  Building2
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
    setTimeout(() => setAlarmActive(false), 2400);
  };

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900 font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================= */}
        {/* CLINICAL EMERGENCY NOTICE STRIP */}
        {/* ========================================================= */}
        <aside aria-label="Emergency Care Notice" className="w-full bg-ivory-200 border-b border-charcoal-200 text-charcoal-800 text-xs py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-triage-red" />
              <span className="font-semibold text-charcoal-900">Immediate Medical Emergency:</span>
              <span className="text-charcoal-600 hidden md:inline">For chest pain, severe bleeding, or sudden unconsciousness, activate immediate ambulance dispatch.</span>
            </div>
            <Link
              to="/jeevan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-triage-red hover:text-red-700 underline underline-offset-2 shrink-0"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Launch 108 Emergency SOS</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* HERO SECTION: Calm, Authoritative, Apple Health Inspired */}
        {/* ========================================================= */}
        <section className="relative w-full border-b border-charcoal-200/80 bg-white py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column (7 cols): Editorial Clinical Framing & Pathways */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Clinical Domain Kicker */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-medium">
                  <Activity className="w-3.5 h-3.5 text-forest-700" />
                  <span>Clinical Decision Support & Intake Triage</span>
                </div>

                {/* Brand Editorial Title */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-charcoal-950 leading-[1.12]">
                  Right Care, <br />
                  at the <span className="italic font-serif text-forest-700">Right Time.</span>
                </h1>

                {/* Objective Clinical Description */}
                <p className="text-base sm:text-lg text-charcoal-700 max-w-xl font-normal leading-relaxed">
                  A clinical triage system engineered to stratify patient urgency, identify potential critical indicators, and coordinate seamless care routing between patients, ambulances, and emergency hospital departments.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/assess"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-forest-800 text-ivory-50 text-sm font-semibold hover:bg-forest-900 shadow-xs transition-all group"
                  >
                    <Stethoscope className="w-4 h-4 text-forest-100" />
                    <span>Begin Symptom Assessment</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    to={session ? "/staff/dashboard" : "/login"}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ivory-100 text-charcoal-800 text-sm font-medium hover:bg-ivory-200 border border-charcoal-300 transition-all"
                  >
                    <Lock className="w-4 h-4 text-charcoal-500" />
                    <span>{session ? "Open Triage Queue" : "Hospital Staff Login"}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleTestSoundAlert}
                    className={`inline-flex items-center gap-2 px-4 py-3.5 rounded-full border text-xs sm:text-sm font-medium transition-all ${
                      alarmActive
                        ? 'bg-triage-red-light border-triage-red text-triage-red'
                        : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-ivory-50'
                    }`}
                    title="Preview the high-acuity acoustic alert emitted when critical conditions are identified"
                  >
                    {alarmActive ? (
                      <>
                        <Volume2 className="w-4 h-4 text-triage-red" />
                        <span>Acoustic Chime Active...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-charcoal-500" />
                        <span>Test Alert Chime</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clinical Trust & Safety Standards */}
                <div className="pt-6 border-t border-charcoal-200 flex flex-wrap items-center gap-6 text-xs text-charcoal-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>ESI / MTS Protocol Aligned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Real-time Voice & Vitals Input</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Zero Data Resale</span>
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): Clinical Triage Matrix Cards */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Acuity Stratification Levels
                  </span>
                  <span className="text-xs text-charcoal-500">Target Care Windows</span>
                </div>

                {/* Level 1: Red */}
                <div className="bg-white border border-triage-red/30 rounded-2xl p-4 shadow-subtle hover:border-triage-red/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-triage-red shrink-0" />
                      <div>
                        <span className="font-semibold text-charcoal-900 text-sm block">Red — Resuscitation</span>
                        <span className="text-xs text-charcoal-600">Immediate threat to airway, breathing, or hemodynamic stability</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-triage-red bg-triage-red-light border border-triage-red-border px-2 py-0.5 rounded-md whitespace-nowrap">
                      ≤ 10 Mins
                    </span>
                  </div>
                </div>

                {/* Level 2: Yellow */}
                <div className="bg-white border border-triage-yellow/40 rounded-2xl p-4 shadow-subtle hover:border-triage-yellow/60 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-triage-yellow shrink-0" />
                      <div>
                        <span className="font-semibold text-charcoal-900 text-sm block">Yellow — Urgent Care</span>
                        <span className="text-xs text-charcoal-600">Severe pain, abnormal vitals, or potential for rapid deterioration</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 bg-triage-yellow-light border border-triage-yellow-border px-2 py-0.5 rounded-md whitespace-nowrap">
                      30–60 Mins
                    </span>
                  </div>
                </div>

                {/* Level 3: Green */}
                <div className="bg-white border border-triage-green/30 rounded-2xl p-4 shadow-subtle hover:border-triage-green/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-triage-green shrink-0" />
                      <div>
                        <span className="font-semibold text-charcoal-900 text-sm block">Green — Standard Care</span>
                        <span className="text-xs text-charcoal-600">Stable presentation suitable for outpatient evaluation or general OPD</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                      2–4 Hours
                    </span>
                  </div>
                </div>

                {/* Level 4: Black */}
                <div className="bg-white border border-charcoal-200 rounded-2xl p-4 shadow-subtle">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-charcoal-900 shrink-0" />
                      <div>
                        <span className="font-semibold text-charcoal-900 text-sm block">Black — Expectant / Clinician Documented</span>
                        <span className="text-xs text-charcoal-600">Catastrophic non-salvageable injuries; documented by licensed clinician</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-charcoal-600 bg-ivory-100 border border-charcoal-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                      Document Only
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INFORMATION ARCHITECTURE: How MediTriage Operates */}
        {/* ========================================================= */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800 block mb-2">
              Clinical Workflow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-950 tracking-tight">
              Structured assessment from symptom onset to emergency handoff.
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 mt-3 leading-relaxed">
              Every phase of the intake workflow prioritizes clarity, non-alarming communication, and actionable next steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white border border-charcoal-200 rounded-3xl p-7 shadow-apple flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-5">
                  1
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal-950 mb-2">
                  Symptom & Vitals Intake
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Enter symptoms using curated clinical picklists, detailed medical descriptions, or hands-free voice transcription. Record physiological vitals including blood pressure, pulse, SpO2, and temperature.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-charcoal-100 text-xs font-medium text-forest-800">
                Supports Speech-to-Text & Vitals
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-charcoal-200 rounded-3xl p-7 shadow-apple flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-5">
                  2
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal-950 mb-2">
                  Acuity Stratification
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  The clinical evaluation engine analyzes input against evidence-based red flags and vitals anomalies to categorize care urgency without ever asserting a conclusive medical diagnosis.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-charcoal-100 text-xs font-medium text-forest-800">
                Transparent Decision Support Rules
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-charcoal-200 rounded-3xl p-7 shadow-apple flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-5">
                  3
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal-950 mb-2">
                  Coordinated Care Routing
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Direct patients to appropriate hospital departments (Trauma, Cardiology, General Medicine), activate 108 emergency ambulance dispatch, or stream intake records into the hospital triage queue.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-charcoal-100 text-xs font-medium text-forest-800">
                Bed Telemetry & Ambulance Handoff
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* TWO DEDICATED CARE PORTALS: Patient vs Hospital Workstation */}
        {/* ========================================================= */}
        <section className="bg-white border-y border-charcoal-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Card A: Patient & Family Care Pathway */}
              <div className="p-8 rounded-3xl bg-ivory-50 border border-charcoal-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-charcoal-200 flex items-center justify-center text-forest-800 mb-4">
                    <HeartPulse className="w-5 h-5 text-forest-800" />
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-charcoal-950 mb-2">
                    For Patients & Families
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mb-6">
                    Assess current health complaints, understand potential urgency levels, receive practical immediate guidance, and locate nearest trauma facilities with open beds.
                  </p>
                  <ul className="space-y-2.5 text-xs text-charcoal-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Confidential self-assessment with voice dictation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Real-time GPS ambulance coordination via 108 SOS</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Transparent clinical timeframes and specialist suggestions</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    to="/assess"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-forest-800 text-ivory-50 text-xs sm:text-sm font-semibold hover:bg-forest-900 transition-colors"
                  >
                    <span>Check Symptoms Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card B: Hospital & Emergency Department Portal */}
              <div className="p-8 rounded-3xl bg-ivory-50 border border-charcoal-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-charcoal-200 flex items-center justify-center text-forest-800 mb-4">
                    <Building2 className="w-5 h-5 text-forest-800" />
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-charcoal-950 mb-2">
                    For Emergency Departments & Clinical Staff
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mb-6">
                    Real-time digital intake desk for triage nurses and doctors. Live incoming ambulance telemetry, bed occupancy management, and acoustic alerts for critical arrivals.
                  </p>
                  <ul className="space-y-2.5 text-xs text-charcoal-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Active triage queue prioritized by clinical urgency</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Acoustic workstation alarms for Red-category arrivals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Secure staff authentication and session management</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-charcoal-900 text-ivory-50 text-xs sm:text-sm font-semibold hover:bg-black transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-charcoal-300" />
                    <span>Hospital Staff Workstation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SUBSCRIPTION & FACILITY LICENSING */}
        {/* ========================================================= */}
        <section id="licensing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800 block mb-2">
              Facility Deployment
            </span>
            <h2 className="font-serif text-3xl font-normal text-charcoal-950 tracking-tight">
              Hospital Workstation Licensing
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              Straightforward subscriptions for primary health centers, district hospitals, and trauma facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 flex flex-col justify-between bg-white border ${
                  plan.popular
                    ? 'border-forest-800 ring-1 ring-forest-800 shadow-apple'
                    : 'border-charcoal-200 shadow-subtle'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-charcoal-500">
                      {plan.durationLabel}
                    </span>
                    {plan.savings && (
                      <span className="text-[11px] font-semibold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-serif text-3xl font-medium text-charcoal-950">
                      {plan.priceFormatted}
                    </span>
                    <span className="text-xs text-charcoal-500">
                      / {plan.durationLabel}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-charcoal-100 text-xs text-charcoal-700">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    to="/staff/subscription"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      plan.popular
                        ? 'bg-forest-800 text-ivory-50 hover:bg-forest-900'
                        : 'bg-ivory-100 text-charcoal-800 hover:bg-ivory-200 border border-charcoal-200'
                    }`}
                  >
                    <span>License {plan.priceFormatted}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ========================================================= */}
      {/* MEDICAL TRUST & ACCESSIBILITY DISCLAIMER FOOTER */}
      {/* ========================================================= */}
      <footer className="w-full border-t border-charcoal-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          {/* Statutory Clinical Notice */}
          <div className="p-4 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-600 leading-relaxed">
            <strong className="text-charcoal-900 font-semibold block mb-1">
              Clinical Decision Support (CDS) Statutory Notice:
            </strong>
            MediTriage AI is a triage prioritization and healthcare navigation platform. It does not provide medical diagnoses, definitive clinical findings, or prescribe pharmacological treatments. All directional assessments are intended for informational prioritization only. In any emergency situation involving chest pain, severe shortness of breath, acute traumatic injury, or sudden neurologic deficits, call 108 or proceed to the nearest emergency department immediately.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
            <div className="flex items-center gap-3">
              <img
                src="/logo_horizontal.png"
                alt="MEDITRIAGE AI"
                className="h-7 w-auto object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
              />
              <span>•</span>
              <span>Clinical Triage System</span>
            </div>

            <div className="flex items-center gap-6 font-medium text-charcoal-700">
              <Link to="/assess" className="hover:text-forest-800 transition-colors">
                Symptom Triage
              </Link>
              <Link to="/jeevan" className="hover:text-triage-red transition-colors">
                108 Emergency
              </Link>
              <Link to="/login" className="hover:text-forest-800 transition-colors">
                Staff Portal
              </Link>
              <Link to="/staff/subscription" className="hover:text-forest-800 transition-colors">
                Facility Plans
              </Link>
            </div>
          </div>

          <div className="text-[11px] text-charcoal-400 text-center sm:text-left">
            © 2026 MediTriage AI. All healthcare interfaces compliant with clinical data privacy standards.
          </div>

        </div>
      </footer>
    </div>
  );
};
