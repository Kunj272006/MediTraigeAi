import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { HospitalAccount, EncounterRecord, AuditLogEntry, SubscriptionPlanTier } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  hospitals: Record<string, HospitalAccount>;
  encounters: EncounterRecord[];
  auditLogs: AuditLogEntry[];
}

const SEED_HOSPITALS: Record<string, HospitalAccount> = {
  'HOSP-METRO-01': {
    hospitalId: 'HOSP-METRO-01',
    hospitalName: 'Metro City Multi-Specialty Hospital',
    city: 'New Delhi',
    department: 'Emergency & Acute Trauma Care',
    staffId: 'DR-SHARMA-ER',
    staffName: 'Dr. A. Sharma, MD',
    staffRole: 'Chief Emergency Triage Officer',
    activePlan: 'YEARLY',
    planValidUntil: '2027-10-31',
    passwordHash: 'hospital123'
  },
  'HOSP-APOLLO-02': {
    hospitalId: 'HOSP-APOLLO-02',
    hospitalName: 'Apollo Care Trauma Center',
    city: 'Dehradun',
    department: 'Urgent Care & Rapid Triage Unit',
    staffId: 'RN-PRIYA-04',
    staffName: 'Priya Joshi, RN',
    staffRole: 'Senior Triage Charge Nurse',
    activePlan: 'HALF_YEARLY',
    planValidUntil: '2027-04-15',
    passwordHash: 'hospital123'
  },
  'HOSP-CITY-03': {
    hospitalId: 'HOSP-CITY-03',
    hospitalName: 'City Public Health Hospital',
    city: 'Haridwar',
    department: 'General Outpatient & Triage Wing',
    staffId: 'STAFF-VERMA-01',
    staffName: 'R. K. Verma',
    staffRole: 'Clinical Intake Coordinator',
    activePlan: 'MONTHLY',
    planValidUntil: '2026-11-23',
    passwordHash: 'hospital123'
  }
};

const SEED_ENCOUNTERS: EncounterRecord[] = [
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
    plainLanguageSummary: 'Urgent Examination (30–60 min). Clinical check required within 30-60 minutes.',
    recommendedAction: 'Priority urgent care evaluation queue. Monitor vitals every 30 minutes.',
    waitTimeMinutes: 28,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
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
      uploadedDocuments: []
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
    location: 'New Delhi',
    category: 'RED',
    triageLabel: 'Emergency',
    plainLanguageSummary: 'Immediate Resuscitation (5–10 min). Acute chest pain and severe tachycardia.',
    recommendedAction: 'Immediate resuscitation bed assignment. Emergency ECG and oxygen.',
    waitTimeMinutes: 5,
    status: 'In Consult',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
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
    location: 'New Delhi',
    category: 'RED',
    triageLabel: 'Emergency',
    plainLanguageSummary: 'Immediate Resuscitation (5–10 min). Acute respiratory distress with severe SpO2 drop.',
    recommendedAction: 'Immediate high-flow oxygen telemetry bay. Nebulization protocol.',
    waitTimeMinutes: 12,
    status: 'Being Seen',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    vitals: {
      isBpMeasured: true,
      systolicBp: 140,
      diastolicBp: 90,
      isHeartRateMeasured: true,
      heartRate: 105,
      isTempMeasured: true,
      temperature: 38.4,
      isSpo2Measured: true,
      oxygenSaturation: 90,
      isRespRateMeasured: true,
      respiratoryRate: 28,
      isSugarMeasured: true,
      bloodSugar: 140
    },
    symptoms: {
      selectedSymptoms: ['Breathing difficulty', 'Cough', 'Fever'],
      otherSymptomsText: 'Wheezing sound on exhalation',
      duration: '1_2_days',
      severity: 'Severe',
      additionalDetails: 'Known asthmatic patient.'
    },
    history: {
      conditions: ['Asthma'],
      medications: ['Salbutamol Inhaler'],
      noMedications: false,
      allergies: ['Dust / Pollen'],
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
    location: 'New Delhi',
    category: 'GREEN',
    triageLabel: 'Lower urgency',
    plainLanguageSummary: 'Standard Consultation (2–4 hrs). Tension headache and mild vertigo.',
    recommendedAction: 'Routine OPD consultation queue. Rest and oral hydration.',
    waitTimeMinutes: 24,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 24 * 60000).toISOString(),
    vitals: {
      isBpMeasured: true,
      systolicBp: 118,
      diastolicBp: 78,
      isHeartRateMeasured: true,
      heartRate: 74,
      isTempMeasured: true,
      temperature: 36.6,
      isSpo2Measured: true,
      oxygenSaturation: 99,
      isRespRateMeasured: true,
      respiratoryRate: 16,
      isSugarMeasured: false,
      bloodSugar: null
    },
    symptoms: {
      selectedSymptoms: ['Headache', 'Dizziness'],
      otherSymptomsText: '',
      duration: '1_2_days',
      severity: 'Mild',
      additionalDetails: 'Mild throbbing headache after prolonged screen work.'
    },
    history: {
      conditions: ['Migraine history'],
      medications: ['Paracetamol 650mg as needed'],
      noMedications: false,
      allergies: ['No known allergies'],
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
    location: 'New Delhi',
    category: 'GREEN',
    triageLabel: 'Lower urgency',
    plainLanguageSummary: 'Standard Consultation (2–4 hrs). Mild chronic fatigue and routine sugar check.',
    recommendedAction: 'General physician OPD queue. Fasting glucose recommended.',
    waitTimeMinutes: 40,
    status: 'Completed',
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    vitals: {
      isBpMeasured: true,
      systolicBp: 130,
      diastolicBp: 84,
      isHeartRateMeasured: true,
      heartRate: 70,
      isTempMeasured: true,
      temperature: 36.7,
      isSpo2Measured: true,
      oxygenSaturation: 97,
      isRespRateMeasured: true,
      respiratoryRate: 16,
      isSugarMeasured: true,
      bloodSugar: 142
    },
    symptoms: {
      selectedSymptoms: ['Weakness'],
      otherSymptomsText: 'General tiredness over past week',
      duration: '>2_days',
      severity: 'Mild',
      additionalDetails: 'Regular follow-up for diabetes check.'
    },
    history: {
      conditions: ['Diabetes (Type 2)'],
      medications: ['Metformin 1000mg', 'Glimepiride 1mg'],
      noMedications: false,
      allergies: ['Sulfa drugs'],
      noAllergies: false,
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
    location: 'New Delhi',
    category: 'BLACK',
    triageLabel: 'Deceased',
    plainLanguageSummary: 'Expectant / Deceased Protocol. Brought dead to emergency casualty.',
    recommendedAction: 'Hospital mortuary protocol and medico-legal death documentation.',
    waitTimeMinutes: 65,
    status: 'Completed',
    createdAt: new Date(Date.now() - 65 * 60000).toISOString(),
    vitals: {
      isBpMeasured: true,
      systolicBp: 0,
      diastolicBp: 0,
      isHeartRateMeasured: true,
      heartRate: 0,
      isTempMeasured: true,
      temperature: 34.0,
      isSpo2Measured: true,
      oxygenSaturation: 0,
      isRespRateMeasured: true,
      respiratoryRate: 0,
      isSugarMeasured: false,
      bloodSugar: null
    },
    symptoms: {
      selectedSymptoms: [],
      otherSymptomsText: 'Brought dead, no pulse, fixed dilated pupils',
      duration: '>2_days',
      severity: 'Severe',
      additionalDetails: 'Paramedics declared death on arrival.'
    },
    history: {
      conditions: ['Cardiovascular disease'],
      medications: [],
      noMedications: true,
      allergies: [],
      noAllergies: true,
      uploadedDocuments: []
    }
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading db.json, reinitializing seed data:', err);
    }

    const initial: DatabaseSchema = {
      hospitals: SEED_HOSPITALS,
      encounters: SEED_ENCOUNTERS,
      auditLogs: [
        {
          id: 'log-1',
          action: 'REGISTRATION',
          performedBy: 'System Bootstrapper',
          details: 'Initialized hospital triage telemetry and seed queue records.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err);
    }
  }

  // --- Hospital Methods ---
  public getHospital(hospitalId: string): HospitalAccount | null {
    const id = hospitalId.trim().toUpperCase();
    return this.data.hospitals[id] || null;
  }

  public updateHospitalPlan(hospitalId: string, planTier: SubscriptionPlanTier): HospitalAccount | null {
    const id = hospitalId.trim().toUpperCase();
    const hospital = this.data.hospitals[id];
    if (!hospital) return null;

    const futureDate = new Date();
    if (planTier === 'MONTHLY') futureDate.setMonth(futureDate.getMonth() + 1);
    else if (planTier === 'HALF_YEARLY') futureDate.setMonth(futureDate.getMonth() + 6);
    else futureDate.setFullYear(futureDate.getFullYear() + 1);

    hospital.activePlan = planTier;
    hospital.planValidUntil = futureDate.toISOString().split('T')[0];

    this.addAuditLog({
      action: 'PLAN_UPGRADE',
      performedBy: hospital.staffName || hospital.hospitalId,
      details: `Hospital plan updated to ${planTier}. Valid until ${hospital.planValidUntil}.`
    });

    this.saveDatabase();
    return hospital;
  }

  public registerGenericHospital(session: HospitalAccount): HospitalAccount {
    this.data.hospitals[session.hospitalId] = session;
    this.saveDatabase();
    return session;
  }

  // --- Encounter Methods ---
  public getEncounters(category?: string, query?: string): EncounterRecord[] {
    let list = [...this.data.encounters];

    if (category && category !== 'ALL') {
      list = list.filter((e) => e.category === category);
    }

    if (query) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.patientName.toLowerCase().includes(q) ||
          e.uhid.toLowerCase().includes(q) ||
          e.contactNumber.toLowerCase().includes(q) ||
          e.symptoms.selectedSymptoms.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort: Red first, then Yellow, Green, Black, and by most recent
    const priorityWeight: Record<string, number> = { RED: 1, YELLOW: 2, GREEN: 3, BLACK: 4 };
    return list.sort((a, b) => {
      const weightA = priorityWeight[a.category] || 5;
      const weightB = priorityWeight[b.category] || 5;
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getEncounterById(id: string): EncounterRecord | null {
    return this.data.encounters.find((e) => e.id === id) || null;
  }

  public addEncounter(encounter: EncounterRecord): EncounterRecord {
    this.data.encounters.unshift(encounter);
    this.addAuditLog({
      encounterId: encounter.id,
      uhid: encounter.uhid,
      action: 'REGISTRATION',
      performedBy: 'Triage Intake Station',
      details: `New patient intake registered: ${encounter.patientName} (${encounter.age}y, ${encounter.gender}). Assigned triage category: ${encounter.category}.`
    });
    this.saveDatabase();
    return encounter;
  }

  public updateEncounter(id: string, updates: Partial<EncounterRecord>): EncounterRecord | null {
    const idx = this.data.encounters.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const existing = this.data.encounters[idx];
    const updated = { ...existing, ...updates };
    this.data.encounters[idx] = updated;

    if (updates.category && updates.category !== existing.category) {
      this.addAuditLog({
        encounterId: existing.id,
        uhid: existing.uhid,
        action: 'CLINICIAN_OVERRIDE',
        performedBy: updates.overriddenBy || 'Attending Physician',
        details: `Triage category overridden from ${existing.category} to ${updates.category}. Reason: ${updates.overrideReason || 'Clinical reassessment'}.`
      });
    } else if (updates.status && updates.status !== existing.status) {
      this.addAuditLog({
        encounterId: existing.id,
        uhid: existing.uhid,
        action: 'STATUS_CHANGE',
        performedBy: 'Hospital Staff',
        details: `Patient status changed from ${existing.status} to ${updates.status}.`
      });
    }

    this.saveDatabase();
    return updated;
  }

  // --- Audit Logs ---
  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.data.auditLogs;
  }
}

export const db = new Database();
