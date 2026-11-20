import React, { useState, useEffect, useRef } from 'react';
import type { SymptomsData } from '../types';
import {
  Search,
  X,
  AlertTriangle,
  Mic,
  RotateCcw,
  Check,
  Edit3
} from 'lucide-react';

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

// Helper to match spoken phrases to standard symptom chips
const SYMPTOM_KEYWORD_MAP: Record<string, string[]> = {
  'Chest pain': ['chest pain', 'chest pressure', 'chest tightness', 'heart pain', 'angina'],
  'Breathing difficulty': ['breathing difficulty', 'shortness of breath', 'breathless', 'trouble breathing', 'wheezing', 'can\'t breathe'],
  'Fever': ['fever', 'high temperature', 'chills', 'feverish'],
  'Cough': ['cough', 'coughing', 'dry cough', 'phlegm'],
  'Headache': ['headache', 'head ache', 'migraine', 'throbbing head'],
  'Abdominal pain': ['abdominal pain', 'stomach ache', 'stomach pain', 'belly pain', 'cramps'],
  'Nausea': ['nausea', 'queasy', 'feeling sick'],
  'Vomiting': ['vomiting', 'throwing up', 'puking'],
  'Dizziness': ['dizziness', 'dizzy', 'lightheaded', 'fainting', 'vertigo'],
  'Weakness': ['weakness', 'fatigue', 'tired', 'lethargic', 'exhausted'],
  'Sore throat': ['sore throat', 'throat irritation', 'throat pain'],
  'Body ache': ['body ache', 'muscle pain', 'joint pain', 'myalgia'],
  'Diarrhea': ['diarrhea', 'loose motions', 'watery stool'],
  'Rash': ['rash', 'skin redness', 'hives', 'itching']
};

export const Step3Symptoms: React.FC<Step3Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Explicit 8-state voice intake management
  type VoiceState =
    | 'idle'
    | 'permission_requested'
    | 'recording'
    | 'processing'
    | 'transcription_available'
    | 'editing_transcript'
    | 'submission'
    | 'error_retry';

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [editableTranscript, setEditableTranscript] = useState(data.additionalDetails || '');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState('error_retry');
      setVoiceError('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      setVoiceState('permission_requested');
      setVoiceError(null);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState('recording');
      };

      recognition.onresult = (event: any) => {
        setVoiceState('recording');
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalText += item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        const combined = (finalText || interimText).trim();
        if (combined) {
          setEditableTranscript((prev) => {
            const base = prev.trim() ? prev.trim() + ' ' : '';
            return finalText ? base + finalText : (prev ? prev : interimText);
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please speak clearly into your microphone and try again.');
        } else {
          setVoiceError(`Audio intake error: ${event.error}`);
        }
        setVoiceState('error_retry');
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'recording' ? 'transcription_available' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setVoiceState('error_retry');
      setVoiceError(err?.message || 'Unable to access microphone.');
    }
  };

  const stopVoiceInput = () => {
    setVoiceState('processing');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      setVoiceState('transcription_available');
    }, 300);
  };

  // User applies edited transcript into symptoms and auto-tags keywords
  const applyTranscript = () => {
    setVoiceState('submission');
    const text = editableTranscript.trim();
    if (!text) {
      setVoiceState('idle');
      return;
    }

    const lower = text.toLowerCase();
    const current = new Set(data.selectedSymptoms || []);

    Object.entries(SYMPTOM_KEYWORD_MAP).forEach(([symptomName, keywords]) => {
      if (keywords.some((kw) => lower.includes(kw))) {
        current.add(symptomName);
      }
    });

    onChange({
      selectedSymptoms: Array.from(current),
      additionalDetails: text
    });

    setTimeout(() => {
      setVoiceState('idle');
    }, 500);
  };

  const clearVoiceInput = () => {
    setEditableTranscript('');
    setVoiceError(null);
    setVoiceState('idle');
  };

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
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Editorial Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-charcoal-950 leading-tight">
          Symptoms and Duration
        </h1>
        <p className="text-sm text-charcoal-600 mt-2">
          Describe what you are experiencing. You can type or use your microphone to dictate.
        </p>
      </div>

      {/* Dynamic Emergency Red Flag Alert */}
      {isCriticalSymptom && (
        <div className="mb-6 p-4 rounded-2xl bg-triage-red-light border border-triage-red-border text-charcoal-900 flex items-start gap-3 shadow-subtle">
          <AlertTriangle className="w-5 h-5 text-triage-red shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-triage-red block mb-0.5">
              Urgent Clinical Alert: High-Acuity Indicator Reported
            </span>
            You have selected symptoms (such as Chest Pain or Breathing Difficulty) that require immediate clinical evaluation. If you are experiencing severe crushing pain or acute shortness of breath, please call 108 or proceed to the nearest emergency department right away.
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VOICE INTAKE CONSOLE (8 Dedicated States)                */}
      {/* ========================================================= */}
      <div className="mb-6 bg-white border border-charcoal-200 rounded-2xl p-4 sm:p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              voiceState === 'recording'
                ? 'bg-triage-red text-white'
                : 'bg-forest-50 text-forest-800'
            }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-charcoal-900 block">
                Speech-to-Text Symptom Intake
              </span>
              <span className="text-[11px] text-charcoal-500">
                {voiceState === 'permission_requested' && 'Requesting browser microphone access...'}
                {voiceState === 'recording' && 'Microphone active • Speak your symptoms clearly'}
                {voiceState === 'processing' && 'Processing your speech tokens...'}
                {voiceState === 'transcription_available' && 'Transcription available. Review and edit below.'}
                {voiceState === 'editing_transcript' && 'Editing your transcribed symptoms.'}
                {voiceState === 'submission' && 'Applying symptoms to your intake record...'}
                {voiceState === 'error_retry' && 'Microphone error. Check permissions or retry.'}
                {voiceState === 'idle' && 'Click to dictate your symptoms and medical problem.'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {voiceState === 'recording' ? (
              <button
                type="button"
                onClick={stopVoiceInput}
                className="px-4 py-1.5 rounded-full bg-triage-red hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Stop Dictating</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startVoiceInput}
                className="px-4 py-1.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{voiceState === 'error_retry' ? 'Retry Microphone' : 'Speak Symptoms'}</span>
              </button>
            )}

            {editableTranscript && (
              <button
                type="button"
                onClick={clearVoiceInput}
                className="px-2.5 py-1.5 rounded-full border border-charcoal-200 text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100 text-xs transition-colors"
                title="Clear spoken text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Editable Transcript Console (Phases 5.3 & 5.4: User can edit or correct) */}
        {(voiceState === 'recording' || editableTranscript) && (
          <div className="mt-3 p-3.5 rounded-xl bg-ivory-50 border border-charcoal-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <Edit3 className="w-3 h-3 text-forest-700" />
                <span>Editable Voice Transcript:</span>
              </span>
              <span>You may edit or add to this text before applying</span>
            </div>

            <textarea
              rows={2}
              value={editableTranscript}
              onFocus={() => setVoiceState('editing_transcript')}
              onChange={(e) => {
                setEditableTranscript(e.target.value);
                setVoiceState('editing_transcript');
              }}
              placeholder="Your spoken words will appear here in real time..."
              className="w-full bg-white border border-charcoal-200 rounded-lg p-2.5 text-xs text-charcoal-900 font-sans focus:outline-none focus:ring-1 focus:ring-forest-800"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-charcoal-400">
                Tip: Mention symptoms like fever, cough, chest pressure, headache, or nausea.
              </span>
              <button
                type="button"
                onClick={applyTranscript}
                className="px-3 py-1 rounded-lg bg-forest-800 text-ivory-50 hover:bg-forest-900 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Assessment</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {voiceError && (
          <div className="mt-3 p-3 rounded-xl bg-triage-red-light border border-triage-red-border text-xs text-triage-red flex items-center justify-between gap-2">
            <span>{voiceError}</span>
            <button
              type="button"
              onClick={startVoiceInput}
              className="underline font-semibold shrink-0"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Selection + Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Picklist and Duration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-charcoal-200 rounded-2xl p-5 shadow-apple">
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search symptom picklist (e.g. fever, cough, chest pain...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 placeholder:text-charcoal-400 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
            </div>

            {/* Chips Grid */}
            <div className="mb-2">
              <span className="text-[11px] font-bold text-charcoal-500 tracking-wider uppercase block mb-3">
                Standard Clinical Symptoms
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
                          ? 'bg-forest-800 text-ivory-50 shadow-xs font-semibold'
                          : 'bg-ivory-100 border border-charcoal-200 text-charcoal-700 hover:border-charcoal-300 hover:bg-ivory-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other Symptoms Field */}
            {data.selectedSymptoms.includes('Other') && (
              <div className="mt-4 pt-3 border-t border-charcoal-100">
                <label className="text-xs font-semibold text-charcoal-700 block mb-1.5">
                  Describe Other Symptoms:
                </label>
                <input
                  type="text"
                  value={data.otherSymptomsText}
                  onChange={(e) => onChange({ otherSymptomsText: e.target.value })}
                  placeholder="Specify any additional sensations or symptoms..."
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
              </div>
            )}
          </div>

          {/* Duration Card */}
          <div className="bg-white border border-charcoal-200 rounded-2xl p-5 shadow-apple">
            <span className="text-[11px] font-bold text-charcoal-500 tracking-wider uppercase block mb-3">
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

        {/* Right Column (5 cols): Selected List and Severity */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-charcoal-200 rounded-2xl p-5 shadow-apple space-y-5">
            
            {/* Selected Symptoms Pills */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-charcoal-500 tracking-wider uppercase">
                  Selected Symptoms ({data.selectedSymptoms.length})
                </span>
                {data.selectedSymptoms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ selectedSymptoms: [] })}
                    className="text-[10px] text-charcoal-400 hover:text-charcoal-700 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {data.selectedSymptoms.length === 0 ? (
                <div className="py-4 text-center border border-dashed border-charcoal-200 rounded-xl text-xs text-charcoal-400">
                  Select or speak at least one symptom
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.selectedSymptoms.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory-200 border border-charcoal-200 text-xs font-medium text-charcoal-800"
                    >
                      <span>{sym}</span>
                      <button
                        type="button"
                        onClick={() => removeSymptom(sym)}
                        className="hover:text-triage-red transition-colors"
                        aria-label={`Remove ${sym}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Severity Selection */}
            <div>
              <span className="text-[11px] font-bold text-charcoal-500 tracking-wider uppercase block mb-2.5">
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

            {/* Additional Clinical Notes */}
            <div>
              <label className="text-[11px] font-bold text-charcoal-500 tracking-wider uppercase block mb-2">
                Clinical Context & Onset Notes (optional)
              </label>
              <textarea
                rows={3}
                value={data.additionalDetails}
                onChange={(e) => onChange({ additionalDetails: e.target.value })}
                placeholder="e.g., onset timing, triggers, or pain radiation..."
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
          className="px-7 py-2.5 rounded-full bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next: Medical History →
        </button>
      </div>
    </div>
  );
};
