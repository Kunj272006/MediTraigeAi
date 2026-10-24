import type {
  EmergencyIncident,
  GeminiInterpretation,
  GeoLocation,
  Hospital,
  HospitalAppointment,
  IncidentState,
  PatientRegistrationRecord,
  Vehicle,
  VehicleStatus
} from '../types/jeevan';

const BASE_URL = '/api/jeevan';

export const jeevanApi = {
  // 1. AI & Voice Interpretation
  async interpretSpeech(
    transcript: string,
    language = 'en',
    location?: GeoLocation
  ): Promise<{ success: boolean; interpretation: GeminiInterpretation }> {
    const res = await fetch(`${BASE_URL}/ai/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, language, location }),
    });
    if (!res.ok) throw new Error(`AI interpretation error: ${res.statusText}`);
    return res.json();
  },

  // 2. Incident Management
  async createIncident(params: {
    transcript: string;
    language?: string;
    location?: GeoLocation;
    autoDispatch?: boolean;
    transportPreference?: string;
  }): Promise<{ success: boolean; incident: EmergencyIncident; assignedVehicle?: Vehicle }> {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Create incident error: ${res.statusText}`);
    return res.json();
  },

  async getIncidents(): Promise<{ success: boolean; incidents: EmergencyIncident[] }> {
    const res = await fetch(`${BASE_URL}/incidents`);
    if (!res.ok) throw new Error(`Get incidents error: ${res.statusText}`);
    return res.json();
  },

  async getIncident(id: string): Promise<{ success: boolean; incident: EmergencyIncident; candidates?: any[] }> {
    const res = await fetch(`${BASE_URL}/incidents/${id}`);
    if (!res.ok) throw new Error(`Get incident error: ${res.statusText}`);
    return res.json();
  },

  async dispatchVehicle(
    incidentId: string,
    vehicleId?: string
  ): Promise<{ success: boolean; incident: EmergencyIncident; vehicle: Vehicle }> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId }),
    });
    if (!res.ok) throw new Error(`Dispatch error: ${res.statusText}`);
    return res.json();
  },

  async advanceIncidentState(
    incidentId: string,
    toState: IncidentState,
    actor: string,
    note?: string
  ): Promise<{ success: boolean; incident: EmergencyIncident }> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}/state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toState, actor, note }),
    });
    if (!res.ok) throw new Error(`State transition error: ${res.statusText}`);
    return res.json();
  },

  // 3. Vehicles & Fleet Telemetry
  async getVehicles(): Promise<{ success: boolean; vehicles: Vehicle[] }> {
    const res = await fetch(`${BASE_URL}/vehicles`);
    if (!res.ok) throw new Error(`Get vehicles error: ${res.statusText}`);
    return res.json();
  },

  async updateVehicleStatus(
    vehicleId: string,
    status: VehicleStatus,
    location?: GeoLocation
  ): Promise<{ success: boolean; vehicle: Vehicle }> {
    const res = await fetch(`${BASE_URL}/vehicles/${vehicleId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, location }),
    });
    if (!res.ok) throw new Error(`Update vehicle error: ${res.statusText}`);
    return res.json();
  },

  // 4. Government Hospitals & Bed Status
  async getHospitals(): Promise<{ success: boolean; hospitals: Hospital[] }> {
    const res = await fetch(`${BASE_URL}/hospitals`);
    if (!res.ok) throw new Error(`Get hospitals error: ${res.statusText}`);
    return res.json();
  },

  async updateHospitalCapacity(
    hospitalId: string,
    availableBeds?: number,
    traumaBaysAvailable?: number
  ): Promise<{ success: boolean; hospital: Hospital }> {
    const res = await fetch(`${BASE_URL}/hospitals/${hospitalId}/capacity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availableBeds, traumaBaysAvailable }),
    });
    if (!res.ok) throw new Error(`Update hospital capacity error: ${res.statusText}`);
    return res.json();
  },

  // 5. Appointments (Scenario C)
  async getAppointments(): Promise<{ success: boolean; appointments: HospitalAppointment[] }> {
    const res = await fetch(`${BASE_URL}/appointments`);
    if (!res.ok) throw new Error(`Get appointments error: ${res.statusText}`);
    return res.json();
  },

  async createAppointment(data: {
    patientName: string;
    patientPhone: string;
    hospitalId: string;
    department: string;
    slotDate: string;
    slotTime: string;
    transportRequested?: boolean;
  }): Promise<{ success: boolean; appointment: HospitalAppointment }> {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create appointment error: ${res.statusText}`);
    return res.json();
  },

  // 6. Post-Arrival Patient Registration (Section 7)
  async registerPatient(data: {
    incidentId: string;
    hospitalId: string;
    patientName: string;
    age: number;
    gender: string;
    contactPhone: string;
    emergencyContact: string;
    provisionalDiagnosis?: string;
    abhaId?: string;
  }): Promise<{ success: boolean; registration: PatientRegistrationRecord; incident: EmergencyIncident }> {
    const res = await fetch(`${BASE_URL}/patients/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Register patient error: ${res.statusText}`);
    return res.json();
  },

  // 7. Admin & System Health
  async getAdminStats(): Promise<{
    success: boolean;
    stats: {
      totalIncidents: number;
      activeEmergencies: number;
      availableAmbulances: number;
      totalVehicles: number;
      hospitalsConnected: number;
      availableTraumaBays: number;
      geminiAiStatus: string;
    };
  }> {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error(`Get admin stats error: ${res.statusText}`);
    return res.json();
  },
};
