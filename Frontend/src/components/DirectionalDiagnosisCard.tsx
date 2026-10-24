import React, { useState } from 'react';
import type { TriageCategory, VitalsData } from '../types';
import { evaluateDirectionalDiagnoses } from '../lib/directionalDiagnosis';
import type { DifferentialCondition } from '../lib/directionalDiagnosis';
import {
  AlertCircle,
  Activity,
  Plus,
  Check,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';

interface DirectionalDiagnosisCardProps {
  initialSymptoms: string[];
  initialOtherText?: string;
  vitals?: VitalsData;
  category: TriageCategory;
  className?: string;
}

const COMMON_QUICK_SYMPTOMS = [
  'Runny Nose & Sneezing',
  'Sore Throat',
  'High Fever & Chills',
  'Stomach Pain & Cramps',
  'Loose Motions / Vomiting',
  'Acidity & Heartburn',
  'Throbbing Headache',
  'Burning While Urinating',
  'Chest Pressure & Tightness',
  'Body Ache & Fatigue',
  'Wheezing / Breathless',
  'Skin Itching & Rash',
];

export const DirectionalDiagnosisCard: React.FC<DirectionalDiagnosisCardProps> = ({
  initialSymptoms,
  initialOtherText = '',
  vitals,
  category,
  className = '',
}) => {
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>(
    initialSymptoms.length > 0 ? initialSymptoms : ['Acute Discomfort', 'Intake Presentation']
  );
  const [customInput, setCustomInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Evaluate directions with Major Problem spotlight
  const assessment = evaluateDirectionalDiagnoses(
    activeSymptoms,
    initialOtherText + ' ' + customInput,
    vitals,
    category
  );

  const major = assessment.majorProblem;

  const toggleSymptom = (sym: string) => {
    setActiveSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleAddCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (!activeSymptoms.includes(customInput.trim())) {
      setActiveSymptoms((prev) => [...prev, customInput.trim()]);
    }
    setCustomInput('');
  };

  // Color theme variables based on category
  const theme = {
    RED: {
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
      bannerBg: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white',
      accentText: 'text-rose-600',
      majorBorder: 'border-rose-400 bg-gradient-to-br from-rose-50/50 via-white to-white',
      majorHeaderBg: 'bg-rose-600 text-white',
      windowLabel: '5–10 minutes (Immediate Resuscitation)',
    },
    YELLOW: {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      bannerBg: 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white',
      accentText: 'text-amber-600',
      majorBorder: 'border-amber-400 bg-gradient-to-br from-amber-50/50 via-white to-white',
      majorHeaderBg: 'bg-amber-700 text-white',
      windowLabel: '30–60 minutes (Urgent Care)',
    },
    GREEN: {
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      bannerBg: 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white',
      accentText: 'text-emerald-600',
      majorBorder: 'border-emerald-400 bg-gradient-to-br from-emerald-50/40 via-white to-white',
      majorHeaderBg: 'bg-emerald-700 text-white',
      windowLabel: '2–4 hours (Routine Outpatient)',
    },
    BLACK: {
      badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
      bannerBg: 'bg-neutral-800 text-white',
      accentText: 'text-neutral-800',
      majorBorder: 'border-neutral-400 bg-neutral-50',
      majorHeaderBg: 'bg-neutral-800 text-white',
      windowLabel: 'Attending Physician Protocol',
    },
  }[category];

  return (
    <div className={`bg-white rounded-3xl border border-charcoal-200/90 shadow-apple overflow-hidden space-y-0 ${className}`}>
      
      {/* 1. Mandatory Directional Disclaimer Banner according to Color */}
      <div className={`p-4 sm:p-5 ${theme.bannerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
            <AlertCircle className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight uppercase">
                Directional Differential Diagnosis
              </span>
              <span className="text-[10px] bg-white text-charcoal-900 font-bold px-2 py-0.5 rounded-full uppercase">
                Symptom Analysis
              </span>
            </div>
            {/* The exact requested notice according to color */}
            <p className="text-xs sm:text-sm font-semibold mt-0.5 text-white/95 leading-relaxed">
              ⚠️ {assessment.disclaimerNotice}
            </p>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/25 text-right shrink-0">
          <span className="text-[10px] text-white/80 block uppercase font-bold">
            Doctor Consult Window
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{theme.windowLabel}</span>
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        
        {/* Active Symptoms Tag Bar & Interactive Adders */}
        <div className="space-y-2 bg-ivory-50 p-4 rounded-2xl border border-charcoal-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-charcoal-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-forest-700" />
              <span>Presenting Symptoms Analyzed:</span>
            </span>
            <span className="text-[11px] text-charcoal-400">Click a tag to remove</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {activeSymptoms.map((sym) => (
              <span
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-800 text-white text-xs font-semibold cursor-pointer hover:bg-forest-900 transition-all shadow-xs"
                title="Click to remove"
              >
                <span>{sym}</span>
                <span className="text-[10px] text-ivory-300">✕</span>
              </span>
            ))}
          </div>

          {/* Quick Common Disease Symptoms Buttons */}
          <div className="pt-2 border-t border-charcoal-200/60 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-charcoal-500 font-semibold">Add Common Symptoms:</span>
            {COMMON_QUICK_SYMPTOMS.filter((s) => !activeSymptoms.includes(s))
              .slice(0, 6)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-charcoal-300 text-charcoal-700 hover:border-forest-600 hover:text-forest-800 transition text-[11px]"
                >
                  <Plus className="w-3 h-3 text-forest-700" />
                  <span>{s}</span>
                </button>
              ))}
          </div>

          {/* Custom Symptom Input */}
          <form onSubmit={handleAddCustomSymptom} className="flex gap-2 pt-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type any other symptom (e.g. fever, vomiting, cold, loose motions, acidity, headache)..."
              className="flex-1 bg-white border border-charcoal-300 rounded-xl px-3 py-1.5 text-xs text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Analyze</span>
            </button>
          </form>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. THE MAJOR / PRIMARY SUSPECTED PROBLEM SPOTLIGHT   */}
        {/* ---------------------------------------------------- */}
        <div className={`rounded-2xl border-2 ${theme.majorBorder} shadow-md overflow-hidden`}>
          {/* Major Header Badge */}
          <div className={`px-5 py-2.5 ${theme.majorHeaderBg} flex items-center justify-between text-xs font-bold uppercase tracking-wider`}>
            <div className="flex items-center gap-2">
              <span className="text-base">⭐</span>
              <span>MAJOR SUSPECTED PROBLEM (PRIMARY DISEASE DIRECTION)</span>
            </div>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
              Highest Symptom Correlation
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
                    {major.name}
                  </h3>
                  <span className="text-xs font-mono font-bold bg-ivory-200 text-charcoal-700 px-2 py-0.5 rounded border border-charcoal-300">
                    ICD-10: {major.icd10Code}
                  </span>
                </div>
                <div className="text-xs text-charcoal-500 mt-1 flex flex-wrap items-center gap-3 font-medium">
                  <span>Organ System: <strong className="text-charcoal-800">{major.organSystem}</strong></span>
                  <span>•</span>
                  <span>Department: <strong className="text-charcoal-800">{major.department}</strong></span>
                  <span>•</span>
                  <span>Acuity: <strong className={theme.accentText}>{major.severity}</strong></span>
                </div>
              </div>

              {/* Match Likelihood Gauge */}
              <div className="bg-white border border-charcoal-200 p-3 rounded-2xl text-center shadow-xs shrink-0 min-w-[130px]">
                <span className="text-[10px] text-charcoal-400 block uppercase font-bold">
                  Symptom Match
                </span>
                <span className={`text-2xl font-black ${major.matchScore > 75 ? 'text-rose-600' : 'text-amber-600'}`}>
                  {major.matchScore}%
                </span>
                <span className="text-[10px] text-charcoal-500 block font-semibold">Primary Culprit</span>
              </div>
            </div>

            {/* Why this is identified as the major problem */}
            <div className="bg-ivory-100/90 border border-charcoal-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="font-bold text-charcoal-800 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-forest-800" />
                <span>Why this is identified as the major problem:</span>
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                {major.whyMajorProblem}
              </p>
            </div>

            {/* Immediate First Aid / Self-Care Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-charcoal-200 space-y-1">
                <span className="font-bold text-charcoal-700 block uppercase text-[10px] tracking-wider">
                  Immediate Direction / First Care:
                </span>
                <p className="text-charcoal-600 leading-relaxed font-medium">
                  {major.recommendedFirstAid}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-charcoal-200 space-y-1.5">
                <span className="font-bold text-charcoal-700 block uppercase text-[10px] tracking-wider">
                  Recommended Physician Investigations:
                </span>
                <div className="flex flex-wrap gap-1">
                  {major.recommendedDiagnostics.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 text-[11px] bg-ivory-50 border border-charcoal-200 text-charcoal-800 px-2 py-0.5 rounded font-medium"
                    >
                      <Check className="w-3 h-3 text-forest-700 shrink-0" />
                      <span>{d}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. DIFFERENTIAL & ALTERNATIVE DISEASE DIRECTIONS      */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-2">
            <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔄</span>
              <span>Alternative & Differential Conditions Evaluated ({assessment.differentialConditions.length}):</span>
            </h3>
            <span className="text-[11px] text-charcoal-400">
              Conditions that share secondary features
            </span>
          </div>

          <div className="space-y-2.5">
            {assessment.differentialConditions.map((cond: DifferentialCondition, idx: number) => {
              const isExpanded = expandedId === cond.id;

              return (
                <div
                  key={cond.id}
                  className="p-4 rounded-xl border border-charcoal-200/90 bg-white hover:border-charcoal-300 transition-all text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-ivory-200 text-charcoal-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 2}
                        </span>
                        <h4 className="font-bold text-sm text-charcoal-900">
                          {cond.name}
                        </h4>
                        {cond.icd10Code && (
                          <span className="text-[10px] font-mono bg-ivory-100 text-charcoal-600 px-1.5 py-0.2 rounded border border-charcoal-200">
                            ICD-10: {cond.icd10Code}
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full border border-slate-300 font-semibold">
                          Differential {idx + 1}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal-500 mt-0.5 block pl-7">
                        Department: {cond.department} &bull; Urgency: <strong>{cond.urgency}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs font-bold text-charcoal-700">
                        {cond.matchScore}% Match
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : cond.id)}
                        className="p-1 rounded hover:bg-ivory-200 text-charcoal-500 transition"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable differential rationale */}
                  <div className={`mt-2.5 pt-2 border-t border-charcoal-100 space-y-1.5 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
                    <p className="text-charcoal-600 text-[11px] leading-relaxed">
                      {cond.clinicalRationale}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cond.keyDiagnosticTests.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-ivory-50 border border-charcoal-200 text-charcoal-700 px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Mandatory Clinical Safety Notice */}
        <div className="p-3.5 bg-ivory-100 border border-charcoal-200 rounded-2xl text-[11px] text-charcoal-600 leading-relaxed flex items-start gap-2.5">
          <span className="text-base shrink-0">🛡️</span>
          <div>
            <strong>Physician Consultation Protocol:</strong> This assessment provides directional guidance based on statistical clinical symptom correlation. It is not a definitive medical prescription. <strong>Always consult a qualified doctor within {theme.windowLabel}.</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
