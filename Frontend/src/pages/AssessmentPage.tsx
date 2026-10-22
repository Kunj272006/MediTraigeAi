import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Stepper } from '../components/Stepper';
import { Step1PatientDetails } from '../components/Step1PatientDetails';
import { Step2HealthMeasurements } from '../components/Step2HealthMeasurements';
import { Step3Symptoms } from '../components/Step3Symptoms';
import { Step4MedicalHistory } from '../components/Step4MedicalHistory';
import { Step5ReviewSubmit } from '../components/Step5ReviewSubmit';
import type { AssessmentFormData, EncounterRecord } from '../types';
import { evaluateTriage } from '../lib/triageEngine';
import { saveEncounter, generateUHID, generateEncounterNumber } from '../lib/store';
import { audioAlert } from '../lib/audioAlert';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Initial Form State
  const [formData, setFormData] = useState<AssessmentFormData>({
    patient: {
      fullName: '',
      dobDay: '24',
      dobMonth: 'Mar',
      dobYear: '2001',
      age: 24,
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
      isSugarMeasured: true,
      bloodSugar: 120,
    },
    symptoms: {
      selectedSymptoms: ['Fever', 'Cough'],
      otherSymptomsText: '',
      duration: '<24_hours',
      severity: 'Moderate',
      additionalDetails: 'Started yesterday evening after rain exposure.',
    },
    history: {
      conditions: ['Diabetes (Type 2)', 'Hypertension'],
      medications: ['Metformin 500mg'],
      noMedications: false,
      allergies: ['No known allergies'],
      noAllergies: true,
      uploadedDocuments: [],
    },
    consentAgreed: true,
  });

  const handlePatientChange = (updates: Partial<AssessmentFormData['patient']>) => {
    setFormData((prev) => ({ ...prev, patient: { ...prev.patient, ...updates } }));
  };

  const handleVitalsChange = (updates: Partial<AssessmentFormData['vitals']>) => {
    setFormData((prev) => ({ ...prev, vitals: { ...prev.vitals, ...updates } }));
  };

  const handleSymptomsChange = (updates: Partial<AssessmentFormData['symptoms']>) => {
    setFormData((prev) => ({ ...prev, symptoms: { ...prev.symptoms, ...updates } }));
  };

  const handleHistoryChange = (updates: Partial<AssessmentFormData['history']>) => {
    setFormData((prev) => ({ ...prev, history: { ...prev.history, ...updates } }));
  };

  const handleConsentChange = (agreed: boolean) => {
    setFormData((prev) => ({ ...prev, consentAgreed: agreed }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 1. Evaluate triage priority
      const triage = evaluateTriage(formData);

      // Play alert chime if Emergency priority
      if (triage.category === 'RED') {
        audioAlert.playCriticalChime();
      }

      // 2. Generate identifiers
      const encounterId = 'enc-' + Math.random().toString(36).substring(2, 9);
      const uhid = generateUHID();
      const encounterNum = generateEncounterNumber();

      const newRecord: EncounterRecord = {
        id: encounterId,
        uhid,
        encounterNumber: encounterNum,
        patientName: formData.patient.fullName,
        age: formData.patient.age,
        gender: formData.patient.gender,
        contactNumber: `+91 ${formData.patient.contactNumber}`,
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

      // 3. Save to store
      saveEncounter(newRecord);

      // 4. Brief simulated delay for clean processing feedback
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/result/${newRecord.id}`);
      }, 600);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between">
      <Navbar isAssessmentFlow onExit={() => setShowExitConfirm(true)} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
        <Stepper
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

        <div className="mt-2">
          {currentStep === 1 && (
            <Step1PatientDetails
              data={formData.patient}
              onChange={handlePatientChange}
              onNext={() => setCurrentStep(2)}
              onBack={() => setShowExitConfirm(true)}
            />
          )}

          {currentStep === 2 && (
            <Step2HealthMeasurements
              data={formData.vitals}
              onChange={handleVitalsChange}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3Symptoms
              data={formData.symptoms}
              onChange={handleSymptomsChange}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4MedicalHistory
              data={formData.history}
              onChange={handleHistoryChange}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5ReviewSubmit
              data={formData}
              onEditSection={(step) => setCurrentStep(step)}
              onSubmit={handleFinalSubmit}
              onBack={() => setCurrentStep(4)}
              isSubmitting={isSubmitting}
              onConsentChange={handleConsentChange}
            />
          )}
        </div>
      </main>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-charcoal-200 animate-in zoom-in-95">
            <h3 className="font-serif text-xl font-medium text-charcoal-900 mb-2">
              Exit Assessment?
            </h3>
            <p className="text-xs text-charcoal-600 mb-6 leading-relaxed">
              If you exit now, your entered health readings and information will not be submitted to the hospital triage desk.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100"
              >
                Continue Assessment
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2 rounded-full bg-triage-red text-white text-xs font-semibold hover:bg-red-700"
              >
                Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
