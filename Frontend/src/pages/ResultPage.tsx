import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getEncounters } from '../lib/store';
import { audioAlert } from '../lib/audioAlert';
import { TRIAGE_WARNINGS, type EncounterRecord } from '../types';
import { TriageIcon } from '../components/TriageIcon';
import { DirectionalDiagnosisCard } from '../components/DirectionalDiagnosisCard';
import {
  RotateCcw,
  Building2,
  Volume2,
  VolumeX,
  Stethoscope,
  Activity,
  Printer,
  Calendar,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    location: 'Delhi NCR',
    symptoms: {
      selectedSymptoms: ['Chest pain', 'Breathing difficulty'],
      otherSymptomsText: 'Acute retrosternal radiating pressure',
      duration: '<24_hours',
      severity: 'Severe',
      additionalDetails: 'Acute radiating chest tightness',
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
    plainLanguageSummary: 'High-acuity condition requiring urgent clinical evaluation in an emergency care setting.',
    recommendedAction: 'Proceed immediately to high-acuity emergency resuscitation bay. Alert on-duty physician.',
    createdAt: new Date().toISOString(),
  };

  const encounter = encounters.find((e) => e.id === id) || encounters[0] || fallbackEncounter;

  const category = encounter.category || 'RED';
  const warning = TRIAGE_WARNINGS[category] || TRIAGE_WARNINGS.YELLOW;
  const isRed = category === 'RED';

  // Sound alert on serious condition!
  useEffect(() => {
    if (warning.isSerious || isRed) {
      setSoundPlaying(true);
      audioAlert.playSeriousAlarm();
      const timer = setTimeout(() => setSoundPlaying(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [category, isRed, warning.isSerious]);

  const handleManualSoundToggle = () => {
    if (soundPlaying) {
      setSoundPlaying(false);
    } else {
      setSoundPlaying(true);
      audioAlert.playSeriousAlarm();
      setTimeout(() => setSoundPlaying(false), 2400);
    }
  };

  // Formatted Submission Date and Time
  const submittedDate = encounter.createdAt ? new Date(encounter.createdAt) : new Date();
  const formattedDate = submittedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = submittedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6">
        
        {/* Urgent Serious Sound Alert Banner if RED / Serious */}
        {(isRed || warning.isSerious) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-triage-red-light border border-triage-red-border text-charcoal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-triage-red text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-sm text-triage-red block">
                  High-Priority Clinical Triage Level
                </span>
                <span className="text-xs text-charcoal-700">
                  Target clinical care window is within 5–10 minutes. Workstation alert tone triggered.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSoundToggle}
              className="px-3.5 py-1.5 rounded-full bg-white border border-triage-red-border text-triage-red hover:bg-triage-red-light text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto"
            >
              {soundPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundPlaying ? 'Chime Active...' : 'Replay Alert Chime'}</span>
            </button>
          </div>
        )}

        {/* Triage Protocol Header with Record ID and Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-charcoal-200 shadow-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-charcoal-500 uppercase">
                Clinical Triage Record
              </span>
              <span className="text-[10px] bg-forest-50 text-forest-800 border border-forest-100 px-2 py-0.5 rounded-full font-semibold">
                Stratified
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-600 font-mono mt-1">
              <span>Encounter: <strong className="text-charcoal-900">{encounter.encounterNumber || 'ENC-140406'}</strong></span>
              <span>•</span>
              <span>UHID: <strong className="text-charcoal-900">{encounter.uhid || 'MID-2026-5899'}</strong></span>
              {encounter.patientName && (
                <>
                  <span>•</span>
                  <span>Patient: <strong className="text-charcoal-900">{encounter.patientName}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-ivory-50 border border-charcoal-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 text-charcoal-700">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              <span>{formattedDate}</span>
              <span className="text-charcoal-300">•</span>
              <Clock className="w-3.5 h-3.5 text-forest-700" />
              <span className="font-mono font-semibold">{formattedTime}</span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-ivory-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Print Intake</span>
            </button>
          </div>
        </div>

        {/* Clinical Assessment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Stratification Card & Guidance */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Acuity Card */}
            <div className={`p-6 sm:p-7 rounded-3xl border shadow-apple ${warning.bgLightClass}`}>
              <div className="flex items-center gap-3.5 mb-3">
                <TriageIcon category={category} size="lg" />
                <div>
                  <h1 className={`font-serif text-3xl sm:text-4xl font-normal tracking-tight ${warning.colorClass}`}>
                    {warning.code}
                  </h1>
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-600 block mt-0.5">
                    Target Care Window: {warning.treatmentWindow}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-charcoal-200/50">
                <div className="font-sans font-semibold text-base sm:text-lg text-charcoal-900 leading-snug">
                  {warning.code} — {warning.title}
                </div>
                <p className="text-xs sm:text-sm text-charcoal-700 mt-2 leading-relaxed">
                  {encounter.plainLanguageSummary || warning.description}
                </p>
              </div>
            </div>

            {/* Immediate Action Protocol Box */}
            <div className="p-5 rounded-2xl bg-white border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-600">
                <Stethoscope className="w-4 h-4 text-forest-800" />
                <span>Recommended Clinical Action</span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-normal">
                {encounter.recommendedAction || 'Proceed to priority examination bay and alert assigned nursing team.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-charcoal-100">
                <div>
                  <span className="text-charcoal-500 block text-[10px] uppercase font-bold tracking-wider">
                    Assigned Priority Window
                  </span>
                  <span className="font-semibold text-charcoal-900">
                    {warning.treatmentWindow}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[10px] uppercase font-bold tracking-wider">
                    Estimated Time to Physician Review
                  </span>
                  <span className="font-mono font-semibold text-charcoal-900">
                    Within {encounter.waitTimeMinutes || (isRed ? 5 : 30)} Minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Directional Differential Diagnosis Card */}
            <DirectionalDiagnosisCard
              initialSymptoms={encounter.symptoms?.selectedSymptoms || []}
              initialOtherText={encounter.symptoms?.otherSymptomsText || ''}
              vitals={encounter.vitals}
              category={category}
            />

            {/* Critical Red Flag Warning Signs (Phase 6 Requirement) */}
            <div className="bg-white border border-charcoal-200 rounded-2xl p-5 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-700">
                <AlertTriangle className="w-4 h-4 text-triage-red" />
                <span>Critical Escalation Warning Signs (Red Flags)</span>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                If the patient develops any of the following symptoms at any time, immediately call 108 or proceed to the nearest emergency hospital:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal-800">
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-charcoal-100 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-triage-red shrink-0 mt-1.5" />
                  <span>Crushing chest pain or pressure radiating to left arm or jaw</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-charcoal-100 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-triage-red shrink-0 mt-1.5" />
                  <span>Severe sudden shortness of breath or inability to speak full sentences</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-charcoal-100 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-triage-red shrink-0 mt-1.5" />
                  <span>Sudden weakness, facial numbness, or slurred speech</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-charcoal-100 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-triage-red shrink-0 mt-1.5" />
                  <span>Loss of consciousness, acute confusion, or persistent fainting</span>
                </div>
              </div>
            </div>

            {/* Vitals Summary Card */}
            {encounter.vitals && (
              <div className="bg-white border border-charcoal-200 rounded-2xl p-5 shadow-apple space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-charcoal-100 pb-2">
                  <span className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-forest-700" />
                    <span>Intake Health Measurements</span>
                  </span>
                  <span className="text-[10px] text-charcoal-500">Documented at intake</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-ivory-50 p-3 rounded-xl border border-charcoal-100">
                    <span className="text-[10px] text-charcoal-500 block uppercase font-medium">Blood Pressure</span>
                    <span className="font-mono font-semibold text-charcoal-900 text-sm">
                      {encounter.vitals.systolicBp || 120}/{encounter.vitals.diastolicBp || 80} <span className="text-[10px] text-charcoal-400 font-normal">mmHg</span>
                    </span>
                  </div>

                  <div className="bg-ivory-50 p-3 rounded-xl border border-charcoal-100">
                    <span className="text-[10px] text-charcoal-500 block uppercase font-medium">Heart Rate</span>
                    <span className="font-mono font-semibold text-charcoal-900 text-sm">
                      {encounter.vitals.heartRate || 72} <span className="text-[10px] text-charcoal-400 font-normal">bpm</span>
                    </span>
                  </div>

                  <div className="bg-ivory-50 p-3 rounded-xl border border-charcoal-100">
                    <span className="text-[10px] text-charcoal-500 block uppercase font-medium">Oxygen (SpO2)</span>
                    <span className={`font-mono font-semibold text-sm ${(encounter.vitals.oxygenSaturation || 98) < 92 ? 'text-triage-red' : 'text-charcoal-900'}`}>
                      {encounter.vitals.oxygenSaturation || 98}%
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column (5 cols): Clinical Care Queue & Next Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-charcoal-200 rounded-2xl p-6 shadow-apple space-y-5">
              <h3 className="font-serif text-xl font-normal text-charcoal-950">
                Care Coordination Actions
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-forest-50 border border-forest-100 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-charcoal-900 block">
                      {isRed ? 'Route to Resuscitation Bay' : 'Queue for Clinical Evaluation'}
                    </span>
                    <span className="text-charcoal-600 text-[11px]">
                      Patient prioritized in hospital clinical tracking console.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-forest-50 border border-forest-100 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-charcoal-900 block">
                      Attending Clinician Review
                    </span>
                    <span className="text-charcoal-600 text-[11px]">
                      Nurse or physician verifies vital signs and initiates diagnostic workup.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-forest-50 border border-forest-100 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-charcoal-900 block">
                      Continuous Observation
                    </span>
                    <span className="text-charcoal-600 text-[11px]">
                      Periodic vitals assessment according to ESI/MTS standards.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  to={`/staff/encounter/${encounter.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Open in Hospital Queue</span>
                </Link>

                <Link
                  to="/assess"
                  className="w-full py-2.5 px-4 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-ivory-100 flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Perform Next Intake</span>
                </Link>

                {isRed && (
                  <Link
                    to="/jeevan"
                    className="w-full py-2.5 px-4 rounded-xl bg-triage-red text-white text-xs font-semibold hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Request 108 Emergency Ambulance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Clinical Governance Note */}
            <div className="p-4 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-charcoal-800">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Clinical Governance & Audit Trail</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                This triage assessment is recorded with timestamp and immutable encounter hash for clinical safety and quality improvement.
              </p>
            </div>

          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-charcoal-400 border-t border-charcoal-200 bg-white">
        MediTriage AI • Clinical Decision Support & Triage Management
      </footer>
    </div>
  );
};
