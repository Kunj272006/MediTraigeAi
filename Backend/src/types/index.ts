export type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export type TriageLabel = 'Emergency' | 'Urgent' | 'Lower urgency' | 'Deceased';

export type SubscriptionPlanTier = 'MONTHLY' | 'HALF_YEARLY' | 'YEARLY';

export type EncounterStatus = 'Waiting' | 'In Consult' | 'Being Seen' | 'Completed' | 'Transferred';

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

export interface SymptomsData {
  selectedSymptoms: string[];
  otherSymptomsText: string;
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  additionalDetails: string;
}

export interface MedicalHistoryData {
  conditions: string[];
  medications: string[];
  noMedications: boolean;
  allergies: string[];
  noAllergies: boolean;
  uploadedDocuments: { id: string; name: string; size: string; type: string }[];
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
  status: EncounterStatus;
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
  passwordHash?: string;
}

export interface AuditLogEntry {
  id: string;
  encounterId?: string;
  uhid?: string;
  action: 'REGISTRATION' | 'TRIAGE_CALCULATED' | 'CLINICIAN_OVERRIDE' | 'STATUS_CHANGE' | 'PLAN_UPGRADE';
  performedBy: string;
  details: string;
  timestamp: string;
}
