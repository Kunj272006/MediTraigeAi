import React from 'react';
import type { AssessmentFormData } from '../types';
import { ShieldCheck, Edit3, ArrowRight, Loader2 } from 'lucide-react';

interface Step5Props {
  data: AssessmentFormData;
  onEditSection: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  onConsentChange: (agreed: boolean) => void;
}

export const Step5ReviewSubmit: React.FC<Step5Props> = ({
  data,
  onEditSection,
  onSubmit,
  onBack,
  isSubmitting,
  onConsentChange,
}) => {
  const { patient, vitals, symptoms, history, consentAgreed } = data;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-charcoal-900 leading-tight">
          Review Your Information
        </h1>
        <p className="text-sm text-charcoal-600 mt-2">
          Please review your details before submitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4 Review Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Personal Details */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <div className="flex items-center justify-between mb-3 border-b border-charcoal-100 pb-2">
              <span className="text-xs font-bold text-charcoal-800 tracking-wide uppercase">
                Personal Details
              </span>
              <button
                type="button"
                onClick={() => onEditSection(1)}
                className="inline-flex items-center gap-1 text-xs text-forest-800 font-semibold hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-charcoal-400">Name:</span>
              <span className="font-semibold text-charcoal-800">{patient.fullName || '—'}</span>

              <span className="text-charcoal-400">Age:</span>
              <span className="font-semibold text-charcoal-800">{patient.age} years</span>

              <span className="text-charcoal-400">Gender:</span>
              <span className="font-semibold text-charcoal-800">{patient.gender}</span>

              <span className="text-charcoal-400">Contact:</span>
              <span className="font-semibold text-charcoal-800">+91 {patient.contactNumber}</span>

              <span className="text-charcoal-400">Location:</span>
              <span className="font-semibold text-charcoal-800">{patient.location}</span>
            </div>
          </div>

          {/* Card 2: Symptoms */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <div className="flex items-center justify-between mb-3 border-b border-charcoal-100 pb-2">
              <span className="text-xs font-bold text-charcoal-800 tracking-wide uppercase">
                Symptoms
              </span>
              <button
                type="button"
                onClick={() => onEditSection(3)}
                className="inline-flex items-center gap-1 text-xs text-forest-800 font-semibold hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-charcoal-400">Symptoms:</span>
              <span className="font-semibold text-charcoal-800">
                {symptoms.selectedSymptoms.join(', ') || 'None selected'}
              </span>

              <span className="text-charcoal-400">Severity:</span>
              <span className="font-semibold text-charcoal-800">{symptoms.severity}</span>

              <span className="text-charcoal-400">Duration:</span>
              <span className="font-semibold text-charcoal-800">
                {symptoms.duration === '<24_hours'
                  ? 'Less than 24 hours'
                  : symptoms.duration === '1-2_days'
                  ? '1 - 2 days'
                  : 'More than 2 days'}
              </span>

              {symptoms.additionalDetails && (
                <>
                  <span className="text-charcoal-400">Notes:</span>
                  <span className="font-semibold text-charcoal-800">{symptoms.additionalDetails}</span>
                </>
              )}
            </div>
          </div>

          {/* Card 3: Health Measurements */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <div className="flex items-center justify-between mb-3 border-b border-charcoal-100 pb-2">
              <span className="text-xs font-bold text-charcoal-800 tracking-wide uppercase">
                Health Measurements
              </span>
              <button
                type="button"
                onClick={() => onEditSection(2)}
                className="inline-flex items-center gap-1 text-xs text-forest-800 font-semibold hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-charcoal-400">Blood Pressure:</span>
              <span className="font-semibold text-charcoal-800">
                {vitals.isBpMeasured && vitals.systolicBp && vitals.diastolicBp
                  ? `${vitals.systolicBp} / ${vitals.diastolicBp} mmHg`
                  : 'Not measured'}
              </span>

              <span className="text-charcoal-400">Heart Rate:</span>
              <span className="font-semibold text-charcoal-800">
                {vitals.isHeartRateMeasured && vitals.heartRate
                  ? `${vitals.heartRate} bpm`
                  : 'Not measured'}
              </span>

              <span className="text-charcoal-400">Temperature:</span>
              <span className="font-semibold text-charcoal-800">
                {vitals.isTempMeasured && vitals.temperature
                  ? `${vitals.temperature} °C`
                  : 'Not measured'}
              </span>

              <span className="text-charcoal-400">SpO₂:</span>
              <span className="font-semibold text-charcoal-800">
                {vitals.isSpo2Measured && vitals.oxygenSaturation
                  ? `${vitals.oxygenSaturation} %`
                  : 'Not measured'}
              </span>

              <span className="text-charcoal-400">Respiratory Rate:</span>
              <span className="font-semibold text-charcoal-800">
                {vitals.isRespRateMeasured && vitals.respiratoryRate
                  ? `${vitals.respiratoryRate} /min`
                  : 'Not measured'}
              </span>

              <span className="text-charcoal-400">Blood Sugar:</span>
              <span className="font-semibold text-charcoal-800">
                {vitals.isSugarMeasured && vitals.bloodSugar
                  ? `${vitals.bloodSugar} mg/dL`
                  : 'Not measured'}
              </span>
            </div>
          </div>

          {/* Card 4: Medical History */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <div className="flex items-center justify-between mb-3 border-b border-charcoal-100 pb-2">
              <span className="text-xs font-bold text-charcoal-800 tracking-wide uppercase">
                Medical History
              </span>
              <button
                type="button"
                onClick={() => onEditSection(4)}
                className="inline-flex items-center gap-1 text-xs text-forest-800 font-semibold hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-charcoal-400">Conditions:</span>
              <span className="font-semibold text-charcoal-800">
                {history.conditions.join(', ') || 'None reported'}
              </span>

              <span className="text-charcoal-400">Medications:</span>
              <span className="font-semibold text-charcoal-800">
                {history.noMedications
                  ? 'No regular medications'
                  : history.medications.join(', ') || 'None'}
              </span>

              <span className="text-charcoal-400">Allergies:</span>
              <span className="font-semibold text-charcoal-800">
                {history.noAllergies
                  ? 'No known allergies'
                  : history.allergies.join(', ') || 'None'}
              </span>

              {history.uploadedDocuments && history.uploadedDocuments.length > 0 && (
                <>
                  <span className="text-charcoal-400">Documents:</span>
                  <span className="font-semibold text-charcoal-800">
                    {history.uploadedDocuments.map((d) => d.name).join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: "Almost Done" Submit Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-medium text-charcoal-900 mb-1">
                Almost Done
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                By submitting, you confirm that the information provided is accurate to the best of your knowledge.
              </p>
            </div>

            <label className="flex items-start gap-2.5 pt-2 text-xs text-charcoal-700 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => onConsentChange(e.target.checked)}
                className="mt-0.5 rounded text-forest-800 focus:ring-forest-800 accent-forest-800"
              />
              <span className="leading-tight">
                I agree to the terms and understand this is a preliminary triage assessment only.
              </span>
            </label>

            <button
              type="button"
              disabled={!consentAgreed || isSubmitting}
              onClick={onSubmit}
              className="w-full py-3.5 px-6 rounded-full bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Assessment...</span>
                </>
              ) : (
                <>
                  <span>Submit Assessment</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-start">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};
