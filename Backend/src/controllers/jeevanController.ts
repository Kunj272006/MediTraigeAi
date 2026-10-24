import type { Request, Response } from 'express';
import { jeevanDb } from '../db/jeevanDb.js';
import { interpretIncidentTranscript } from '../services/geminiService.js';
import {
  rankEligibleVehicles,
  calculateRoadTravelMetrics,
  generateRouteWaypoints
} from '../services/dispatchEngine.js';
import type { IncidentState, VehicleCapability } from '../types/jeevan.js';

/**
 * Voice / Text Interpretation via Gemini AI & Deterministic Safety Engine
 */
export const interpretTranscript = async (req: Request, res: Response) => {
  const text = (req.body.text || req.body.transcript || 'Emergency assistance requested').trim();

  try {
    const analysis = await interpretIncidentTranscript(text);
    res.json({ success: true, analysis, interpretation: analysis });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to interpret transcript', details: err?.message });
  }
};

/**
 * Emergency First Incident Creation
 * Never blocks for patient registration. Immediately creates the incident,
 * determines best hospital, ranks vehicles, and initiates dispatch if life-threatening.
 */
export const createIncident = async (req: Request, res: Response) => {
  const rawTranscript = (req.body.rawTranscript || req.body.transcript || 'Emergency assistance requested').trim();
  const rawLocation = req.body.pickupLocation || req.body.location || {};
  const pickupLocation = {
    lat: typeof rawLocation.lat === 'number' ? rawLocation.lat : 28.5672,
    lng: typeof rawLocation.lng === 'number' ? rawLocation.lng : 77.2100,
    address: rawLocation.address || 'AIIMS Ring Road, Ansari Nagar, New Delhi',
    landmark: rawLocation.landmark || 'Apex Medical Grid'
  };

  const {
    patientName,
    patientAge,
    patientGender,
    contactPhone,
    language
  } = req.body;

  // 1. Interpret transcript using Gemini / Safety Engine
  const analysis = await interpretIncidentTranscript(rawTranscript || 'Emergency SOS assistance requested');

  // 2. Select best receiving government hospital (closest trauma center or govt medical college)
  const hospitals = jeevanDb.getHospitals();
  let closestHospital = hospitals[0];
  let minHospDist = 9999;

  for (const h of hospitals) {
    const metrics = calculateRoadTravelMetrics(pickupLocation, h.location);
    if (metrics.roadDistanceKm < minHospDist) {
      minHospDist = metrics.roadDistanceKm;
      closestHospital = h;
    }
  }

  // 3. Score & rank available fleet
  const vehicles = jeevanDb.getVehicles();
  const candidates = rankEligibleVehicles(
    vehicles,
    pickupLocation,
    analysis.urgency,
    analysis.transport_preference === 'ambulance' ? 'AMBULANCE_ALS' : undefined
  );

  const bestCandidate = candidates.length > 0 ? candidates[0] : null;

  // 4. Create Incident
  const incident = jeevanDb.createIncident({
    intent: analysis.intent,
    urgency: analysis.urgency,
    reportedSymptoms: analysis.reported_symptoms,
    rawTranscript: rawTranscript || 'Emergency assistance requested',
    language: language || analysis.language || 'en',
    pickupLocation,
    destinationHospitalId: closestHospital.id,
    destinationHospitalName: closestHospital.name,
    transportPreference: analysis.transport_preference,
    patientName: patientName || 'Unidentified Patient',
    patientAge: patientAge ? Number(patientAge) : undefined,
    patientGender: patientGender || 'Unspecified',
    contactPhone: contactPhone || '',
    isUnidentifiedPatient: !patientName,
    needsEmergencyEscalation: analysis.needs_emergency_escalation,
    aiReasoning: analysis.reasoning_summary,
    aiConfidence: analysis.confidence
  });

  // 5. Automatic Dispatch Trigger if Critical Life-Threatening Emergency
  if (analysis.urgency === 'critical' && bestCandidate) {
    jeevanDb.updateVehicle(bestCandidate.vehicle.id, {
      status: 'ASSIGNED',
      activeIncidentId: incident.id
    });

    const routeWaypoints = generateRouteWaypoints(bestCandidate.vehicle.currentLocation, pickupLocation);

    jevanDbUpdateDispatch(incident.id, bestCandidate.vehicle, bestCandidate.etaMinutes, bestCandidate.roadDistanceKm);

    jeevanDb.addTimelineEvent(incident.id, {
      state: 'DISPATCH_ACCEPTED',
      title: `${bestCandidate.vehicle.capability.replace('_', ' ')} Dispatched`,
      description: `Dispatched ${bestCandidate.vehicle.callSign} (${bestCandidate.vehicle.vehicleNumber}). ETA: ${bestCandidate.etaMinutes} mins (${bestCandidate.roadDistanceKm} km away). Operator: ${bestCandidate.vehicle.operatorName}.`,
      actor: 'Autonomous Dispatch Engine'
    });
  } else if (!bestCandidate && analysis.urgency === 'critical') {
    jeevanDb.addTimelineEvent(incident.id, {
      state: 'NO_VEHICLE_FOUND',
      title: 'Emergency Queue Escalated to 108 Hotline',
      description: 'No verified available ambulances within immediate perimeter. Direct hotline routing active.',
      actor: 'Safety Policy Fallback'
    });
  }

  const fresh = jeevanDb.getIncidentById(incident.id);
  res.status(201).json({ success: true, incident: fresh, recommendedCandidates: candidates.slice(0, 3) });
};

function jevanDbUpdateDispatch(incidentId: string, vehicle: any, etaMinutes: number, roadDistanceKm: number) {
  jeevanDb.updateIncident(incidentId, {
    state: 'DISPATCH_ACCEPTED',
    assignedVehicleId: vehicle.id,
    assignedVehicleCallSign: vehicle.callSign,
    assignedVehicleType: vehicle.capability,
    etaMinutes,
    roadDistanceKm
  });
}

/**
 * List Incidents for Dispatcher Dashboard
 */
export const getIncidents = (req: Request, res: Response) => {
  const { urgency, state } = req.query as { urgency?: string; state?: string };
  const incidents = jeevanDb.getIncidents(urgency, state);
  res.json({ success: true, count: incidents.length, incidents });
};

/**
 * Get Incident Details with Route Geometry & Candidates
 */
export const getIncidentById = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const incident = jeevanDb.getIncidentById(id);

  if (!incident) {
    res.status(404).json({ error: 'Incident record not found.' });
    return;
  }

  const vehicles = jeevanDb.getVehicles();
  const candidates = rankEligibleVehicles(vehicles, incident.pickupLocation, incident.urgency);

  let assignedVehicle = null;
  let routeWaypoints: any[] = [];

  if (incident.assignedVehicleId) {
    assignedVehicle = jeevanDb.getVehicleById(incident.assignedVehicleId);
    if (assignedVehicle) {
      routeWaypoints = generateRouteWaypoints(assignedVehicle.currentLocation, incident.pickupLocation);
    }
  }

  const destinationHospital = incident.destinationHospitalId
    ? jeevanDb.getHospitalById(incident.destinationHospitalId)
    : null;

  res.json({
    success: true,
    incident,
    assignedVehicle,
    destinationHospital,
    routeWaypoints,
    candidates: candidates.slice(0, 4)
  });
};

/**
 * Manual or Automated Dispatch Assignment
 */
export const dispatchVehicleToIncident = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { vehicleId, dispatcherName } = req.body;

  const incident = jeevanDb.getIncidentById(id);
  if (!incident) {
    res.status(404).json({ error: 'Incident not found.' });
    return;
  }

  const vehicle = jeevanDb.getVehicleById(vehicleId);
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found.' });
    return;
  }

  const { roadDistanceKm, etaMinutes } = calculateRoadTravelMetrics(vehicle.currentLocation, incident.pickupLocation);

  // Lock vehicle
  jeevanDb.updateVehicle(vehicle.id, {
    status: 'ASSIGNED',
    activeIncidentId: incident.id
  });

  // Update incident
  jeevanDb.updateIncident(incident.id, {
    state: 'DISPATCH_ACCEPTED',
    assignedVehicleId: vehicle.id,
    assignedVehicleCallSign: vehicle.callSign,
    assignedVehicleType: vehicle.capability,
    etaMinutes,
    roadDistanceKm
  });

  jeevanDb.addTimelineEvent(incident.id, {
    state: 'DISPATCH_ACCEPTED',
    title: 'Vehicle Manually Dispatched',
    description: `Assigned ${vehicle.callSign} (${vehicle.vehicleNumber}) to incident. Operator: ${vehicle.operatorName}. ETA: ${etaMinutes} mins.`,
    actor: dispatcherName || 'Senior Dispatcher'
  });

  const updated = jeevanDb.getIncidentById(incident.id);
  res.json({ success: true, incident: updated });
};

/**
 * Advance Incident Lifecycle State Machine
 */
export const advanceIncidentState = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const nextState = (req.body.nextState || req.body.toState) as IncidentState;
  const actor = req.body.actor;
  const details = req.body.details || req.body.note;

  const incident = jeevanDb.getIncidentById(id);
  if (!incident) {
    res.status(404).json({ error: 'Incident not found.' });
    return;
  }

  // Titles for state transitions
  const stateTitles: Record<IncidentState, string> = {
    IDLE: 'Idle',
    REQUEST_CAPTURED: 'Request Captured',
    LOCATION_PENDING: 'Location Pending',
    LOCATION_CONFIRMED: 'Location Confirmed',
    INTENT_CLASSIFIED: 'Intent Classified',
    DISPATCH_PENDING: 'Dispatch Pending Acceptance',
    DISPATCH_ACCEPTED: 'Dispatch Accepted',
    VEHICLE_EN_ROUTE: 'Ambulance En Route to Scene',
    VEHICLE_AT_PICKUP: 'Arrived at Patient Location',
    PATIENT_ONBOARD: 'Patient Secured Onboard',
    ARRIVED_AT_HOSPITAL: 'Arrived at Emergency Department',
    TREATMENT_STARTED: 'Emergency Resuscitation Initiated',
    REGISTRATION_PENDING: 'Awaiting Patient Registration Details',
    REGISTRATION_COMPLETED: 'Administrative Registration Completed',
    CASE_COMPLETED: 'Incident Case Closed',
    NO_VEHICLE_FOUND: 'No Local Vehicle Found',
    DISPATCH_FAILED: 'Dispatch Failed',
    OPERATOR_DECLINED: 'Operator Declined Assignment',
    CASE_ESCALATED: 'Incident Escalated to Supervisor',
    USER_CANCELLED: 'Request Cancelled by Caller'
  };

  const title = stateTitles[nextState] || nextState;

  // Handle vehicle status syncing
  if (incident.assignedVehicleId) {
    if (nextState === 'VEHICLE_EN_ROUTE') {
      jeevanDb.updateVehicle(incident.assignedVehicleId, { status: 'EN_ROUTE' });
    } else if (nextState === 'CASE_COMPLETED' || nextState === 'USER_CANCELLED') {
      jeevanDb.updateVehicle(incident.assignedVehicleId, { status: 'AVAILABLE', activeIncidentId: undefined });
    }
  }

  const updated = jeevanDb.addTimelineEvent(incident.id, {
    state: nextState,
    title,
    description: details || `State advanced to ${nextState}.`,
    actor: actor || 'Care Workflow'
  });

  res.json({ success: true, incident: updated });
};

/**
 * Vehicle Fleet Telemetry
 */
export const getVehicles = (_req: Request, res: Response) => {
  const vehicles = jeevanDb.getVehicles();
  res.json({ success: true, count: vehicles.length, vehicles });
};

export const updateVehicleStatus = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, lat, lng, bearing } = req.body;

  const vehicle = jeevanDb.getVehicleById(id);
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found.' });
    return;
  }

  const updates: any = {};
  if (status) updates.status = status;
  if (typeof lat === 'number' && typeof lng === 'number') {
    updates.currentLocation = {
      ...vehicle.currentLocation,
      lat,
      lng
    };
  }
  if (typeof bearing === 'number') updates.bearing = bearing;

  const updated = jeevanDb.updateVehicle(id, updates);
  res.json({ success: true, vehicle: updated });
};

/**
 * Hospitals Directory & Emergency Bed Availability
 */
export const getHospitals = (_req: Request, res: Response) => {
  const hospitals = jeevanDb.getHospitals();
  res.json({ success: true, count: hospitals.length, hospitals });
};

export const updateHospitalBedCapacity = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { emergencyBedsAvailable, traumaBaysAvailable, icuBedsAvailable, status } = req.body;

  const updated = jeevanDb.updateHospital(id, {
    emergencyBedsAvailable,
    traumaBaysAvailable,
    icuBedsAvailable,
    emergencyDepartmentStatus: status
  });

  if (!updated) {
    res.status(404).json({ error: 'Hospital not found.' });
    return;
  }

  res.json({ success: true, hospital: updated });
};

/**
 * Routine Hospital Appointment Booking (Scenario C)
 */
export const createAppointment = (req: Request, res: Response) => {
  const hospitalId = req.body.hospitalId || 'hosp-aiims-trauma';
  const hospitalName = req.body.hospitalName || 'Government District Hospital';
  const department = req.body.department || 'General Medicine';
  const patientName = req.body.patientName || 'Walk-in Patient';
  const patientPhone = req.body.patientPhone || req.body.contactNumber || '9876543210';
  const date = req.body.date || req.body.slotDate || new Date().toISOString().split('T')[0];
  const timeSlot = req.body.timeSlot || req.body.slotTime || '10:30 AM - 11:30 AM';
  const reason = req.body.reason || 'Routine OPD Consultation';
  const transportBooked = Boolean(req.body.transportBooked || req.body.transportRequested);

  const appt = jeevanDb.createAppointment({
    hospitalId,
    hospitalName,
    department,
    patientName,
    patientPhone,
    date,
    timeSlot,
    reason,
    status: 'CONFIRMED',
    transportBooked
  });

  res.status(201).json({ success: true, appointment: appt });
};

export const getAppointments = (_req: Request, res: Response) => {
  const appts = jeevanDb.getAppointments();
  res.json({ success: true, count: appts.length, appointments: appts });
};

/**
 * Patient Registration (Only After Arrival & Treatment Started)
 */
export const registerPatient = (req: Request, res: Response) => {
  const incidentId = req.body.incidentId || '';
  const fullName = req.body.fullName || req.body.patientName || 'Registered Patient';
  const contactNumber = req.body.contactNumber || req.body.contactPhone || '9876543210';
  const age = Number(req.body.age) || 30;
  const gender = req.body.gender || 'Unspecified';
  const emergencyContact = req.body.emergencyContact || { name: 'Emergency Next of Kin', relationship: 'Family', phone: contactNumber };
  const aadhaarOrId = req.body.aadhaarOrId || req.body.abhaId;
  const residentialAddress = req.body.residentialAddress || 'Local Address';
  const bloodGroup = req.body.bloodGroup;
  const allergies = req.body.allergies || [];
  const knownConditions = req.body.knownConditions || [];
  const isProvisional = Boolean(req.body.isProvisional);
  const registeredByStaff = req.body.registeredByStaff || 'Hospital Intake Clerk';

  const uhid = `UHID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const registration = jeevanDb.createPatientRegistration({
    uhid,
    incidentId,
    fullName,
    age,
    gender,
    contactNumber,
    emergencyContact,
    aadhaarOrId,
    residentialAddress,
    bloodGroup,
    allergies,
    knownConditions,
    isProvisional,
    registeredByStaff
  });

  // If incident exists, advance state to REGISTRATION_COMPLETED
  let incident = null;
  if (incidentId) {
    incident = jeevanDb.updateIncident(incidentId, {
      state: 'REGISTRATION_COMPLETED',
      patientName: fullName,
      patientAge: age,
      patientGender: gender,
      contactPhone: contactNumber
    });
  }

  res.status(201).json({ success: true, registration, incident });
};

/**
 * System Administration & Fleet Telemetry Stats
 */
export const getSystemStats = (_req: Request, res: Response) => {
  const incidents = jeevanDb.getIncidents();
  const vehicles = jeevanDb.getVehicles();
  const hospitals = jeevanDb.getHospitals();

  const activeEmergencyCount = incidents.filter(i => i.urgency === 'critical' && i.state !== 'CASE_COMPLETED').length;
  const availableAmbulances = vehicles.filter(v => v.status === 'AVAILABLE' && (v.capability === 'AMBULANCE_ALS' || v.capability === 'AMBULANCE_BLS')).length;
  const totalTraumaBays = hospitals.reduce((sum, h) => sum + (h.traumaBaysAvailable || 0), 0);

  res.json({
    success: true,
    stats: {
      totalIncidents: incidents.length,
      activeEmergencies: activeEmergencyCount,
      availableAmbulances,
      totalVehicles: vehicles.length,
      hospitalsConnected: hospitals.length,
      availableTraumaBays: totalTraumaBays,
      geminiAiStatus: process.env.GEMINI_API_KEY ? 'CONNECTED_GEMINI_1.5' : 'DETERMINISTIC_SAFETY_ENGINE'
    }
  });
};
