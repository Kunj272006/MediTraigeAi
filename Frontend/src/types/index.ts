export type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export type TriageLabel = 'Emergency' | 'Urgent' | 'Lower urgency' | 'Deceased';

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
