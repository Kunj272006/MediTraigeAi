import type { EncounterRecord } from '../types';

const STORAGE_KEY = 'meditriage_encounters_v1';

export const INITIAL_MOCK_ENCOUNTERS: EncounterRecord[] = [
  {
    id: 'enc-1',
    uhid: 'MID-2025-7843',
    encounterNumber: 'ENC-908124',
    patientName: 'Aarav Singh',
    age: 24,
    gender: 'Male',
    contactNumber: '+91 98765 43210',
    location: 'Dehradun, Uttarakhand',
    category: 'YELLOW',
    triageLabel: 'Urgent',
    plainLanguageSummary: 'You should be seen by a doctor within a few hours.',
    recommendedAction: 'Visit a doctor within a few hours. Consider visiting a nearby clinic or hospital.',
    waitTimeMinutes: 28,
    status: 'Waiting',
    createdAt: '2026-10-23T14:50:00Z',
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
      bloodSugar: 120
    },
    symptoms: {
      selectedSymptoms: ['Fever', 'Cough'],
      otherSymptomsText: '',
      duration: '<24_hours',
      severity: 'Moderate',
      additionalDetails: 'Started yesterday evening after rain exposure.'
    },
    history: {
      conditions: ['Diabetes (Type 2)', 'Hypertension'],
      medications: ['Metformin 500mg'],
      noMedications: false,
      allergies: ['No known allergies'],
      noAllergies: true,
      uploadedDocuments: [
        { id: 'doc-1', name: 'Prescription_Sep2026.pdf', size: '1.2 MB', type: 'application/pdf' }
      ]
    }
  },
  {
    id: 'enc-2',
    uhid: 'MET-2025-7842',
    encounterNumber: 'ENC-908123',
    patientName: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    contactNumber: '+91 98111 22334',
    location: 'Dehradun, Uttarakhand',
    category: 'RED',
    triageLabel: 'Emergency',
    plainLanguageSummary: 'Requires immediate medical attention. Acute chest tightness reported.',
    recommendedAction: 'Immediate triage nurse evaluation and emergency physician bed assignment.',
    waitTimeMinutes: 5,
    status: 'In Consult',
    createdAt: '2026-10-23T15:13:00Z',
    vitals: {
      isBpMeasured: true,
      systolicBp: 165,
      diastolicBp: 100,
      isHeartRateMeasured: true,
      heartRate: 118,
      isTempMeasured: true,
      temperature: 37.2,
      isSpo2Measured: true,
      oxygenSaturation: 94,
      isRespRateMeasured: true,
      respiratoryRate: 24,
      isSugarMeasured: false,
      bloodSugar: null
    },
    symptoms: {
      selectedSymptoms: ['Chest pain', 'Breathing difficulty'],
      otherSymptomsText: 'Radiating pain to left shoulder',
      duration: '<24_hours',
      severity: 'Severe',
      additionalDetails: 'Sudden onset while walking upstairs.'
    },
    history: {
      conditions: ['Hypertension'],
      medications: ['Amlodipine 5mg'],
      noMedications: false,
      allergies: ['Penicillin'],
      noAllergies: false,
      uploadedDocuments: []
    }
  },
  {
    id: 'enc-3',
    uhid: 'MET-2025-7841',
    encounterNumber: 'ENC-908122',
    patientName: 'Rohan Mehta',
    age: 45,
    gender: 'Male',
    contactNumber: '+91 97234 56789',
    location: 'Rishikesh, Uttarakhand',
    category: 'RED',
    triageLabel: 'Emergency',
    plainLanguageSummary: 'Severe breathlessness and SpO2 below critical threshold.',
    recommendedAction: 'Immediate oxygen administration and physician review.',
    waitTimeMinutes: 12,
    status: 'Being Seen',
    createdAt: '2026-10-23T15:06:00Z',
    vitals: {
      isBpMeasured: true,
      systolicBp: 140,
      diastolicBp: 88,
      isHeartRateMeasured: true,
      heartRate: 104,
      isTempMeasured: true,
      temperature: 38.1,
      isSpo2Measured: true,
      oxygenSaturation: 90,
      isRespRateMeasured: true,
      respiratoryRate: 26,
      isSugarMeasured: true,
      bloodSugar: 145
    },
    symptoms: {
      selectedSymptoms: ['Breathing difficulty', 'Cough', 'Fever'],
      otherSymptomsText: '',
      duration: '1-2_days',
      severity: 'Severe',
      additionalDetails: 'History of asthma, inhaler not relieving tightness.'
    },
    history: {
      conditions: ['Asthma'],
      medications: ['Salbutamol Inhaler'],
      noMedications: false,
      allergies: ['Dust'],
      noAllergies: false,
      uploadedDocuments: []
    }
  },
  {
    id: 'enc-4',
    uhid: 'MET-2025-7840',
    encounterNumber: 'ENC-908121',
    patientName: 'Neha Verma',
    age: 28,
    gender: 'Female',
    contactNumber: '+91 94567 89012',
    location: 'Haridwar, Uttarakhand',
    category: 'GREEN',
    triageLabel: 'Lower urgency',
    plainLanguageSummary: 'Mild tension headache, stable vital signs.',
    recommendedAction: 'Routine OPD consultation. Rest and hydration advised.',
    waitTimeMinutes: 24,
    status: 'Waiting',
    createdAt: '2026-10-23T14:54:00Z',
    vitals: {
      isBpMeasured: true,
      systolicBp: 115,
      diastolicBp: 75,
      isHeartRateMeasured: true,
      heartRate: 70,
      isTempMeasured: true,
      temperature: 36.6,
      isSpo2Measured: true,
      oxygenSaturation: 99,
      isRespRateMeasured: true,
      respiratoryRate: 14,
      isSugarMeasured: false,
      bloodSugar: null
    },
    symptoms: {
      selectedSymptoms: ['Headache', 'Dizziness'],
      otherSymptomsText: '',
      duration: '1-2_days',
      severity: 'Mild',
      additionalDetails: 'Worse after long computer screen work.'
    },
    history: {
      conditions: [],
      medications: [],
      noMedications: true,
      allergies: [],
      noAllergies: true,
      uploadedDocuments: []
    }
  },
  {
    id: 'enc-5',
    uhid: 'MET-2025-7839',
    encounterNumber: 'ENC-908120',
    patientName: 'Karan Patel',
    age: 56,
    gender: 'Male',
    contactNumber: '+91 96123 45678',
    location: 'Dehradun, Uttarakhand',
    category: 'GREEN',
    triageLabel: 'Lower urgency',
    plainLanguageSummary: 'Generalized mild weakness without focal deficits.',
    recommendedAction: 'General physician checkup and basic metabolic panel.',
    waitTimeMinutes: 40,
    status: 'Completed',
    createdAt: '2026-10-23T14:38:00Z',
    vitals: {
      isBpMeasured: true,
      systolicBp: 128,
      diastolicBp: 82,
      isHeartRateMeasured: true,
      heartRate: 76,
      isTempMeasured: true,
      temperature: 36.9,
      isSpo2Measured: true,
      oxygenSaturation: 97,
      isRespRateMeasured: true,
      respiratoryRate: 16,
      isSugarMeasured: true,
      bloodSugar: 110
    },
    symptoms: {
      selectedSymptoms: ['Weakness'],
      otherSymptomsText: 'Fatigue on exertion',
      duration: '>2_days',
      severity: 'Mild',
      additionalDetails: 'Feeling sluggish over the past week.'
    },
    history: {
      conditions: ['High Cholesterol'],
      medications: ['Atorvastatin 10mg'],
      noMedications: false,
      allergies: [],
      noAllergies: true,
      uploadedDocuments: []
    }
  },
  {
    id: 'enc-6',
    uhid: 'MET-2025-7835',
    encounterNumber: 'ENC-908115',
    patientName: 'Rajesh Sen',
    age: 72,
    gender: 'Male',
    contactNumber: '+91 91234 00000',
    location: 'Dehradun, Uttarakhand',
    category: 'BLACK',
    triageLabel: 'Deceased',
    plainLanguageSummary: 'Clinician-recorded deceased status (Hospital verified).',
    recommendedAction: 'Authorized clinical and legal protocols completed.',
    waitTimeMinutes: 65,
    status: 'Completed',
    createdAt: '2026-10-23T14:15:00Z',
    clinicianOverridden: true,
    overrideReason: 'Confirmed clinical death upon arrival after resuscitation protocol by Dr. A. Sharma.',
    overriddenBy: 'Dr. A. Sharma (Reg #MC-44921)',
    overriddenAt: '2026-10-23T14:20:00Z',
    vitals: {
      isBpMeasured: false,
      systolicBp: null,
      diastolicBp: null,
      isHeartRateMeasured: false,
      heartRate: null,
      isTempMeasured: false,
      temperature: null,
      isSpo2Measured: false,
      oxygenSaturation: null,
      isRespRateMeasured: false,
      respiratoryRate: null,
      isSugarMeasured: false,
      bloodSugar: null
    },
    symptoms: {
      selectedSymptoms: ['Unresponsive'],
      otherSymptomsText: 'Cardiac arrest en route',
      duration: '<24_hours',
      severity: 'Severe',
      additionalDetails: 'Brought dead to ED.'
    },
    history: {
      conditions: ['Coronary Artery Disease'],
      medications: [],
      noMedications: false,
      allergies: [],
      noAllergies: true,
      uploadedDocuments: []
    }
  }
];

export function getEncounters(): EncounterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ENCOUNTERS));
      return INITIAL_MOCK_ENCOUNTERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_ENCOUNTERS;
  }
}

export function saveEncounter(encounter: EncounterRecord): void {
  const current = getEncounters();
  const updated = [encounter, ...current.filter(e => e.id !== encounter.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateEncounter(id: string, updates: Partial<EncounterRecord>): EncounterRecord | null {
  const current = getEncounters();
  const index = current.findIndex(e => e.id === id);
  if (index === -1) return null;
  current[index] = { ...current[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current[index];
}

export function generateUHID(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MID-${dateStr.slice(0, 4)}-${rand}`;
}

export function generateEncounterNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ENC-${rand}`;
}
