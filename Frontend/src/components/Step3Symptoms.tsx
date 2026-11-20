import React, { useState, useEffect, useRef } from 'react';
import type { SymptomsData } from '../types';
import {
  Search,
  X,
  AlertTriangle,
  Mic,
  RotateCcw
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

  // Speech Recognition State
  const [voiceStatus, setVoiceStatus] = useState<
    'idle' | 'listening' | 'speech-detected' | 'permission-denied' | 'unsupported'
  >('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Check speech recognition capability on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus('unsupported');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
      }
    };
  }, []);

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus('unsupported');
      setVoiceError('Voice input is not supported by your current browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceStatus('listening');
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
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
          setVoiceStatus('speech-detected');
          setLiveTranscript(combined);

          // Auto-detect and match recognized symptoms from voice input
          const lower = combined.toLowerCase();
          const current = new Set(data.selectedSymptoms || []);
          let detectedNew = false;

          Object.entries(SYMPTOM_KEYWORD_MAP).forEach(([symptomName, keywords]) => {
            if (keywords.some((kw) => lower.includes(kw))) {
              if (!current.has(symptomName)) {
                current.add(symptomName);
                detectedNew = true;
              }
            }
          });

          // Append to additional details if final
          if (finalText) {
            const existingDetails = data.additionalDetails ? data.additionalDetails.trim() + ' ' : '';
            onChange({
              selectedSymptoms: Array.from(current),
              additionalDetails: (existingDetails + finalText).trim()
            });
          } else if (detectedNew) {
            onChange({
              selectedSymptoms: Array.from(current)
            });
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setVoiceStatus('permission-denied');
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser settings to speak.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech was detected. Tap retry and speak clearly near the microphone.');
          setVoiceStatus('idle');
        } else {
          setVoiceError(`Audio recognition error: ${event.error}. Please retry or type below.`);
          setVoiceStatus('idle');
        }
      };

      recognition.onend = () => {
        if (voiceStatus === 'listening' || voiceStatus === 'speech-detected') {
          setVoiceStatus('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setVoiceStatus('idle');
      setVoiceError(err?.message || 'Unable to start speech recognition.');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors
      }
      setVoiceStatus('idle');
    }
  };

  const clearVoiceInput = () => {
    setLiveTranscript('');
    setVoiceError(null);
    setVoiceStatus('idle');
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
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-charcoal-950 leading-tight">
          Symptoms and Duration
        </h1>
        <p className="text-sm text-charcoal-600 mt-2">
          Select or describe the primary symptoms you are currently experiencing.
        </p>
      </div>

      {/* Dynamic Emergency Red Flag Alert */}
      {isCriticalSymptom && (
        <div className="mb-6 p-4 rounded-2xl bg-triage-red-light border border-triage-red-border text-charcoal-900 flex items-start gap-3 shadow-subtle">
          <AlertTriangle className="w-5 h-5 text-triage-red shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-triage-red block mb-0.5">
              Urgent Clinical Alert: Potential High-Acuity Indicator
            </span>
            You have reported symptoms (such as Chest Pain or Breathing Difficulty) that require prompt clinical evaluation. If you are experiencing crushing chest tightness, severe shortness of breath, or collapse, proceed immediately to the nearest Emergency Room or activate emergency services (108).
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VOICE INTAKE CONSOLE (Apple Health Inspired) */}
      {/* ========================================================= */}
      <div className="mb-6 bg-white border border-charcoal-200 rounded-2xl p-4 sm:p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              voiceStatus === 'listening' || voiceStatus === 'speech-detected'
                ? 'bg-triage-red text-white'
                : 'bg-forest-50 text-forest-800'
            }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-charcoal-900 block">
                Hands-Free Voice Symptom Intake
              </span>
              <span className="text-[11px] text-charcoal-500">
                Speak symptoms naturally (e.g., &quot;I have fever, severe cough, and chest discomfort&quot;)
              </span>
            </div>
          </div>

          {/* Voice Action Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {voiceStatus === 'listening' || voiceStatus === 'speech-detected' ? (
              <button
                type="button"
                onClick={stopVoiceInput}
                className="px-3.5 py-1.5 rounded-full bg-triage-red hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Stop Listening</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={voiceStatus === 'unsupported'}
                className="px-4 py-1.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Speak Symptoms</span>
              </button>
            )}

            {liveTranscript && (
              <button
                type="button"
                onClick={clearVoiceInput}
                className="px-2.5 py-1.5 rounded-full border border-charcoal-200 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50 text-xs transition-colors"
                title="Clear spoken text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Audio / Status Feedback */}
        {voiceStatus === 'listening' && (
          <div className="pt-3 flex items-center gap-2 text-xs text-forest-800 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-forest-700" />
            <span>Listening for spoken symptoms... Speak clearly into your device microphone.</span>
          </div>
        )}

        {/* Spoken Words as Editable Text Output */}
        {liveTranscript && (
          <div className="mt-3 p-3 rounded-xl bg-ivory-50 border border-charcoal-200 animate-fade-in">
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-500 block mb-1">
              Transcribed Voice Input (Editable):
            </span>
            <input
              type="text"
              value={liveTranscript}
              onChange={(e) => {
                setLiveTranscript(e.target.value);
                // Also update additional details
                onChange({ additionalDetails: e.target.value });
              }}
              className="w-full bg-transparent text-xs text-charcoal-900 font-medium focus:outline-none"
              placeholder="Spoken words appear here..."
            />
          </div>
        )}

        {/* Error / Permission State Display */}
        {voiceError && (
          <div className="mt-3 p-3 rounded-xl bg-triage-red-light border border-triage-red-border text-xs text-triage-red flex items-start justify-between gap-2">
            <span>{voiceError}</span>
            <button
              type="button"
              onClick={startVoiceInput}
              className="underline font-semibold shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {voiceStatus === 'unsupported' && (
          <div className="mt-3 text-xs text-charcoal-500">
            Voice input is not supported in this browser. You can type and select your symptoms below.
          </div>
        )}
      </div>

      {/* Main Grid: Left Selection + Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Symptom Picker & Duration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-charcoal-200 rounded-2xl p-5 shadow-apple">
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search symptoms (e.g., fever, cough, chest pain...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 placeholder:text-charcoal-400 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
            </div>

            {/* Chips Grid */}
            <div className="mb-2">
              <span className="text-[11px] font-bold text-charcoal-500 tracking-wider uppercase block mb-3">
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
                  placeholder="Specify any additional symptoms or sensations..."
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

        {/* Right Column: Selected list, Severity & Details (5 cols) */}
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

            {/* Additional Details Textarea */}
            <div>
              <label className="text-[11px] font-bold text-charcoal-500 tracking-wider uppercase block mb-2">
                Clinical Context & Notes (optional)
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
