export type IncidentIntent = 
  | 'medical_emergency' 
  | 'medical_transport' 
  | 'routine_appointment' 
  | 'hospital_information' 
  | 'other';

export type IncidentUrgency = 'critical' | 'urgent' | 'routine' | 'uncertain';

export type TransportPreference = 'ambulance' | 'medical_transport' | 'taxi' | 'unknown';

export type IncidentState = 
  | 'IDLE'
  | 'REQUEST_CAPTURED'
  | 'LOCATION_PENDING'
  | 'LOCATION_CONFIRMED'
  | 'INTENT_CLASSIFIED'
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
  | 'NO_VEHICLE_FOUND'
  | 'DISPATCH_FAILED'
  | 'OPERATOR_DECLINED'
  | 'CASE_ESCALATED'
  | 'USER_CANCELLED';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
  accuracyMeters?: number;
}

export interface TimelineEvent {
  id: string;
  state: IncidentState;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface EmergencyIncident {
  id: string;
  incidentNumber: string;
  state: IncidentState;
  intent: IncidentIntent;
  urgency: IncidentUrgency;
  reportedSymptoms: string[];
  rawTranscript: string;
  language: 'en' | 'hi';
  pickupLocation: GeoLocation;
  destinationHospitalId?: string;
  destinationHospitalName?: string;
  transportPreference: TransportPreference;
  assignedVehicleId?: string;
  assignedVehicleCallSign?: string;
  assignedVehicleType?: string;
  etaMinutes?: number;
  roadDistanceKm?: number;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  contactPhone?: string;
  isUnidentifiedPatient?: boolean;
  needsEmergencyEscalation: boolean;
  aiReasoning: string;
  aiConfidence: number;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type VehicleCapability = 'AMBULANCE_ALS' | 'AMBULANCE_BLS' | 'PATIENT_TRANSPORT' | 'WHEELCHAIR_CAB';

export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'BUSY' | 'OFFLINE';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  callSign: string;
  capability: VehicleCapability;
  status: VehicleStatus;
  currentLocation: GeoLocation;
  bearing: number;
  operatorName: string;
  operatorPhone: string;
  equipment: string[];
  activeIncidentId?: string;
  lastPingTime: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'GOVT_MEDICAL_COLLEGE' | 'DISTRICT_HOSPITAL' | 'COMMUNITY_HEALTH_CENTER' | 'TRAUMA_CENTER';
  address: string;
  city: string;
  location: GeoLocation;
  phone: string;
  emergencyDepartmentStatus: 'NORMAL' | 'SURGE' | 'CRITICAL';
  emergencyBedsAvailable: number;
  totalBeds: number;
  icuBedsAvailable: number;
  traumaBaysAvailable: number;
  departments: string[];
}

export interface HospitalAppointment {
  id: string;
  appointmentNumber: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  patientName: string;
  patientPhone: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  transportBooked?: boolean;
  transportBookingId?: string;
  createdAt: string;
}

export interface PatientRegistrationRecord {
  id: string;
  uhid: string;
  incidentId: string;
  fullName: string;
  age: number;
  gender: string;
  contactNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  aadhaarOrId?: string;
  residentialAddress: string;
  bloodGroup?: string;
  allergies?: string[];
  knownConditions?: string[];
  isProvisional: boolean;
  registeredAt: string;
  registeredByStaff: string;
}

export interface DispatchScoreCandidate {
  vehicle: Vehicle;
  roadDistanceKm: number;
  etaMinutes: number;
  score: number;
  reasons: string[];
}
