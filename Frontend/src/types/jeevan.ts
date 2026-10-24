export type UrgencyLevel = 'critical' | 'urgent' | 'routine' | 'uncertain';
export type IncidentIntent = 'medical_emergency' | 'medical_transport' | 'routine_appointment' | 'hospital_information' | 'other';
export type TransportPreference = 'ambulance' | 'medical_transport' | 'taxi' | 'unknown';

export type IncidentState =
  | 'IDLE'
  | 'REQUEST_CAPTURED'
  | 'LOCATION_PENDING'
  | 'LOCATION_CONFIRMED'
  | 'INTENT_CLASSIFIED'
  | 'EMERGENCY_REVIEW_REQUIRED'
  | 'TRANSPORT_SELECTION'
  | 'DISPATCH_PENDING'
  | 'DISPATCH_ACCEPTED'
  | 'VEHICLE_EN_ROUTE'
  | 'VEHICLE_AT_PICKUP'
  | 'PATIENT_ONBOARD'
  | 'ARRIVED_AT_HOSPITAL'
  | 'TREATMENT_STARTED'
  | 'REGISTRATION_PENDING'
  | 'REGISTRATION_COMPLETED'
  | 'CASE_COMPLETED'
  | 'LOCATION_UNAVAILABLE'
  | 'NO_VEHICLE_FOUND'
  | 'DISPATCH_FAILED'
  | 'OPERATOR_DECLINED'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'USER_CANCEL_REQUESTED'
  | 'CASE_ESCALATED';

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  landmark?: string;
}

export interface GeminiInterpretation {
  intent: IncidentIntent;
  urgency: UrgencyLevel;
  reported_symptoms: string[];
  incident_description: string;
  location_text: string | null;
  transport_preference: TransportPreference;
  needs_emergency_escalation: boolean;
  clarification_required: boolean;
  clarification_question: string | null;
  confidence: number;
  language: string;
  reasoning_summary: string;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  fromState: IncidentState;
  toState: IncidentState;
  actor: 'CITIZEN' | 'GEMINI_AI' | 'DISPATCH_ENGINE' | 'DISPATCHER' | 'OPERATOR' | 'HOSPITAL_STAFF' | 'SYSTEM';
  note: string;
}

export interface EmergencyIncident {
  id: string;
  createdAt: string;
  updatedAt: string;
  state: IncidentState;
  intent: IncidentIntent;
  urgency: UrgencyLevel;
  transcript: string;
  language: string;
  aiInterpretation: GeminiInterpretation;
  pickupLocation: GeoLocation;
  assignedVehicleId?: string;
  assignedHospitalId?: string;
  assignedVehicle?: Vehicle;
  assignedHospital?: Hospital;
  etaMinutes?: number;
  distanceKm?: number;
  timeline: IncidentEvent[];
  provisionalPatientName?: string;
  registrationRecordId?: string;
}

export type VehicleCapability = 'ALS' | 'BLS' | 'WHEELCHAIR' | 'PATIENT_TRANSPORT' | 'STANDARD_CAB';
export type VehicleStatus = 'AVAILABLE' | 'EN_ROUTE' | 'AT_SCENE' | 'BUSY' | 'OFFLINE';

export interface Vehicle {
  id: string;
  callSign: string;
  registrationNumber: string;
  capability: VehicleCapability;
  status: VehicleStatus;
  currentLocation: GeoLocation;
  driverName: string;
  driverPhone: string;
  lastUpdated: string;
  activeIncidentId?: string;
}

export interface HospitalDepartment {
  name: string;
  availableDoctors: number;
  opdOpen: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  category: 'AIIMS_APEX' | 'DISTRICT_HOSPITAL' | 'SUB_DISTRICT' | 'COMMUNITY_HEALTH_CENTER';
  location: GeoLocation;
  emergencyDepartmentOpen: boolean;
  totalBeds: number;
  availableBeds: number;
  traumaBaysAvailable: number;
  oxygenAvailable: boolean;
  phone: string;
  departments: HospitalDepartment[];
}

export interface HospitalAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  slotDate: string;
  slotTime: string;
  bookingToken: string;
  transportRequested: boolean;
  createdAt: string;
}

export interface PatientRegistrationRecord {
  id: string;
  incidentId: string;
  hospitalId: string;
  patientName: string;
  age: number;
  gender: string;
  contactPhone: string;
  emergencyContact: string;
  provisionalDiagnosis: string;
  abhaId?: string;
  insuranceNumber?: string;
  registeredAt: string;
  encounterId: string;
}

export interface DispatchScoreCandidate {
  vehicle: Vehicle;
  score: number;
  distanceKm: number;
  etaMinutes: number;
  reasons: string[];
}
