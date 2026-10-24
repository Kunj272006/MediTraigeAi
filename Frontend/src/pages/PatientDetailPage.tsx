import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEncounters, updateEncounter } from '../lib/store';
import type { EncounterRecord, TriageCategory } from '../types';
import { TRIAGE_WARNINGS } from '../types';
import { audioAlert } from '../lib/audioAlert';
import { TriageIcon } from '../components/TriageIcon';
import { DirectionalDiagnosisCard } from '../components/DirectionalDiagnosisCard';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  FileText,
  Sparkles,
  Volume2
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const encounters = getEncounters();
  const currentEncounter = encounters.find((e) => e.id === id) || encounters[0];

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'DOCS' | 'AUDIT'>('OVERVIEW');
  const [encounter, setEncounter] = useState<EncounterRecord>(currentEncounter);

  // Clinician Override State
  const [overrideCategory, setOverrideCategory] = useState<TriageCategory>(currentEncounter.category);
  const [overrideReason, setOverrideReason] = useState<string>(currentEncounter.overrideReason || '');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // AI Scribe State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(encounter.aiSummary || null);

  const handleSaveOverride = () => {
    if (!overrideReason.trim()) {
      alert('A clinical justification reason is mandatory to override triage priority.');
      return;
    }

    setIsSaving(true);
    const warnInfo = TRIAGE_WARNINGS[overrideCategory];

    if (overrideCategory === 'RED') {
      audioAlert.playSeriousAlarm();
    }

    const updated = updateEncounter(encounter.id, {
      category: overrideCategory,
      triageLabel:
        overrideCategory === 'RED'
          ? 'Emergency'
          : overrideCategory === 'YELLOW'
          ? 'Urgent'
          : overrideCategory === 'GREEN'
          ? 'Lower urgency'
          : 'Deceased',
      plainLanguageSummary: `${warnInfo.code} :- ${warnInfo.title}. Clinician override assigned.`,
      clinicianOverridden: true,
      overrideReason: overrideReason.trim(),
      overriddenBy: 'Dr. A. Sharma (Reg #MC-44921)',
      overriddenAt: new Date().toISOString(),
    });

    setTimeout(() => {
      if (updated) setEncounter(updated);
      setIsSaving(false);
      setStatusMessage('Clinical triage override saved and recorded in audit log.');
      setTimeout(() => setStatusMessage(null), 3500);
    }, 400);
  };

  const handleUpdateStatus = (newStatus: EncounterRecord['status']) => {
    const updated = updateEncounter(encounter.id, { status: newStatus });
    if (updated) setEncounter(updated);
  };

  const generateAiHandover = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const summary = `Patient ${encounter.patientName} (${encounter.age}y ${encounter.gender}) presents with ${encounter.symptoms.selectedSymptoms.join(', ')} of ${encounter.symptoms.duration} duration, severity rated ${encounter.symptoms.severity}. Available vitals: BP ${encounter.vitals.systolicBp ?? 'NA'}/${encounter.vitals.diastolicBp ?? 'NA'}, SpO2 ${encounter.vitals.oxygenSaturation ?? 'NA'}%, HR ${encounter.vitals.heartRate ?? 'NA'} bpm. Relevant history: ${encounter.history.conditions.join(', ') || 'None'}. Preliminary triage: ${encounter.triageLabel}. Note: Preliminary summary for clinician review only.`;
      setAiSummary(summary);
      updateEncounter(encounter.id, { aiSummary: summary });
      setAiGenerating(false);
    }, 800);
  };

  const isRed = encounter.category === 'RED';
  const isYellow = encounter.category === 'YELLOW';
  const isGreen = encounter.category === 'GREEN';

  return (
    <div className="min-h-screen bg-ivory-100 text-charcoal-900 selection:bg-forest-100 selection:text-forest-900 p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Top Back Action */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/staff/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 px-3.5 py-2 rounded-xl hover:bg-ivory-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Queue</span>
        </button>

        <span className="text-xs text-charcoal-400">
          Encounter ID: <strong className="font-mono text-charcoal-800">{encounter.encounterNumber}</strong>
        </span>
      </div>

      {/* Patient Header Card (Matching Screen 09) */}
      <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="font-serif text-3xl font-medium text-charcoal-900">
              {encounter.patientName}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isRed
                  ? 'bg-triage-red-light text-triage-red'
                  : isYellow
                  ? 'bg-triage-yellow-light text-amber-700'
                  : isGreen
                  ? 'bg-triage-green-light text-emerald-800'
                  : 'bg-triage-black-light text-charcoal-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{encounter.triageLabel}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-500 font-medium">
            <span className="font-mono text-charcoal-700 font-semibold">{encounter.uhid}</span>
            <span>•</span>
            <span>{encounter.age} years</span>
            <span>•</span>
            <span>{encounter.gender}</span>
            <span>•</span>
            <span>{encounter.contactNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200 flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => handleUpdateStatus('Being Seen')}
            className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
              encounter.status === 'Being Seen'
                ? 'bg-emerald-700 text-white'
                : 'bg-forest-800 text-ivory-100 hover:bg-forest-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{encounter.status === 'Being Seen' ? 'In Consultation' : 'Mark as Seen'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-charcoal-200 mb-6 text-xs font-semibold text-charcoal-500">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'OVERVIEW' ? 'text-forest-900 border-b-2 border-forest-800' : 'hover:text-charcoal-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'HISTORY' ? 'text-forest-900 border-b-2 border-forest-800' : 'hover:text-charcoal-800'
          }`}
        >
          Medical History
        </button>
        <button
          onClick={() => setActiveTab('DOCS')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'DOCS' ? 'text-forest-900 border-b-2 border-forest-800' : 'hover:text-charcoal-800'
          }`}
        >
          Documents ({encounter.history.uploadedDocuments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'AUDIT' ? 'text-forest-900 border-b-2 border-forest-800' : 'hover:text-charcoal-800'
          }`}
        >
          Audit & Timeline
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {statusMessage}
        </div>
      )}

      {/* Main Grid: Left Clinical Overview + Right Clinician Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'OVERVIEW' && (
            <>
              {/* Vitals Summary Strip (Matching Screen 09 6 vitals boxes) */}
              <div>
                <span className="text-[10px] uppercase font-bold text-charcoal-500 block mb-2.5">
                  Recorded Health Measurements
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  <div className="bg-white border border-charcoal-200/90 rounded-xl p-3 text-center shadow-subtle">
                    <span className="text-[9px] uppercase font-bold text-charcoal-400 block">BP</span>
                    <span className="text-sm font-bold text-charcoal-900 mt-0.5 block">
                      {encounter.vitals.isBpMeasured && encounter.vitals.systolicBp
                        ? `${encounter.vitals.systolicBp}/${encounter.vitals.diastolicBp}`
                        : '—'}
                    </span>
                    <span className="text-[9px] text-charcoal-400">mmHg</span>
                  </div>

                  <div className="bg-white border border-charcoal-200/90 rounded-xl p-3 text-center shadow-subtle">
                    <span className="text-[9px] uppercase font-bold text-charcoal-400 block">Pulse</span>
                    <span className="text-sm font-bold text-charcoal-900 mt-0.5 block">
                      {encounter.vitals.isHeartRateMeasured && encounter.vitals.heartRate ? encounter.vitals.heartRate : '—'}
                    </span>
                    <span className="text-[9px] text-charcoal-400">bpm</span>
                  </div>

                  <div className="bg-white border border-charcoal-200/90 rounded-xl p-3 text-center shadow-subtle">
                    <span className="text-[9px] uppercase font-bold text-charcoal-400 block">Temp</span>
                    <span className="text-sm font-bold text-charcoal-900 mt-0.5 block">
                      {encounter.vitals.isTempMeasured && encounter.vitals.temperature ? encounter.vitals.temperature : '—'}
                    </span>
                    <span className="text-[9px] text-charcoal-400">°C</span>
                  </div>

                  <div className="bg-white border border-charcoal-200/90 rounded-xl p-3 text-center shadow-subtle">
                    <span className="text-[9px] uppercase font-bold text-charcoal-400 block">SpO₂</span>
                    <span className="text-sm font-bold text-charcoal-900 mt-0.5 block">
                      {encounter.vitals.isSpo2Measured && encounter.vitals.oxygenSaturation ? `${encounter.vitals.oxygenSaturation}%` : '—'}
                    </span>
                    <span className="text-[9px] text-charcoal-400">oxygen</span>
                  </div>

                  <div className="bg-white border border-charcoal-200/90 rounded-xl p-3 text-center shadow-subtle">
                    <span className="text-[9px] uppercase font-bold text-charcoal-400 block">Resp</span>
                    <span className="text-sm font-bold text-charcoal-900 mt-0.5 block">
                      {encounter.vitals.isRespRateMeasured && encounter.vitals.respiratoryRate ? encounter.vitals.respiratoryRate : '—'}
                    </span>
                    <span className="text-[9px] text-charcoal-400">/min</span>
                  </div>

                  <div className="bg-white border border-charcoal-200/90 rounded-xl p-3 text-center shadow-subtle">
                    <span className="text-[9px] uppercase font-bold text-charcoal-400 block">Sugar</span>
                    <span className="text-sm font-bold text-charcoal-900 mt-0.5 block">
                      {encounter.vitals.isSugarMeasured && encounter.vitals.bloodSugar ? encounter.vitals.bloodSugar : '—'}
                    </span>
                    <span className="text-[9px] text-charcoal-400">mg/dL</span>
                  </div>
                </div>
              </div>

              {/* Presenting Symptoms Card */}
              <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple space-y-3">
                <span className="text-xs font-bold text-charcoal-800 tracking-wide uppercase block border-b border-charcoal-100 pb-2">
                  Presenting Symptoms
                </span>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-charcoal-400">Symptoms:</span>
                  <span className="font-semibold text-charcoal-900">
                    {encounter.symptoms.selectedSymptoms.join(', ') || 'None'}
                  </span>

                  <span className="text-charcoal-400">Severity:</span>
                  <span className="font-semibold text-charcoal-900">
                    {encounter.symptoms.severity}
                  </span>

                  <span className="text-charcoal-400">Duration:</span>
                  <span className="font-semibold text-charcoal-900">
                    {encounter.symptoms.duration === '<24_hours'
                      ? 'Less than 24 hours'
                      : encounter.symptoms.duration === '1-2_days'
                      ? '1 - 2 days'
                      : 'More than 2 days'}
                  </span>

                  {encounter.symptoms.additionalDetails && (
                    <>
                      <span className="text-charcoal-400">Patient Notes:</span>
                      <span className="text-charcoal-800 italic">
                        "{encounter.symptoms.additionalDetails}"
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Directional Differential Diagnosis Card */}
              <DirectionalDiagnosisCard
                initialSymptoms={encounter.symptoms.selectedSymptoms || []}
                initialOtherText={encounter.symptoms.additionalDetails || encounter.symptoms.otherSymptomsText || ''}
                vitals={encounter.vitals}
                category={encounter.category}
              />

              {/* Medical History Summary Card */}
              <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple space-y-3">
                <span className="text-xs font-bold text-charcoal-800 tracking-wide uppercase block border-b border-charcoal-100 pb-2">
                  Reported Medical History
                </span>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-charcoal-400">Conditions:</span>
                  <span className="font-semibold text-charcoal-900">
                    {encounter.history.conditions.join(', ') || 'None reported'}
                  </span>

                  <span className="text-charcoal-400">Medications:</span>
                  <span className="font-semibold text-charcoal-900">
                    {encounter.history.noMedications
                      ? 'No regular medications'
                      : encounter.history.medications.join(', ') || 'None'}
                  </span>

                  <span className="text-charcoal-400">Allergies:</span>
                  <span className="font-semibold text-charcoal-900">
                    {encounter.history.noAllergies
                      ? 'No known allergies'
                      : encounter.history.allergies.join(', ') || 'None'}
                  </span>
                </div>
              </div>

              {/* Optional AI Handover Scribe Box */}
              <div className="bg-forest-50/70 border border-forest-100 rounded-2xl p-5 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-forest-800" />
                    <span className="text-xs font-bold text-forest-900 uppercase tracking-wide">
                      AI Clinical Handover Note (Gemini Assisted)
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={generateAiHandover}
                    className="px-3 py-1.5 rounded-full bg-forest-800 text-ivory-100 text-[10px] font-semibold hover:bg-forest-900 disabled:opacity-50"
                  >
                    {aiGenerating ? 'Generating...' : aiSummary ? 'Regenerate' : 'Generate Summary'}
                  </button>
                </div>
                {aiSummary ? (
                  <p className="text-xs text-charcoal-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-forest-100">
                    {aiSummary}
                  </p>
                ) : (
                  <p className="text-xs text-charcoal-500">
                    Click "Generate Summary" to extract structured handover notes for physician review.
                  </p>
                )}
              </div>
            </>
          )}

          {activeTab === 'HISTORY' && (
            <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple space-y-4 text-xs">
              <h3 className="font-serif text-lg font-medium text-charcoal-900">
                Detailed Medical Records
              </h3>
              <p className="text-charcoal-600">
                Known Chronic Diseases: {encounter.history.conditions.join(', ') || 'None'}
              </p>
              <p className="text-charcoal-600">
                Active Prescriptions: {encounter.history.medications.join(', ') || 'None'}
              </p>
              <p className="text-charcoal-600">
                Known Drug/Food Allergies: {encounter.history.allergies.join(', ') || 'None'}
              </p>
            </div>
          )}

          {activeTab === 'DOCS' && (
            <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple space-y-4">
              <h3 className="font-serif text-lg font-medium text-charcoal-900">
                Uploaded Prescriptions & Reports
              </h3>
              {(!encounter.history.uploadedDocuments || encounter.history.uploadedDocuments.length === 0) ? (
                <p className="text-xs text-charcoal-400">No documents uploaded for this encounter.</p>
              ) : (
                <div className="space-y-2">
                  {encounter.history.uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-charcoal-200 bg-ivory-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-forest-800" />
                        <span className="font-semibold text-charcoal-800">{doc.name}</span>
                        <span className="text-charcoal-400">({doc.size})</span>
                      </div>
                      <span className="text-[10px] font-bold text-forest-800 uppercase">
                        Encrypted Storage
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple space-y-3 text-xs">
              <h3 className="font-serif text-lg font-medium text-charcoal-900 mb-2">
                Audit Trail & Timeline
              </h3>
              <div className="space-y-3 border-l-2 border-forest-800/30 pl-4">
                <div>
                  <span className="text-[10px] text-charcoal-400 block font-mono">
                    {new Date(encounter.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="font-semibold text-charcoal-800">
                    Encounter Registered & Preliminary Triage Calculated
                  </span>
                </div>
                {encounter.clinicianOverridden && (
                  <div>
                    <span className="text-[10px] text-charcoal-400 block font-mono">
                      {encounter.overriddenAt ? new Date(encounter.overriddenAt).toLocaleTimeString() : 'Earlier'}
                    </span>
                    <span className="font-semibold text-charcoal-800">
                      Clinician Override recorded by {encounter.overriddenBy}
                    </span>
                    <p className="text-charcoal-600 italic mt-0.5">
                      "{encounter.overrideReason}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Triage Assessment & Clinician Override Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider block mb-1">
                Triage Clinical Status
              </span>
              <div className="flex items-center gap-3 mb-1">
                <TriageIcon category={encounter.category} size="md" />
                <h3 className="font-serif text-xl font-bold text-charcoal-900">
                  {TRIAGE_WARNINGS[encounter.category]?.code} :- {TRIAGE_WARNINGS[encounter.category]?.title}
                </h3>
              </div>
              <p className="text-xs text-charcoal-600 mt-2">
                {encounter.plainLanguageSummary}
              </p>
              {encounter.category === 'RED' && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TriageIcon category="RED" size="xs" badge={false} />
                    <span>Serious 5-10 min treatment window</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => audioAlert.playSeriousAlarm()}
                    className="underline hover:text-rose-950 flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play Alarm</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clinician Override Form */}
            <div className="pt-4 border-t border-charcoal-100 space-y-4">
              <span className="text-xs font-bold text-charcoal-800 tracking-wide uppercase block">
                Clinician Override (if needed)
              </span>

              <div>
                <label className="text-[10px] uppercase font-bold text-charcoal-500 block mb-1">
                  Select new category
                </label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value as TriageCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory-50 text-xs text-charcoal-900 font-semibold focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                >
                  <option value="RED">Red : Serious treatment with in 5-10 mins</option>
                  <option value="YELLOW">Yellow : stable but serious 30min-1hr</option>
                  <option value="GREEN">Green : normal condition treatment under 2-4 hour</option>
                  <option value="BLACK">Black : patient dead</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-charcoal-500 block mb-1">
                  Reason for override (required)
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Clinical justification for changing patient priority category..."
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory-50 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOverrideCategory(encounter.category);
                    setOverrideReason(encounter.overrideReason || '');
                  }}
                  className="px-4 py-2 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveOverride}
                  className="px-5 py-2 rounded-full bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
