import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import type { AssessmentFormData, EncounterRecord } from '../types';
import { evaluateTriage } from '../lib/triageEngine';
import { saveEncounter, generateUHID, generateEncounterNumber } from '../lib/store';
import { audioAlert } from '../lib/audioAlert';
import { api } from '../lib/api';
import {
  ArrowLeft,
  Mic,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

const COMMON_SYMPTOM_CHIPS = [
  'Fever',
  'Cough',
  'Headache',
  'Chest pain',
  'Breathing difficulty',
  'Abdominal pain',
  'Nausea',
  'Vomiting',
  'Dizziness',
  'Weakness',
  'Sore throat',
  'Body ache'
];

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState<AssessmentFormData>({
    patient: {
      fullName: 'Self Intake',
      dobDay: '15',
      dobMonth: 'Jan',
      dobYear: '1995',
      age: 30,
      gender: 'Male',
      contactNumber: '9876543210',
      location: 'Dehradun, Uttarakhand',
    },
    vitals: {
      isBpMeasured: true,
      systolicBp: 120,
      diastolicBp: 80,
      isHeartRateMeasured: true,
      heartRate: 72,
      isTempMeasured: true,
      temperature: 36.8,
      isSpo2Measured: true,
      oxygenSaturation: 98,
      isRespRateMeasured: true,
      respiratoryRate: 16,
      isSugarMeasured: false,
      bloodSugar: 100,
    },
    symptoms: {
      selectedSymptoms: [],
      otherSymptomsText: '',
      duration: '<24_hours',
      severity: 'Moderate',
      additionalDetails: '',
    },
    history: {
      conditions: [],
      medications: [],
      noMedications: true,
      allergies: [],
      noAllergies: true,
      uploadedDocuments: [],
    },
    consentAgreed: true,
  });

  // Speech Recognition State for Step 1
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Pick up any symptoms dictated from Homepage hero
  useEffect(() => {
    try {
      const heroSymptoms = sessionStorage.getItem('meditriage_hero_symptoms');
      if (heroSymptoms) {
        sessionStorage.removeItem('meditriage_hero_symptoms');
        setFormData((prev) => ({
          ...prev,
          symptoms: {
            ...prev.symptoms,
            additionalDetails: heroSymptoms,
            otherSymptomsText: heroSymptoms,
          }
        }));
      }
    } catch {
      // quiet
    }
  }, []);

  // Voice dictation handling
  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      setVoiceNotice(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const textToAdd = (final || interim).trim();
        if (textToAdd) {
          setFormData((prev) => {
            const currentText = prev.symptoms.additionalDetails || '';
            const updated = final
              ? (currentText ? currentText + ' ' : '') + final
              : currentText || interim;

            return {
              ...prev,
              symptoms: {
                ...prev.symptoms,
                additionalDetails: updated.slice(0, 500),
                otherSymptomsText: updated.slice(0, 500)
              }
            };
          });
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          setVoiceNotice('No speech detected. Tap to speak again.');
        } else {
          setVoiceNotice(`Audio notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setVoiceNotice(e?.message || 'Unable to access microphone.');
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const toggleSymptomChip = (sym: string) => {
    setFormData((prev) => {
      const current = prev.symptoms.selectedSymptoms || [];
      const updated = current.includes(sym)
        ? current.filter((s) => s !== sym)
        : [...current, sym];

      return {
        ...prev,
        symptoms: {
          ...prev.symptoms,
          selectedSymptoms: updated
        }
      };
    });
  };

  const isStep1Valid =
    (formData.symptoms.additionalDetails && formData.symptoms.additionalDetails.trim().length > 0) ||
    formData.symptoms.selectedSymptoms.length > 0;

  const isCriticalWarning =
    formData.symptoms.selectedSymptoms.includes('Chest pain') ||
    formData.symptoms.selectedSymptoms.includes('Breathing difficulty') ||
    (formData.symptoms.additionalDetails &&
      (formData.symptoms.additionalDetails.toLowerCase().includes('chest pain') ||
        formData.symptoms.additionalDetails.toLowerCase().includes('breathless')));

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const triage = evaluateTriage(formData);

      if (triage.category === 'RED' || triage.isSerious) {
        audioAlert.playSeriousAlarm();
      }

      const encounterId = 'enc-' + Math.random().toString(36).substring(2, 9);
      const uhid = generateUHID();
      const encounterNum = generateEncounterNumber();

      const newRecord: EncounterRecord = {
        id: encounterId,
        uhid,
        encounterNumber: encounterNum,
        patientName: formData.patient.fullName || 'Patient',
        age: formData.patient.age,
        gender: formData.patient.gender,
        contactNumber: formData.patient.contactNumber,
        location: formData.patient.location,
        category: triage.category,
        triageLabel: triage.triageLabel,
        plainLanguageSummary: triage.plainLanguageSummary,
        recommendedAction: triage.recommendedAction,
        waitTimeMinutes: triage.category === 'RED' ? 5 : triage.category === 'YELLOW' ? 25 : 45,
        status: 'Waiting',
        createdAt: new Date().toISOString(),
        vitals: formData.vitals,
        symptoms: formData.symptoms,
        history: formData.history,
      };

      let finalId = newRecord.id;
      try {
        const apiRes = await api.createEncounter(formData);
        if (apiRes && apiRes.success && apiRes.encounter) {
          saveEncounter(apiRes.encounter);
          finalId = apiRes.encounter.id;
        } else {
          saveEncounter(newRecord);
        }
      } catch {
        saveEncounter(newRecord);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/result/${finalId}`);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900 relative">
      <Navbar isAssessmentFlow onExit={() => setShowExitConfirm(true)} />

      {/* Background Soft Mint Medical Cross Watermark (Matching Screen 2 in Mockup) */}
      <div className="absolute top-28 right-8 sm:right-16 text-teal-100/40 pointer-events-none select-none hidden lg:block -z-0">
        <svg width="220" height="220" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5h-5.5V5a1.5 1.5 0 0 0-3 0v5.5H5a1.5 1.5 0 0 0 0 3h5.5V19a1.5 1.5 0 0 0 3 0v-5.5H19a1.5 1.5 0 0 0 0-3z" />
        </svg>
      </div>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 relative z-10 space-y-6">
        
        {/* Subnav: ← Back to Home matching mockup */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          {/* Progress Bar Label: Step 1 of 3 */}
          <span className="text-xs font-bold text-slate-600">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Clean Progress Bar matching Mockup */}
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#138A72] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* ========================================================= */}
        {/* STEP 1: "WHAT ARE YOU EXPERIENCING?" (Exact Screen 2)     */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Heading & Subtitle */}
            <div>
              <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                What are you experiencing?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Describe your symptoms in your own words.
              </p>
            </div>

            {/* Critical Emergency Warning Alert if detected */}
            {isCriticalWarning && (
              <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-red-200 text-slate-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#D93829] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-[#D93829] block mb-0.5">High-Acuity Symptom Alert</strong>
                  Symptoms like chest pain or difficulty breathing may require immediate attention. If severe, call 108 or go to the nearest emergency department right away.
                </div>
              </div>
            )}

            {/* Large Text Area Card with Character Counter (Matching Mockup) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2">
              <textarea
                rows={5}
                maxLength={500}
                value={formData.symptoms.additionalDetails}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    symptoms: {
                      ...prev.symptoms,
                      additionalDetails: e.target.value,
                      otherSymptomsText: e.target.value
                    }
                  }))
                }
                placeholder="e.g. I have a fever and sore throat..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Type naturally or tap speak below</span>
                <span className="font-mono">
                  {formData.symptoms.additionalDetails?.length || 0}/500
                </span>
              </div>
            </div>

            {/* "or" Divider */}
            <div className="flex items-center gap-3 justify-center text-xs text-slate-400 font-medium">
              <div className="h-[1px] bg-slate-200 flex-1 max-w-[120px]" />
              <span>or</span>
              <div className="h-[1px] bg-slate-200 flex-1 max-w-[120px]" />
            </div>

            {/* Large Voice Card (Exact Match to Screen 2 in Mockup) */}
            <div className="bg-[#EAF7F4] border border-teal-100/80 rounded-2xl p-6 sm:p-8 text-center space-y-3">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={isListening ? stopVoice : startVoice}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-sm ${
                    isListening
                      ? 'bg-[#D93829] text-white animate-pulse'
                      : 'bg-[#0D382F] hover:bg-[#092822] text-white'
                  }`}
                  aria-label={isListening ? 'Stop voice recording' : 'Tap to speak'}
                >
                  <Mic className="w-6 h-6" />
                </button>
              </div>

              <div>
                <span className="font-bold text-sm text-slate-900 block">
                  {isListening ? 'Listening to your voice...' : 'Tap to speak'}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your spoken words will be converted to text
                </p>
              </div>

              {voiceNotice && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 max-w-sm mx-auto">
                  {voiceNotice}
                </div>
              )}
            </div>

            {/* Quick Symptom Chips Picker */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Select Symptoms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOM_CHIPS.map((chip) => {
                  const selected = formData.symptoms.selectedSymptoms.includes(chip);
                  return (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => toggleSymptomChip(chip)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selected
                          ? 'bg-[#0D382F] text-white font-semibold'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="px-6 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 rounded-full bg-[#0D382F] hover:bg-[#092822] text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: DURATION, SEVERITY & BASIC CONTEXT                */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            
            <div>
              <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Duration & Severity
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Help us understand the timeline and impact of your symptoms.
              </p>
            </div>

            {/* Duration Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                How long have you felt this way?
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Under 24h', value: '<24_hours' },
                  { label: '1–2 Days', value: '1-2_days' },
                  { label: 'Over 2 Days', value: '>2_days' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        symptoms: { ...prev.symptoms, duration: opt.value as any }
                      }))
                    }
                    className={`py-3 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      formData.symptoms.duration === opt.value
                        ? 'bg-[#0D382F] text-white border-[#0D382F]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Severity Level
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        symptoms: { ...prev.symptoms, severity: sev }
                      }))
                    }
                    className={`py-3 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      formData.symptoms.severity === sev
                        ? sev === 'Severe'
                          ? 'bg-[#D93829] text-white border-[#D93829]'
                          : 'bg-[#0D382F] text-white border-[#0D382F]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Context (Age & Gender) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Patient Demographics
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={formData.patient.age}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        patient: { ...prev.patient, age: parseInt(e.target.value) || 30 }
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Gender</label>
                  <select
                    value={formData.patient.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        patient: { ...prev.patient, gender: e.target.value as any }
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 rounded-full bg-[#0D382F] hover:bg-[#092822] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
              >
                Review & Submit →
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: REVIEW & TRIAGE EVALUATION                        */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            
            <div>
              <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Review & Evaluate
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Verify your reported complaints before generating triage assessment results.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Reported Symptoms:
                </span>
                <p className="text-xs sm:text-sm text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                  {formData.symptoms.additionalDetails ||
                    (formData.symptoms.selectedSymptoms.length > 0
                      ? formData.symptoms.selectedSymptoms.join(', ')
                      : 'No detailed symptoms provided')}
                </p>

                {formData.symptoms.selectedSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.symptoms.selectedSymptoms.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-semibold text-slate-800">{formData.symptoms.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Severity</span>
                  <span className="font-semibold text-slate-800">{formData.symptoms.severity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
                  <span className="font-semibold text-slate-800">
                    {formData.patient.age} yrs • {formData.patient.gender}
                  </span>
                </div>
              </div>

            </div>

            {/* Consent Notice */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                By proceeding, you understand this evaluation provides clinical decision support and guidance. In life-threatening emergencies, call 108 immediately.
              </span>
            </div>

            {/* Navigation & Submit CTA */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-8 py-3 rounded-full bg-[#0D382F] hover:bg-[#092822] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Evaluating Clinical Triage...' : 'View Assessment Results →'}</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Exit Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Exit Assessment?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your entered symptoms will not be saved if you leave now.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-full bg-[#D93829] text-white text-xs font-semibold hover:bg-red-700"
              >
                Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400">
        MediTriage AI • Clinical Decision Support
      </footer>
    </div>
  );
};
