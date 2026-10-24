export type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export type TriageLabel = 'Emergency' | 'Urgent' | 'Lower urgency' | 'Deceased';

export interface TriageWarningDefinition {
  category: TriageCategory;
  emoji: string;
  code: string;
  title: string;
  treatmentWindow: string;
  description: string;
  isSerious: boolean;
  colorClass: string;
  bgLightClass: string;
  badgeBorderClass: string;
}

export const TRIAGE_WARNINGS: Record<TriageCategory, TriageWarningDefinition> = {
  RED: {
    category: 'RED',
    emoji: '🚨',
    code: 'Red',
    title: 'Immediate Resuscitation (5–10 min)',
    treatmentWindow: '5–10 mins',
    description: 'Requires immediate emergency medical intervention and resuscitation.',
    isSerious: true,
    colorClass: 'text-rose-600',
    bgLightClass: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeBorderClass: 'border-rose-400 bg-rose-50/80 text-rose-800'
  },
  YELLOW: {
    category: 'YELLOW',
    emoji: '⚡',
    code: 'Yellow',
    title: 'Urgent Examination (30–60 min)',
    treatmentWindow: '30–60 mins',
    description: 'Patient is clinically stable but condition is serious requiring prompt attention.',
    isSerious: false,
    colorClass: 'text-amber-600',
    bgLightClass: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeBorderClass: 'border-amber-400 bg-amber-50/80 text-amber-800'
  },
  GREEN: {
    category: 'GREEN',
    emoji: '🩺',
    code: 'Green',
    title: 'Standard Consultation (2–4 hrs)',
    treatmentWindow: '2–4 hours',
    description: 'Normal condition, non-urgent consultation within routine outpatient window.',
    isSerious: false,
    colorClass: 'text-emerald-600',
    bgLightClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeBorderClass: 'border-emerald-400 bg-emerald-50/80 text-emerald-800'
  },
  BLACK: {
    category: 'BLACK',
    emoji: '🛑',
    code: 'Black',
    title: 'Expectant / Deceased Protocol',
    treatmentWindow: 'Deceased Protocol',
    description: 'Confirmed clinical death. Hospital protocol and documentation required.',
    isSerious: false,
    colorClass: 'text-neutral-900',
    bgLightClass: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    badgeBorderClass: 'border-neutral-400 bg-neutral-100 text-neutral-900'
  }
};

export type SubscriptionPlanTier = 'MONTHLY' | 'HALF_YEARLY' | 'YEARLY';

export interface SubscriptionPlan {
  id: SubscriptionPlanTier;
  name: string;
  durationLabel: string;
  durationMonths: number;
  price: number;
  priceFormatted: string;
  billingFrequency: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

export interface HospitalAccount {
  hospitalId: string;
  hospitalName: string;
  city: string;
  department: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  activePlan: SubscriptionPlanTier;
  planValidUntil: string;
  isAuthenticated: boolean;
}

export type PatientStatus = 'Waiting' | 'In Consult' | 'Being Seen' | 'Completed';

export interface VitalsData {
  isBpMeasured: boolean;
  systolicBp: number | null;
  diastolicBp: number | null;
  isHeartRateMeasured: boolean;
  heartRate: number | null;
  isTempMeasured: boolean;
  temperature: number | null;
  isSpo2Measured: boolean;
  oxygenSaturation: number | null;
  isRespRateMeasured: boolean;
  respiratoryRate: number | null;
  isSugarMeasured: boolean;
  bloodSugar: number | null;
}

export interface PatientDetailsData {
  fullName: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contactNumber: string;
  location: string;
}

export interface SymptomsData {
  selectedSymptoms: string[];
  otherSymptomsText: string;
  duration: '<24_hours' | '1-2_days' | '>2_days';
  severity: 'Mild' | 'Moderate' | 'Severe';
  additionalDetails: string;
}

export interface MedicalHistoryData {
  conditions: string[];
  medications: string[];
  noMedications: boolean;
  allergies: string[];
  noAllergies: boolean;
  uploadedDocuments: {
    id: string;
    name: string;
    size: string;
    type: string;
  }[];
}

export interface AssessmentFormData {
  patient: PatientDetailsData;
  vitals: VitalsData;
  symptoms: SymptomsData;
  history: MedicalHistoryData;
  consentAgreed: boolean;
}

export interface EncounterRecord {
  id: string;
  uhid: string;
  encounterNumber: string;
  patientName: string;
  age: number;
  gender: string;
  contactNumber: string;
  location: string;
  category: TriageCategory;
  triageLabel: TriageLabel;
  plainLanguageSummary: string;
  recommendedAction: string;
  waitTimeMinutes: number;
  status: PatientStatus;
  createdAt: string;
  vitals: VitalsData;
  symptoms: SymptomsData;
  history: MedicalHistoryData;
  clinicianOverridden?: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: string;
  aiSummary?: string;
}
