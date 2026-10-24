import { Router } from 'express';
import {
  interpretTranscript,
  createIncident,
  getIncidents,
  getIncidentById,
  dispatchVehicleToIncident,
  advanceIncidentState,
  getVehicles,
  updateVehicleStatus,
  getHospitals,
  updateHospitalBedCapacity,
  createAppointment,
  getAppointments,
  registerPatient,
  getSystemStats
} from '../controllers/jeevanController.js';

const router = Router();

// AI & Voice Interpretation
router.post('/ai/interpret', interpretTranscript);

// Emergency Incidents (Emergency First)
router.post('/incidents', createIncident);
router.get('/incidents', getIncidents);
router.get('/incidents/:id', getIncidentById);
router.post('/incidents/:id/dispatch', dispatchVehicleToIncident);
router.patch('/incidents/:id/state', advanceIncidentState);

// Vehicles & Ambulance Telemetry
router.get('/vehicles', getVehicles);
router.patch('/vehicles/:id/status', updateVehicleStatus);

// Government Hospitals & Beds
router.get('/hospitals', getHospitals);
router.patch('/hospitals/:id/capacity', updateHospitalBedCapacity);

// Routine OPD Appointments (Scenario C)
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);

// Post-Arrival Patient Registration (Section 7)
router.post('/patients/register', registerPatient);

// Administration & Stats
router.get('/admin/stats', getSystemStats);

export default router;
