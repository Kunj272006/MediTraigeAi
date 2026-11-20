import React, { useState } from 'react';
import type { TriageCategory, VitalsData } from '../types';
import { evaluateDirectionalDiagnoses } from '../lib/directionalDiagnosis';
import type { DifferentialCondition } from '../lib/directionalDiagnosis';
import {
  Activity,
  Plus,
  Check,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Stethoscope,
  FileCheck2
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

  // Color theme variables based on category (Apple Health calm tokens)
  const theme = {
    RED: {
      badgeBg: 'bg-triage-red-light text-triage-red border-triage-red-border',
      headerBg: 'bg-triage-red text-white',
      accentText: 'text-triage-red',
      borderTone: 'border-triage-red-border',
      windowLabel: '5–10 minutes (Immediate Resuscitation)',
    },
    YELLOW: {
      badgeBg: 'bg-triage-yellow-light text-amber-800 border-triage-yellow-border',
      headerBg: 'bg-amber-600 text-white',
      accentText: 'text-amber-800',
      borderTone: 'border-triage-yellow-border',
      windowLabel: '30–60 minutes (Urgent Clinical Care)',
    },
    GREEN: {
      badgeBg: 'bg-forest-50 text-forest-800 border-forest-100',
      headerBg: 'bg-forest-800 text-white',
      accentText: 'text-forest-800',
      borderTone: 'border-forest-100',
      windowLabel: '2–4 hours (Routine Consultation)',
    },
    BLACK: {
      badgeBg: 'bg-ivory-100 text-charcoal-700 border-charcoal-200',
      headerBg: 'bg-charcoal-900 text-white',
      accentText: 'text-charcoal-800',
      borderTone: 'border-charcoal-200',
      windowLabel: 'Attending Clinician Protocol',
    },
  }[category];

  return (
    <div className={`bg-white rounded-3xl border border-charcoal-200 shadow-apple overflow-hidden ${className}`}>
      
      {/* 1. Clinical Decision Support Header */}
      <div className="p-5 sm:p-6 border-b border-charcoal-200 bg-ivory-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Clinical Decision Support (CDS)
            </span>
            <span className="text-[10px] bg-ivory-200 text-charcoal-700 font-semibold px-2 py-0.5 rounded-full border border-charcoal-200">
              Directional Guidance Only
            </span>
          </div>
          <h2 className="font-serif text-2xl font-normal text-charcoal-950">
            Symptom Pattern Evaluation
          </h2>
          <p className="text-xs text-charcoal-600 mt-1 max-w-xl">
            {assessment.disclaimerNotice}
          </p>
        </div>

        {/* Clinical Care Window Badge */}
        <div className="bg-white border border-charcoal-200 px-4 py-2.5 rounded-2xl shadow-subtle shrink-0">
          <span className="text-[10px] text-charcoal-500 block uppercase font-bold tracking-wider">
            Evaluation Window
          </span>
          <span className="text-xs sm:text-sm font-semibold text-charcoal-900 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-forest-700" />
            <span>{theme.windowLabel}</span>
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        
        {/* Active Symptoms Tag Bar & Interactive Adders */}
        <div className="space-y-3 bg-ivory-50 p-4 sm:p-5 rounded-2xl border border-charcoal-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-charcoal-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-forest-700" />
              <span>Reported Symptoms Analyzed:</span>
            </span>
            <span className="text-[11px] text-charcoal-500">Tap a pill to adjust</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSymptoms.map((sym) => (
              <button
                type="button"
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-ivory-50 text-xs font-medium hover:bg-forest-900 transition-colors shadow-xs"
                title="Remove symptom"
              >
                <span>{sym}</span>
                <span className="text-ivory-300 text-xs">×</span>
              </button>
            ))}
          </div>

          {/* Quick Common Symptoms Picklist */}
          <div className="pt-2.5 border-t border-charcoal-200 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-charcoal-500 font-medium">Add Quick Symptoms:</span>
            {COMMON_QUICK_SYMPTOMS.filter((s) => !activeSymptoms.includes(s))
              .slice(0, 6)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-charcoal-200 text-charcoal-700 hover:border-forest-700 hover:text-forest-800 transition text-[11px]"
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
              placeholder="Add another symptom to refine consideration..."
              className="flex-1 bg-white border border-charcoal-200 rounded-xl px-3.5 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-ivory-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Evaluate</span>
            </button>
          </form>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. PRIMARY CLINICAL CONSIDERATION (Structured)       */}
        {/* ---------------------------------------------------- */}
        <div className="rounded-2xl border border-charcoal-200 bg-white shadow-subtle overflow-hidden">
          
          {/* Header Strip */}
          <div className="px-5 py-3 bg-ivory-100 border-b border-charcoal-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-forest-800" />
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                Primary Clinical Consideration
              </span>
            </div>
            <span className="text-[11px] font-semibold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full">
              Highest Pattern Correlation
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-serif text-2xl font-normal text-charcoal-950">
                    {major.name}
                  </h3>
                  <span className="text-xs font-mono font-medium bg-ivory-100 text-charcoal-700 px-2 py-0.5 rounded border border-charcoal-200">
                    ICD-10: {major.icd10Code}
                  </span>
                </div>
                
                <div className="text-xs text-charcoal-600 mt-2 flex flex-wrap items-center gap-3">
                  <span>Organ System: <strong className="text-charcoal-900">{major.organSystem}</strong></span>
                  <span>•</span>
                  <span>Recommended Specialist: <strong className="text-charcoal-900">{major.department}</strong></span>
                  <span>•</span>
                  <span>Clinical Acuity: <strong className={theme.accentText}>{major.severity}</strong></span>
                </div>
              </div>

              {/* Correlation Indicator */}
              <div className="bg-ivory-50 border border-charcoal-200 p-3 rounded-2xl text-center shrink-0 min-w-[120px]">
                <span className="text-[10px] text-charcoal-500 block uppercase font-bold tracking-wider">
                  Pattern Match
                </span>
                <span className="text-2xl font-serif font-medium text-forest-800">
                  {major.matchScore}%
                </span>
                <span className="text-[10px] text-charcoal-500 block font-medium">Indicator Score</span>
              </div>
            </div>

            {/* Why this consideration was identified */}
            <div className="bg-ivory-50 border border-charcoal-200 rounded-xl p-4 text-xs space-y-1.5">
              <span className="font-bold text-charcoal-800 block text-[11px] uppercase tracking-wider">
                Clinical Decision Support Rationale:
              </span>
              <p className="text-charcoal-700 leading-relaxed">
                {major.whyMajorProblem}
              </p>
            </div>

            {/* Actionable Next Steps & Recommended Diagnostics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-charcoal-200 bg-white space-y-1.5">
                <span className="font-bold text-charcoal-800 block uppercase text-[10px] tracking-wider">
                  Recommended Immediate Care Direction:
                </span>
                <p className="text-charcoal-600 leading-relaxed font-normal">
                  {major.recommendedFirstAid}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-charcoal-200 bg-white space-y-2">
                <span className="font-bold text-charcoal-800 block uppercase text-[10px] tracking-wider">
                  Standard Diagnostic Tests to Inquire About:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {major.recommendedDiagnostics.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 text-[11px] bg-ivory-50 border border-charcoal-200 text-charcoal-800 px-2 py-1 rounded-md font-medium"
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
        {/* 3. DIFFERENTIAL & ALTERNATIVE POSSIBILITIES          */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-charcoal-200 pb-2">
            <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-forest-700" />
              <span>Differential Possibilities Considered ({assessment.differentialConditions.length}):</span>
            </h4>
            <span className="text-[11px] text-charcoal-500">
              Conditions with overlapping clinical presentation
            </span>
          </div>

          <div className="space-y-2.5">
            {assessment.differentialConditions.map((cond: DifferentialCondition, idx: number) => {
              const isExpanded = expandedId === cond.id;

              return (
                <div
                  key={cond.id}
                  className="p-4 rounded-xl border border-charcoal-200 bg-white hover:border-charcoal-300 transition-colors text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-ivory-200 text-charcoal-700 font-semibold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 2}
                        </span>
                        <h5 className="font-semibold text-sm text-charcoal-900">
                          {cond.name}
                        </h5>
                        {cond.icd10Code && (
                          <span className="text-[10px] font-mono bg-ivory-100 text-charcoal-600 px-1.5 py-0.5 rounded border border-charcoal-200">
                            ICD-10: {cond.icd10Code}
                          </span>
                        )}
                        <span className="text-[10px] bg-ivory-100 text-charcoal-700 px-2 py-0.5 rounded-full border border-charcoal-200 font-medium">
                          Differential {idx + 1}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal-500 mt-1 block pl-7">
                        Department: {cond.department} &bull; Urgency: <strong>{cond.urgency}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs font-semibold text-charcoal-700">
                        {cond.matchScore}% Match
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : cond.id)}
                        className="p-1 rounded-lg hover:bg-ivory-100 text-charcoal-500 transition-colors"
                        aria-label={isExpanded ? 'Collapse differential' : 'Expand differential'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable differential rationale */}
                  <div className={`mt-3 pt-2.5 border-t border-charcoal-100 space-y-1.5 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
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
        <div className="p-4 bg-ivory-100 border border-charcoal-200 rounded-2xl text-xs text-charcoal-700 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-forest-800 shrink-0 mt-0.5" />
          <div>
            <strong className="text-charcoal-900 block mb-0.5">Non-Diagnosis Clinical Disclaimer:</strong>
            This evaluation reflects probabilistic pattern analysis of reported symptoms and vital signs. It does not replace a clinical examination, laboratory tests, or diagnostic imaging by a licensed physician. <strong>Please present these findings to an emergency clinician or primary care provider within {theme.windowLabel}.</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
