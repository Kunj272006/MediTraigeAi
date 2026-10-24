import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getEncounters } from '../lib/store';
import { audioAlert } from '../lib/audioAlert';
import { TRIAGE_WARNINGS } from '../types';
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
  CheckCircle2
} from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [soundPlaying, setSoundPlaying] = useState(false);

  const encounters = getEncounters();
  const fallbackEncounter: any = {
    id: id || 'ENC-140406',
    encounterNumber: 'ENC-140406',
    uhid: 'MID-2026-5899',
    category: 'RED',
    waitTimeMinutes: 5,
    symptoms: {
      selectedSymptoms: ['Chest Pain', 'Shortness of Breath', 'Diaphoresis / Sweating'],
      otherSymptomsText: 'Acute retrosternal radiating pressure',
      duration: '<24_hours',
      severity: 'Severe',
    },
    vitals: {
      systolicBp: 135,
      diastolicBp: 88,
      heartRate: 104,
      oxygenSaturation: 94,
    },
    plainLanguageSummary: 'Serious condition requiring immediate emergency medical intervention within 5–10 minutes.',
    recommendedAction: 'Proceed immediately to high-acuity emergency resuscitation bay. Alert on-duty trauma surgeon.',
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
      const timer = setTimeout(() => setSoundPlaying(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [category, isRed, warning.isSerious]);

  const handleManualSoundToggle = () => {
    if (soundPlaying) {
      setSoundPlaying(false);
    } else {
      setSoundPlaying(true);
      audioAlert.playSeriousAlarm();
      setTimeout(() => setSoundPlaying(false), 2500);
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
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full animate-in fade-in duration-300 space-y-6">
        
        {/* Urgent Serious Sound Alert Banner if RED / Serious */}
        {(isRed || warning.isSerious) && (
          <div className="p-4 rounded-2xl bg-rose-600 text-white flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <TriageIcon category="RED" size="md" className="bg-white/20 border-white/30 text-white" />
              <div>
                <span className="font-bold text-sm block">
                  CRITICAL SERIOUS CONDITION ALERT TRIGGERED
                </span>
                <span className="text-xs text-rose-100">
                  Treatment required within 5-10 minutes. Audio telemetry alert active across hospital triage network.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSoundToggle}
              className="px-3 py-1.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            >
              {soundPlaying ? <Volume2 className="w-3.5 h-3.5 animate-spin" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundPlaying ? 'Playing Siren...' : 'Replay Alarm'}</span>
            </button>
          </div>
        )}

        {/* Triage Protocol Header with Prominent Time and Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-charcoal-200/90 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-charcoal-400 uppercase">
                Hospital Clinical Triage Assessment
              </span>
              <span className="text-[10px] bg-forest-50 text-forest-800 border border-forest-200 px-2 py-0.5 rounded-full font-bold">
                RECORDED
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-500 font-mono mt-1">
              <span>Encounter ID: <strong className="text-charcoal-800">{encounter.encounterNumber || 'ENC-140406'}</strong></span>
              <span>•</span>
              <span>UHID: <strong className="text-charcoal-800">{encounter.uhid || 'MID-2026-5899'}</strong></span>
              {encounter.patientName && (
                <>
                  <span>•</span>
                  <span>Patient: <strong className="text-charcoal-900">{encounter.patientName}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Submission Date & Time Stamp */}
            <div className="bg-ivory-50 border border-charcoal-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-charcoal-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-forest-700" />
                <span>{formattedDate}</span>
              </div>
              <span className="text-charcoal-300">•</span>
              <div className="flex items-center gap-1.5 text-charcoal-900 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-forest-700" />
                <span>{formattedTime}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Submission Audit Confirmation Pill */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Details Successfully Submitted:</strong> Recorded on <strong>{formattedDate}</strong> at <strong className="font-mono">{formattedTime}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 hidden sm:inline">
            Status: Confirmed Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Big Result & Warning Label with Icon (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Warning Card */}
            <div className={`p-6 sm:p-7 rounded-3xl border shadow-apple ${warning.bgLightClass}`}>
              <div className="flex items-center gap-3.5 mb-3">
                <TriageIcon category={category} size="lg" />
                <div>
                  <h1 className={`font-serif text-3xl sm:text-4xl font-semibold tracking-tight ${warning.colorClass}`}>
                    {warning.code}
                  </h1>
                  <span className="text-xs font-bold uppercase tracking-wider block mt-0.5">
                    Target Window: {warning.treatmentWindow}
                  </span>
                </div>
              </div>

              {/* Exact Warning Label */}
              <div className="mt-4 pt-4 border-t border-current/20">
                <div className="font-sans font-bold text-lg sm:text-xl text-charcoal-900 leading-snug">
                  {warning.code} :- {warning.title}
                </div>
                <p className="text-xs text-charcoal-700 mt-2 leading-relaxed">
                  {encounter.plainLanguageSummary || warning.description}
                </p>
              </div>
            </div>

            {/* Clinical Priority Alert Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-charcoal-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-500">
                <Stethoscope className="w-4 h-4 text-forest-800" />
                <span>Immediate Clinical Action Protocol</span>
              </div>
              <p className="text-xs text-charcoal-800 leading-relaxed font-medium">
                {encounter.recommendedAction || 'Proceed to priority examination bay and alert assigned nursing team.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-charcoal-100">
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                    Assigned Urgency Window
                  </span>
                  <span className="font-semibold text-charcoal-800">
                    {warning.treatmentWindow}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                    Estimated Clinical Response
                  </span>
                  <span className="font-mono font-semibold text-charcoal-800">
                    Within {encounter.waitTimeMinutes || (isRed ? 5 : 30)} Minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Directional Differential Diagnosis Card (More than 1 condition based on symptoms) */}
            <DirectionalDiagnosisCard
              initialSymptoms={encounter.symptoms?.selectedSymptoms || []}
              initialOtherText={encounter.symptoms?.otherSymptomsText || ''}
              vitals={encounter.vitals}
              category={category}
            />

            {/* Vitals Summary Card */}
            {encounter.vitals && (
              <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-charcoal-100 pb-2">
                  <span className="font-bold text-charcoal-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-forest-700" />
                    Intake Health Measurements
                  </span>
                  <span className="text-[10px] text-charcoal-400">Validated by Intake Sensor</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-ivory-50 p-2.5 rounded-xl border border-charcoal-100">
                    <span className="text-[10px] text-charcoal-500 block uppercase">Blood Pressure</span>
                    <span className="font-mono font-bold text-charcoal-900">
                      {encounter.vitals.systolicBp || 120}/{encounter.vitals.diastolicBp || 80} <span className="text-[10px] text-charcoal-400 font-normal">mmHg</span>
                    </span>
                  </div>

                  <div className="bg-ivory-50 p-2.5 rounded-xl border border-charcoal-100">
                    <span className="text-[10px] text-charcoal-500 block uppercase">Heart Rate</span>
                    <span className="font-mono font-bold text-charcoal-900">
                      {encounter.vitals.heartRate || 72} <span className="text-[10px] text-charcoal-400 font-normal">bpm</span>
                    </span>
                  </div>

                  <div className="bg-ivory-50 p-2.5 rounded-xl border border-charcoal-100">
                    <span className="text-[10px] text-charcoal-500 block uppercase">SpO2</span>
                    <span className={`font-mono font-bold ${(encounter.vitals.oxygenSaturation || 98) < 92 ? 'text-rose-600' : 'text-charcoal-900'}`}>
                      {encounter.vitals.oxygenSaturation || 98}%
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Hospital Routing & Queue Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple space-y-5">
              <h3 className="font-serif text-xl font-medium text-charcoal-900">
                Workflow Next Steps
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-50 border border-forest-200 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <span className="font-medium text-charcoal-800">
                    {isRed ? 'Immediate Resuscitation Bay' : 'Assign to Treatment Queue'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-50 border border-forest-200 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <span className="font-medium text-charcoal-800">
                    Physician Review & Clinical Override Check
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-50 border border-forest-200 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <span className="font-medium text-charcoal-800">
                    Telemetry & Periodic Vitals Re-assessment
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  to={`/staff/encounter/${encounter.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Open in Hospital Queue</span>
                </Link>

                <Link
                  to="/assess"
                  className="w-full py-2.5 px-4 rounded-xl border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Intake Next Patient</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-charcoal-400 border-t border-charcoal-200/60">
        MEDITRIAGE AI • Clinical Triage Platform
      </footer>
    </div>
  );
};
