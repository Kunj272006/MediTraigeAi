import type { AssessmentFormData, TriageCategory, TriageLabel } from '../types';
import { TRIAGE_WARNINGS } from '../types';

export interface EvaluatedTriage {
  category: TriageCategory;
  triageLabel: TriageLabel;
  emoji: string;
  warningTitle: string;
  plainLanguageSummary: string;
  recommendedAction: string;
  targetResponseTime: string;
  isSerious: boolean;
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
    const info = TRIAGE_WARNINGS.RED;
    return {
      category: 'RED',
      triageLabel: 'Emergency',
      emoji: info.emoji,
      warningTitle: info.title,
      plainLanguageSummary: 'Serious treatment with in 5-10 mins. Immediate emergency medical intervention required.',
      recommendedAction: 'Proceed immediately to the emergency resuscitation bay. Alert the on-duty trauma surgeon.',
      targetResponseTime: '5-10 mins (Emergency)',
      isSerious: true
    };
  }

  // 2. URGENT (YELLOW) TRIGGERS
  const isModerateHypoxia = vitals.isSpo2Measured && vitals.oxygenSaturation !== null && vitals.oxygenSaturation >= 92 && vitals.oxygenSaturation <= 94;
  const isHighFeverProlonged = sList.includes('Fever') && symptoms.duration === '>2_days';
  const isModerateBP = vitals.isBpMeasured && vitals.systolicBp !== null && ((vitals.systolicBp >= 150 && vitals.systolicBp < 180) || (vitals.systolicBp >= 90 && vitals.systolicBp <= 95));
  const hasUrgentSymptoms = sList.includes('Abdominal pain') || sList.includes('Weakness') || sList.includes('Dizziness') || sList.includes('Vomiting');
  const isModerateSeverity = symptoms.severity === 'Moderate' && sList.length >= 2;

  if (isModerateHypoxia || isHighFeverProlonged || isModerateBP || hasUrgentSymptoms || isModerateSeverity || isSevereGeneral) {
    const info = TRIAGE_WARNINGS.YELLOW;
    return {
      category: 'YELLOW',
      triageLabel: 'Urgent',
      emoji: info.emoji,
      warningTitle: info.title,
      plainLanguageSummary: 'stable but serious 30min-1hr. Requires prioritized physician assessment.',
      recommendedAction: 'Assign to urgent care assessment area. Check vitals every 30 minutes.',
      targetResponseTime: '30min-1hr (Urgent)',
      isSerious: false
    };
  }

  // 3. LOWER URGENCY (GREEN) TRIGGERS
  // Never automatically assign BLACK. Black is clinician-confirmed deceased only.
  const greenInfo = TRIAGE_WARNINGS.GREEN;
  return {
    category: 'GREEN',
    triageLabel: 'Lower urgency',
    emoji: greenInfo.emoji,
    warningTitle: greenInfo.title,
    plainLanguageSummary: 'normal condition treatment under 2-4 hour. Routine consultation appropriate.',
    recommendedAction: 'Standard OPD consultation queue. Monitor for symptom change or distress.',
    targetResponseTime: '2-4 hours (Normal Condition)',
    isSerious: false
  };
}
