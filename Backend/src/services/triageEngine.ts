import type { TriageCategory, TriageLabel, VitalsData, SymptomsData } from '../types/index.js';

export interface EvaluatedTriage {
  category: TriageCategory;
  triageLabel: TriageLabel;
  warningTitle: string;
  plainLanguageSummary: string;
  recommendedAction: string;
  targetResponseTime: string;
  isSerious: boolean;
}

export function evaluateTriage(vitals: VitalsData, symptoms: SymptomsData): EvaluatedTriage {
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
      warningTitle: 'Immediate Resuscitation (5–10 min)',
      plainLanguageSummary: 'Serious condition requiring immediate emergency medical intervention within 5-10 minutes.',
      recommendedAction: 'Proceed immediately to high-acuity emergency resuscitation bay. Alert on-duty trauma surgeon.',
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
    return {
      category: 'YELLOW',
      triageLabel: 'Urgent',
      warningTitle: 'Urgent Examination (30–60 min)',
      plainLanguageSummary: 'Condition is clinically stable but urgent, requiring prioritized physician examination within 30-60 minutes.',
      recommendedAction: 'Assign to urgent care assessment area. Check vital signs every 30 minutes.',
      targetResponseTime: '30min-1hr (Urgent)',
      isSerious: false
    };
  }

  // 3. LOWER URGENCY (GREEN) TRIGGERS
  return {
    category: 'GREEN',
    triageLabel: 'Lower urgency',
    warningTitle: 'Standard Consultation (2–4 hrs)',
    plainLanguageSummary: 'Standard condition suitable for outpatient clinic examination within 2-4 hours.',
    recommendedAction: 'Assign to standard outpatient queue. Re-assess if symptoms escalate.',
    targetResponseTime: '2-4 hours (Standard)',
    isSerious: false
  };
}

export function generateUHID(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MID-${year}-${rand}`;
}

export function generateEncounterNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ENC-${rand}`;
}
