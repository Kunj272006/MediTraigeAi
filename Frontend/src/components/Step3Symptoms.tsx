import React, { useState } from 'react';
import type { SymptomsData } from '../types';
import { Search, X, AlertTriangle } from 'lucide-react';

interface Step3Props {
  data: SymptomsData;
  onChange: (updates: Partial<SymptomsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Headache',
  'Breathing difficulty',
  'Chest pain',
  'Abdominal pain',
  'Nausea',
  'Vomiting',
  'Dizziness',
  'Weakness',
  'Sore throat',
  'Body ache',
  'Diarrhea',
  'Rash',
  'Other'
];

export const Step3Symptoms: React.FC<Step3Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSymptoms = COMMON_SYMPTOMS.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSymptom = (symptom: string) => {
    const current = data.selectedSymptoms || [];
    if (current.includes(symptom)) {
      onChange({ selectedSymptoms: current.filter((s) => s !== symptom) });
    } else {
      onChange({ selectedSymptoms: [...current, symptom] });
    }
  };

  const removeSymptom = (symptom: string) => {
    const current = data.selectedSymptoms || [];
    onChange({ selectedSymptoms: current.filter((s) => s !== symptom) });
  };

  const isCriticalSymptom =
    data.selectedSymptoms.includes('Chest pain') ||
    data.selectedSymptoms.includes('Breathing difficulty');

  const isValid = data.selectedSymptoms.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-charcoal-900 leading-tight">
          Symptoms and Duration
        </h1>
        <p className="text-sm text-charcoal-600 mt-2">
          What symptoms are you experiencing right now? (Select all that apply)
        </p>
      </div>

      {/* Dynamic Emergency Red Flag Alert */}
      {isCriticalSymptom && (
        <div className="mb-6 p-4 rounded-2xl bg-triage-red-light border border-triage-red-border text-charcoal-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-triage-red shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-triage-red block mb-0.5">
              Immediate Emergency Warning
            </span>
            You selected symptoms (Chest pain or Breathing difficulty) that may indicate an urgent or life-threatening situation. If severe, proceed immediately to the nearest Emergency Room or call emergency services (108).
          </div>
        </div>
      )}

      {/* Main Grid: Left Selection + Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Symptom Picker & Duration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search symptoms (e.g. fever, cough, headache...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 placeholder:text-charcoal-400 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
            </div>

            {/* Chips Grid */}
            <div className="mb-2">
              <span className="text-[11px] font-bold text-charcoal-600 tracking-wide uppercase block mb-3">
                Common Symptoms
              </span>
              <div className="flex flex-wrap gap-2">
                {filteredSymptoms.map((symptom) => {
                  const isSelected = data.selectedSymptoms.includes(symptom);
                  return (
                    <button
                      type="button"
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-forest-800 text-ivory-100 shadow-sm font-semibold'
                          : 'bg-ivory-100 border border-charcoal-200 text-charcoal-700 hover:border-charcoal-300 hover:bg-ivory-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Other selected, reveal text input */}
            {data.selectedSymptoms.includes('Other') && (
              <div className="mt-4 pt-3 border-t border-charcoal-100">
                <label className="text-xs font-semibold text-charcoal-700 block mb-1.5">
                  Describe Other Symptoms:
                </label>
                <input
                  type="text"
                  value={data.otherSymptomsText}
                  onChange={(e) => onChange({ otherSymptomsText: e.target.value })}
                  placeholder="Specify any other sensations or symptoms..."
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
              </div>
            )}
          </div>

          {/* Duration Card */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <span className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase block mb-3">
              How long have you had these symptoms?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Less than 24 hours', value: '<24_hours' },
                { label: '1 - 2 days', value: '1-2_days' },
                { label: 'More than 2 days', value: '>2_days' },
              ].map((opt) => {
                const checked = data.duration === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => onChange({ duration: opt.value as SymptomsData['duration'] })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      checked
                        ? 'border-forest-800 bg-forest-50 text-forest-900 font-semibold ring-1 ring-forest-800'
                        : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-700 bg-ivory-50'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        checked ? 'border-forest-800' : 'border-charcoal-300'
                      }`}
                    >
                      {checked && <span className="w-2 h-2 rounded-full bg-forest-800" />}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected list, Severity & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple space-y-5">
            {/* Selected Symptoms Pills */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase">
                  Selected Symptoms ({data.selectedSymptoms.length})
                </span>
                {data.selectedSymptoms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ selectedSymptoms: [] })}
                    className="text-[10px] text-charcoal-400 hover:text-charcoal-600 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {data.selectedSymptoms.length === 0 ? (
                <div className="py-4 text-center border border-dashed border-charcoal-200 rounded-xl text-xs text-charcoal-400">
                  Select at least one symptom from the list
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.selectedSymptoms.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory-200 border border-charcoal-200 text-xs font-semibold text-charcoal-800"
                    >
                      <span>{sym}</span>
                      <button
                        type="button"
                        onClick={() => removeSymptom(sym)}
                        className="hover:text-triage-red transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Severity */}
            <div>
              <span className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase block mb-2.5">
                Symptom Severity
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => {
                  const selected = data.severity === sev;
                  return (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => onChange({ severity: sev })}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all ${
                        selected
                          ? sev === 'Severe'
                            ? 'border-triage-red bg-triage-red-light text-triage-red font-bold ring-1 ring-triage-red'
                            : 'border-forest-800 bg-forest-50 text-forest-900 font-bold ring-1 ring-forest-800'
                          : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-700 bg-ivory-50'
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Details Textarea */}
            <div>
              <label className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase block mb-2">
                Additional Details (optional)
              </label>
              <textarea
                rows={3}
                value={data.additionalDetails}
                onChange={(e) => onChange({ additionalDetails: e.target.value })}
                placeholder="e.g. when did it start, what makes it better or worse?"
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 placeholder:text-charcoal-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className="px-7 py-2.5 rounded-full bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
