import type { AssessmentFormData, TriageCategory, TriageLabel } from '../types';

export interface EvaluatedTriage {
  category: TriageCategory;
  triageLabel: TriageLabel;
  plainLanguageSummary: string;
  recommendedAction: string;
  targetResponseTime: string;
}

export function evaluateTriage(data: AssessmentFormData): EvaluatedTriage {
  const { vitals, symptoms } = data;
  const sList = symptoms.selectedSymptoms || [];

  // 1. EMERGENCY (RED) TRIGGERS
  const hasCriticalSymptom = sList.some(s => 
    s.toLowerCase().includes('chest pain') ||
    s.toLowerCase().includes('breathing difficulty') ||
    s.toLowerCase().includes('collapse')
  );

  const isSevereHypoxia = vitals.isSpo2Measured && vitals.oxygenSaturation !== null && vitals.oxygenSaturation < 92;
  const isSevereHypertension = vitals.isBpMeasured && vitals.systolicBp !== null && vitals.systolicBp >= 180;
  const isSevereHypotension = vitals.isBpMeasured && vitals.systolicBp !== null && vitals.systolicBp < 90;
  const isSevereTachycardia = vitals.isHeartRateMeasured && vitals.heartRate !== null && vitals.heartRate > 130;
  const isSevereBradycardia = vitals.isHeartRateMeasured && vitals.heartRate !== null && vitals.heartRate < 45;
  const isSevereRespRate = vitals.isRespRateMeasured && vitals.respiratoryRate !== null && (vitals.respiratoryRate > 28 || vitals.respiratoryRate < 10);
  const isSevereGeneral = symptoms.severity === 'Severe' && (sList.includes('Abdominal pain') || sList.includes('Dizziness') || sList.includes('Weakness'));

  if (hasCriticalSymptom || isSevereHypoxia || isSevereHypertension || isSevereHypotension || isSevereTachycardia || isSevereBradycardia || isSevereRespRate) {
    return {
      category: 'RED',
      triageLabel: 'Emergency',
      plainLanguageSummary: 'Requires immediate medical attention. High priority evaluation required.',
      recommendedAction: 'Proceed immediately to the emergency triage desk. Do not wait in general registration.',
      targetResponseTime: 'Immediate (Within 5–10 minutes)'
    };
  }

  // 2. URGENT (YELLOW) TRIGGERS
  const isModerateHypoxia = vitals.isSpo2Measured && vitals.oxygenSaturation !== null && vitals.oxygenSaturation >= 92 && vitals.oxygenSaturation <= 94;
  const isHighFeverProlonged = sList.includes('Fever') && symptoms.duration === '>2_days';
  const isModerateBP = vitals.isBpMeasured && vitals.systolicBp !== null && ((vitals.systolicBp >= 150 && vitals.systolicBp < 180) || (vitals.systolicBp >= 90 && vitals.systolicBp <= 95));
  const hasUrgentSymptoms = sList.includes('Abdominal pain') || sList.includes('Weakness') || sList.includes('Dizziness') || sList.includes('Vomiting');
  const isModerateSeverity = symptoms.severity === 'Moderate' && sList.length >= 2;

  if (isModerateHypoxia || isHighFeverProlonged || isModerateBP || hasUrgentSymptoms || isModerateSeverity || isSevereGeneral) {
    return {
      category: 'YELLOW',
      triageLabel: 'Urgent',
      plainLanguageSummary: 'Should be seen by a doctor within a few hours.',
      recommendedAction: 'Proceed to priority outpatient clinic or urgent care queue for physician evaluation.',
      targetResponseTime: 'Prompt (Within 1–2 hours)'
    };
  }

  // 3. LOWER URGENCY (GREEN) TRIGGERS
  // Never automatically assign BLACK. Black is clinician-confirmed deceased only.
  return {
    category: 'GREEN',
    triageLabel: 'Lower urgency',
    plainLanguageSummary: 'Can likely wait. Follow recommended advice and monitor symptoms.',
    recommendedAction: 'Standard consultation queue. If symptoms worsen, notify hospital staff immediately.',
    targetResponseTime: 'Routine (Within 2–4 hours)'
  };
}
