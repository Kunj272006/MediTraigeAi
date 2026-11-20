import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getEncounters } from '../lib/store';
import { audioAlert } from '../lib/audioAlert';
import { TRIAGE_WARNINGS, type EncounterRecord } from '../types';
import {
  ArrowLeft,
  AlertTriangle,
  Building2,
  Phone,
  CheckCircle2,
  Printer,
  Info,
  Siren,
  RotateCcw,
  Volume2
} from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [soundPlaying, setSoundPlaying] = useState(false);

  const encounters = getEncounters();
  const fallbackEncounter: EncounterRecord = {
    id: id || 'ENC-140406',
    encounterNumber: 'ENC-140406',
    uhid: 'MID-2026-5899',
    category: 'RED',
    triageLabel: 'Emergency',
    status: 'Waiting',
    waitTimeMinutes: 5,
    patientName: 'Karan Sharma',
    age: 48,
    gender: 'Male',
    contactNumber: '9876543210',
    location: 'Dehradun, Uttarakhand',
    symptoms: {
      selectedSymptoms: ['Chest pain', 'Breathing difficulty'],
      otherSymptomsText: 'Acute chest tightness and breathing discomfort',
      duration: '<24_hours',
      severity: 'Severe',
      additionalDetails: 'Felt sudden pressure in chest after mild exertion',
    },
    vitals: {
      isBpMeasured: true,
      systolicBp: 135,
      diastolicBp: 88,
      isHeartRateMeasured: true,
      heartRate: 104,
      isTempMeasured: true,
      temperature: 37.0,
      isSpo2Measured: true,
      oxygenSaturation: 94,
      isRespRateMeasured: true,
      respiratoryRate: 22,
      isSugarMeasured: false,
      bloodSugar: null,
    },
    history: {
      conditions: ['Hypertension'],
      allergies: [],
      noAllergies: true,
      medications: [],
      noMedications: true,
      uploadedDocuments: [],
    },
    plainLanguageSummary: 'Your reported symptoms indicate an urgent acute presentation that requires prompt clinical attention.',
    recommendedAction: 'Seek medical help as soon as possible. Consider visiting the nearest hospital or calling for emergency assistance.',
    createdAt: new Date().toISOString(),
  };

  const encounter = encounters.find((e) => e.id === id) || encounters[0] || fallbackEncounter;
  const category = encounter.category || 'RED';
  const warning = TRIAGE_WARNINGS[category] || TRIAGE_WARNINGS.YELLOW;
  const isRed = category === 'RED';
  const isYellow = category === 'YELLOW';

  // Sound alert for serious/red cases
  useEffect(() => {
    if (warning.isSerious || isRed) {
      setSoundPlaying(true);
      audioAlert.playSeriousAlarm();
      const timer = setTimeout(() => setSoundPlaying(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [category, isRed, warning.isSerious]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900 relative">
      <Navbar />

      {/* Subtle EKG Heartbeat Wave in the background (Matching Screen 3 in Mockup) */}
      <div className="absolute top-24 right-8 sm:right-16 text-teal-100/35 pointer-events-none select-none hidden lg:block -z-0">
        <svg width="240" height="90" viewBox="0 0 240 90" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 45h60l10-25 15 50 15-60 12 40 10-15 15 10h103" />
        </svg>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10 space-y-6">
        
        {/* Subnav: ← Back */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer className="w-3 h-3 text-slate-400" />
              <span>Print Results</span>
            </button>
          </div>
        </div>

        {/* Heading matching Screen 3 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your Assessment Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Encounter {encounter.encounterNumber} • Evaluated according to clinical triage guidelines.
            </p>
          </div>
          {soundPlaying && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full animate-pulse self-start sm:self-auto">
              <Volume2 className="w-3.5 h-3.5" /> Clinical Alert Sound Active
            </span>
          )}
        </div>

        {/* ========================================================= */}
        {/* URGENCY ALERT CARD (Matching Exact Screen 3 Mockup)       */}
        {/* ========================================================= */}
        <div
          className={`p-5 sm:p-6 rounded-2xl flex items-start gap-4 border shadow-xs ${
            isRed
              ? 'bg-[#FDF2F2] border-red-200 text-slate-900'
              : isYellow
              ? 'bg-[#FFFBEB] border-amber-200 text-slate-900'
              : 'bg-[#ECFDF5] border-emerald-200 text-slate-900'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isRed
                ? 'bg-red-100 text-[#D93829]'
                : isYellow
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <h2 className={`font-bold text-base sm:text-lg ${isRed ? 'text-[#D93829]' : isYellow ? 'text-amber-800' : 'text-emerald-800'}`}>
              {isRed ? 'High Urgency' : isYellow ? 'Moderate Urgency' : 'Standard Routine Care'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {isRed
                ? 'Your symptoms may need prompt medical attention.'
                : isYellow
                ? 'Your reported complaints warrant clinical consultation within 30–60 minutes.'
                : 'Your symptoms appear stable and suitable for routine outpatient consultation.'}
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TWO-COLUMN CONTENT GRID (Matching Exact Screen 3 Mockup)  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): Action, Explanations, Warning Signs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Recommended Action Card matching mockup */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Recommended Action
              </span>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 shrink-0 mt-0.5">
                  <Siren className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    {encounter.recommendedAction || 'Seek medical help as soon as possible.'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Consider visiting the nearest hospital or calling for emergency assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Possible Explanations Card matching mockup */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Possible Explanations
              </span>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>Acute Cardiovascular or Thoracic Presentation</strong> (ICD-10: I20 / R07.9)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span>
                    Severe respiratory or viral infection (e.g. influenza, acute bronchitis)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span>
                    Musculoskeletal chest wall strain or secondary autonomic discomfort
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span>
                    Other underlying physiological conditions to review with a licensed clinician
                  </span>
                </li>
              </ul>
            </div>

            {/* 3. Warning Signs Card matching mockup */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Warning Signs
              </span>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D93829] mt-1.5 shrink-0" />
                  <span>Difficulty in breathing or gasping for air</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D93829] mt-1.5 shrink-0" />
                  <span>Persistent chest pain, pressure, or radiating tightness</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D93829] mt-1.5 shrink-0" />
                  <span>Confusion, sudden weakness, or unusual drowsiness</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D93829] mt-1.5 shrink-0" />
                  <span>Sudden loss of balance or persistent fainting episodes</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column (5 cols): Next Steps & Action Buttons */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Next Steps Card with Green Checks matching mockup */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Next Steps
              </h3>

              <div className="space-y-2.5 text-xs text-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                  </div>
                  <span className="font-medium">Visit a nearby hospital</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                  </div>
                  <span className="font-medium">Call for emergency assistance if needed</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                  </div>
                  <span className="font-medium">Monitor your symptoms closely</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2.5">
                <a
                  href="/#hospitals"
                  className="w-full py-3 px-4 rounded-full bg-[#0D382F] hover:bg-[#092822] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  <span>Find Nearby Hospitals</span>
                </a>

                {isRed && (
                  <Link
                    to="/jeevan"
                    className="w-full py-3 px-4 rounded-full bg-[#D93829] hover:bg-[#C02F21] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>Call 108 Emergency Ambulance</span>
                  </Link>
                )}

                <Link
                  to="/assess"
                  className="w-full py-2.5 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Assessment</span>
                </Link>
              </div>
            </div>

            {/* Disclaimer Box matching exact mockup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                This assessment is for guidance only and not a substitute for professional medical advice. Always consult a qualified physician for evaluation and treatment.
              </span>
            </div>

          </div>

        </div>

      </main>

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400">
        MediTriage AI • Clinical Triage Platform
      </footer>
    </div>
  );
};
