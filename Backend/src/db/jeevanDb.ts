import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  EmergencyIncident,
  IncidentState,
  Vehicle,
  Hospital,
  HospitalAppointment,
  PatientRegistrationRecord,
  GeoLocation,
  TimelineEvent
} from '../types/jeevan.js';
import { calculateRoadTravelMetrics } from '../services/dispatchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const JEEVAN_DB_FILE = path.join(DATA_DIR, 'jeevan_db.json');

interface JeevanDatabaseSchema {
  incidents: EmergencyIncident[];
  vehicles: Vehicle[];
  hospitals: Hospital[];
  appointments: HospitalAppointment[];
  registrations: PatientRegistrationRecord[];
}

const SEED_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-AIIMS-01',
    name: 'AIIMS Apex Trauma Center',
    type: 'TRAUMA_CENTER',
    address: 'Ring Road, Raj Nagar, Safdarjung Enclave, New Delhi',
    city: 'New Delhi',
    location: {
      lat: 28.5672,
      lng: 77.2065,
      address: 'AIIMS Trauma Center, Ring Rd, New Delhi'
    },
    phone: '011-26588500',
    emergencyDepartmentStatus: 'NORMAL',
    emergencyBedsAvailable: 8,
    totalBeds: 260,
    icuBedsAvailable: 4,
    traumaBaysAvailable: 3,
    departments: ['Emergency Medicine', 'Trauma Surgery', 'Neurosurgery', 'Cardiology', 'Orthopedics']
  },
  {
    id: 'HOSP-SAFDARJUNG-02',
    name: 'Safdarjung Government Hospital',
    type: 'GOVT_MEDICAL_COLLEGE',
    address: 'Ansari Nagar West, New Delhi',
    city: 'New Delhi',
    location: {
      lat: 28.5701,
      lng: 77.2081,
      address: 'Safdarjung Hospital, Ansari Nagar West, New Delhi'
    },
    phone: '011-26165060',
    emergencyDepartmentStatus: 'NORMAL',
    emergencyBedsAvailable: 14,
    totalBeds: 1550,
    icuBedsAvailable: 6,
    traumaBaysAvailable: 4,
    departments: ['Emergency Department', 'General Surgery', 'Obstetrics & Gynaecology', 'Pediatrics', 'Burn ICU']
  },
  {
    id: 'HOSP-RML-03',
    name: 'Dr. Ram Manohar Lohia (RML) Hospital',
    type: 'DISTRICT_HOSPITAL',
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi',
    city: 'New Delhi',
    location: {
      lat: 28.6247,
      lng: 77.2008,
      address: 'RML Hospital, Baba Kharak Singh Marg, New Delhi'
    },
    phone: '011-23365525',
    emergencyDepartmentStatus: 'NORMAL',
    emergencyBedsAvailable: 11,
    totalBeds: 1400,
    icuBedsAvailable: 5,
    traumaBaysAvailable: 2,
    departments: ['Emergency & Casualty', 'Cardiology', 'Neurology', 'Internal Medicine', 'General OPD']
  },
  {
    id: 'HOSP-DOON-04',
    name: 'Govt Doon Medical College & Hospital',
    type: 'GOVT_MEDICAL_COLLEGE',
    address: 'Parade Ground, Dehradun, Uttarakhand',
    city: 'Dehradun',
    location: {
      lat: 30.3256,
      lng: 78.0437,
      address: 'Govt Doon Hospital, Parade Ground, Dehradun'
    },
    phone: '0135-2726020',
    emergencyDepartmentStatus: 'NORMAL',
    emergencyBedsAvailable: 18,
    totalBeds: 600,
    icuBedsAvailable: 8,
    traumaBaysAvailable: 4,
    departments: ['Emergency Trauma Unit', 'Orthopedics', 'General Surgery', 'Obstetrics', 'Pediatrics']
  }
];

const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-ALS-01',
    vehicleNumber: 'DL-01-EQ-9108',
    callSign: 'ALS Rapid Response 108',
    capability: 'AMBULANCE_ALS',
    status: 'AVAILABLE',
    currentLocation: {
      lat: 28.5821,
      lng: 77.2145,
      address: 'Lodhi Road Emergency Base, New Delhi'
    },
    bearing: 45,
    operatorName: 'Sunil Kumar (Paramedic)',
    operatorPhone: '+91 98765 11001',
    equipment: ['Ventilator', 'Defibrillator', 'Oxygen Tank', 'ECG Monitor', 'Suction Unit', 'Spine Board'],
    lastPingTime: new Date().toISOString()
  },
  {
    id: 'VEH-ALS-02',
    vehicleNumber: 'DL-02-ER-4421',
    callSign: 'Trauma One ALS Unit',
    capability: 'AMBULANCE_ALS',
    status: 'AVAILABLE',
    currentLocation: {
      lat: 28.5995,
      lng: 77.1920,
      address: 'Chanakyapuri Flyover Point, New Delhi'
    },
    bearing: 180,
    operatorName: 'Rameshwar Dayal',
    operatorPhone: '+91 98765 11002',
    equipment: ['Ventilator', 'Multipara Monitor', 'Syringe Pump', 'Trauma Splints', 'Oxygen Cylinder'],
    lastPingTime: new Date().toISOString()
  },
  {
    id: 'VEH-BLS-03',
    vehicleNumber: 'DL-03-BL-8874',
    callSign: 'City BLS Ambulance 12',
    capability: 'AMBULANCE_BLS',
    status: 'AVAILABLE',
    currentLocation: {
      lat: 28.6189,
      lng: 77.2180,
      address: 'India Gate Emergency Standby, New Delhi'
    },
    bearing: 90,
    operatorName: 'Deepak Rawat',
    operatorPhone: '+91 98765 11003',
    equipment: ['Oxygen Delivery', 'AED Automated External Defibrillator', 'First Aid Trauma Kit', 'Stretcher'],
    lastPingTime: new Date().toISOString()
  },
  {
    id: 'VEH-PTS-04',
    vehicleNumber: 'DL-04-TR-5532',
    callSign: 'Patient Mobility Van 04',
    capability: 'WHEELCHAIR_CAB',
    status: 'AVAILABLE',
    currentLocation: {
      lat: 28.6050,
      lng: 77.2250,
      address: 'Barakhamba Standby, New Delhi'
    },
    bearing: 270,
    operatorName: 'Manish Tyagi',
    operatorPhone: '+91 98765 11004',
    equipment: ['Wheelchair Hydraulic Ramp', 'Low-Step Access', 'First Aid Box'],
    lastPingTime: new Date().toISOString()
  },
  {
    id: 'VEH-DOON-05',
    vehicleNumber: 'UK-07-EM-1088',
    callSign: 'Uttarakhand 108 ALS Dehradun',
    capability: 'AMBULANCE_ALS',
    status: 'AVAILABLE',
    currentLocation: {
      lat: 30.3190,
      lng: 78.0380,
      address: 'Clock Tower Emergency Stand, Dehradun'
    },
    bearing: 0,
    operatorName: 'Virendra Singh Negi',
    operatorPhone: '+91 98765 11005',
    equipment: ['Transport Ventilator', 'Monitor', 'Spine immobilization', 'Suction Machine'],
    lastPingTime: new Date().toISOString()
  }
];

const SEED_INCIDENTS: EmergencyIncident[] = [
  {
    id: 'inc-demo-01',
    incidentNumber: 'JEV-2026-88412',
    state: 'VEHICLE_EN_ROUTE',
    intent: 'medical_emergency',
    urgency: 'critical',
    reportedSymptoms: ['Road Accident Trauma', 'Severe Bleeding', 'Suspected Fracture'],
    rawTranscript: 'I have been in a road accident. I am bleeding badly. Please help me.',
    language: 'en',
    pickupLocation: {
      lat: 28.5850,
      lng: 77.2100,
      address: 'Near AIIMS Flyover, Ring Road, New Delhi',
      landmark: 'Under metro pillar 42'
    },
    destinationHospitalId: 'HOSP-AIIMS-01',
    destinationHospitalName: 'AIIMS Apex Trauma Center',
    transportPreference: 'ambulance',
    assignedVehicleId: 'VEH-ALS-01',
    assignedVehicleCallSign: 'ALS Rapid Response 108',
    assignedVehicleType: 'AMBULANCE_ALS',
    etaMinutes: 6,
    roadDistanceKm: 2.8,
    patientName: 'Arjun Verma',
    patientAge: 29,
    patientGender: 'Male',
    contactPhone: '+91 98111 55443',
    needsEmergencyEscalation: true,
    aiReasoning: 'Critical vehicular trauma reported with severe active hemorrhaging. Dispatched nearest ALS unit with trauma resuscitation capability.',
    aiConfidence: 0.98,
    timeline: [
      {
        id: 't-1',
        state: 'REQUEST_CAPTURED',
        title: 'Emergency Request Captured',
        description: 'Voice request transcribed: "I have been in a road accident. I am bleeding badly. Please help me."',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        actor: 'Citizen Voice Assistant'
      },
      {
        id: 't-2',
        state: 'INTENT_CLASSIFIED',
        title: 'Critical Emergency Classified',
        description: 'Deterministic Safety Engine flagged high-acuity trauma. Registration barrier bypassed.',
        timestamp: new Date(Date.now() - 9.5 * 60000).toISOString(),
        actor: 'Jeevan AI Policy Engine'
      },
      {
        id: 't-3',
        state: 'DISPATCH_ACCEPTED',
        title: 'ALS Ambulance Dispatched',
        description: 'Assigned to ALS Rapid Response 108 (DL-01-EQ-9108). Accepted by Paramedic Sunil Kumar.',
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        actor: 'Auto Dispatcher'
      },
      {
        id: 't-4',
        state: 'VEHICLE_EN_ROUTE',
        title: 'Ambulance En Route',
        description: 'Vehicle GPS active. Estimated arrival in 6 minutes.',
        timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
        actor: 'Ambulance Telemetry'
      }
    ],
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 60000).toISOString()
  }
];

class JeevanDatabase {
  private data: JeevanDatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): JeevanDatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(JEEVAN_DB_FILE)) {
        const raw = fs.readFileSync(JEEVAN_DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading jeevan_db.json, initializing seeds:', err);
    }

    const initial: JeevanDatabaseSchema = {
      incidents: SEED_INCIDENTS,
      vehicles: SEED_VEHICLES,
      hospitals: SEED_HOSPITALS,
      appointments: [],
      registrations: []
    };

    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave?: JeevanDatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(JEEVAN_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to jeevan_db.json:', err);
    }
  }

  // --- Incidents ---
  public getIncidents(urgency?: string, state?: string): EmergencyIncident[] {
    let list = [...this.data.incidents];
    if (urgency && urgency !== 'ALL') {
      list = list.filter((i) => i.urgency === urgency);
    }
    if (state && state !== 'ALL') {
      list = list.filter((i) => i.state === state);
    }

    // Sort: Critical first, then by recency
    const urgencyOrder: Record<string, number> = { critical: 1, urgent: 2, routine: 3, uncertain: 4 };
    return list.sort((a, b) => {
      const uA = urgencyOrder[a.urgency] || 5;
      const uB = urgencyOrder[b.urgency] || 5;
      if (uA !== uB) return uA - uB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getIncidentById(id: string): EmergencyIncident | null {
    return this.data.incidents.find((i) => i.id === id) || null;
  }

  public createIncident(data: Partial<EmergencyIncident>): EmergencyIncident {
    const id = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const incidentNumber = `JEV-${new Date().getFullYear()}-${randNum}`;

    const newIncident: EmergencyIncident = {
      id,
      incidentNumber,
      state: data.state || 'REQUEST_CAPTURED',
      intent: data.intent || 'medical_emergency',
      urgency: data.urgency || 'critical',
      reportedSymptoms: data.reportedSymptoms || [],
      rawTranscript: data.rawTranscript || '',
      language: data.language || 'en',
      pickupLocation: data.pickupLocation || {
        lat: 28.5850,
        lng: 77.2100,
        address: 'Detected Device GPS Location, New Delhi'
      },
      transportPreference: data.transportPreference || 'ambulance',
      needsEmergencyEscalation: data.needsEmergencyEscalation ?? (data.urgency === 'critical'),
      aiReasoning: data.aiReasoning || 'Immediate emergency response workflow initiated.',
      aiConfidence: data.aiConfidence || 0.95,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          state: 'REQUEST_CAPTURED',
          title: 'Emergency Request Initiated',
          description: data.rawTranscript 
            ? `Transcribed: "${data.rawTranscript}"` 
            : 'Emergency SOS request triggered.',
          timestamp: new Date().toISOString(),
          actor: 'Citizen Portal'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    this.data.incidents.unshift(newIncident);
    this.saveDatabase();
    return newIncident;
  }

  public updateIncident(id: string, updates: Partial<EmergencyIncident>): EmergencyIncident | null {
    const idx = this.data.incidents.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    const existing = this.data.incidents[idx];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.incidents[idx] = updated;
    this.saveDatabase();
    return updated;
  }

  public addTimelineEvent(incidentId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>): EmergencyIncident | null {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return null;

    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    inc.timeline.push(newEvent);
    inc.state = event.state;
    inc.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return inc;
  }

  // --- Vehicles ---
  public getVehicles(): Vehicle[] {
    return this.data.vehicles;
  }

  public getVehicleById(id: string): Vehicle | null {
    return this.data.vehicles.find((v) => v.id === id) || null;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    const idx = this.data.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    const existing = this.data.vehicles[idx];
    const updated = {
      ...existing,
      ...updates,
      lastPingTime: new Date().toISOString()
    };
    this.data.vehicles[idx] = updated;
    this.saveDatabase();
    return updated;
  }

  // --- Hospitals ---
  public getHospitals(): Hospital[] {
    return this.data.hospitals;
  }

  public getHospitalById(id: string): Hospital | null {
    return this.data.hospitals.find((h) => h.id === id) || null;
  }

  public updateHospital(id: string, updates: Partial<Hospital>): Hospital | null {
    const idx = this.data.hospitals.findIndex((h) => h.id === id);
    if (idx === -1) return null;

    this.data.hospitals[idx] = { ...this.data.hospitals[idx], ...updates };
    this.saveDatabase();
    return this.data.hospitals[idx];
  }

  // --- Appointments ---
  public getAppointments(): HospitalAppointment[] {
    return this.data.appointments;
  }

  public createAppointment(data: Omit<HospitalAppointment, 'id' | 'appointmentNumber' | 'createdAt'>): HospitalAppointment {
    const id = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    const appointmentNumber = `OPD-${new Date().getFullYear()}-${rand}`;

    const newAppt: HospitalAppointment = {
      id,
      appointmentNumber,
      createdAt: new Date().toISOString(),
      ...data
    };

    this.data.appointments.unshift(newAppt);
    this.saveDatabase();
    return newAppt;
  }

  // --- Patient Registrations (Post-Treatment) ---
  public getRegistrations(): PatientRegistrationRecord[] {
    return this.data.registrations;
  }

  public createPatientRegistration(data: Omit<PatientRegistrationRecord, 'id' | 'registeredAt'>): PatientRegistrationRecord {
    const id = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newReg: PatientRegistrationRecord = {
      id,
      registeredAt: new Date().toISOString(),
      ...data
    };

    this.data.registrations.unshift(newReg);

    // If linked to an incident, mark incident as REGISTRATION_COMPLETED
    if (data.incidentId) {
      this.addTimelineEvent(data.incidentId, {
        state: 'REGISTRATION_COMPLETED',
        title: 'Hospital Registration Completed',
        description: `Formal administrative patient record created under UHID: ${data.uhid}.`,
        actor: data.registeredByStaff || 'Hospital Intake Reception'
      });
    }

    this.saveDatabase();
    return newReg;
  }
}

export const jeevanDb = new JeevanDatabase();
