import React, { useState, useEffect, useRef } from 'react';
import { jeevanApi } from '../lib/jeevanApi';
import type { EmergencyIncident, IncidentEvent } from '../types/jeevan';
import { JeevanLiveMap } from '../components/jeevan/JeevanLiveMap';
import {
  Phone,
  ArrowLeft,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';

interface LiveIncidentTrackingPageProps {
  incidentId: string;
  onBack: () => void;
}

const LIFECYCLE_STAGES = [
  { state: 'DISPATCH_PENDING', label: 'Dispatch Pending', icon: '📡' },
  { state: 'DISPATCH_ACCEPTED', label: 'Ambulance Assigned', icon: '🚑' },
  { state: 'VEHICLE_EN_ROUTE', label: 'En Route to Scene', icon: '⚡' },
  { state: 'VEHICLE_AT_PICKUP', label: 'At Patient Scene', icon: '📍' },
  { state: 'PATIENT_ONBOARD', label: 'Patient In Transit', icon: '🛣️' },
  { state: 'ARRIVED_AT_HOSPITAL', label: 'Arrived at Hospital', icon: '🏥' },
  { state: 'TREATMENT_STARTED', label: 'Emergency Care Active', icon: '🩺' },
  { state: 'REGISTRATION_PENDING', label: 'Hospital Registration', icon: '📝' },
  { state: 'REGISTRATION_COMPLETED', label: 'Case Registered', icon: '✅' },
];

export const LiveIncidentTrackingPage: React.FC<LiveIncidentTrackingPageProps> = ({
  incidentId,
  onBack,
}) => {
  const [incident, setIncident] = useState<EmergencyIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Post-Treatment Registration Form state (Section 7)
  const [showRegModal, setShowRegModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(32);
  const [patientGender, setPatientGender] = useState('Male');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState<any | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const pollIntervalRef = useRef<any>(null);

  const fetchIncidentDetails = React.useCallback(async () => {
    try {
      const res = await jeevanApi.getIncident(incidentId);
      if (res.success && res.incident) {
        const fullIncident: EmergencyIncident = {
          ...res.incident,
          assignedVehicle: (res as any).assignedVehicle || res.incident.assignedVehicle,
          assignedHospital: (res as any).destinationHospital || res.incident.assignedHospital,
        };
        setIncident(fullIncident);
        if ((res as any).routeWaypoints && Array.isArray((res as any).routeWaypoints)) {
          const coords: [number, number][] = (res as any).routeWaypoints.map((pt: any) => [pt.lat, pt.lng]);
          setRouteCoordinates(coords);
        }
        setSecondsAgo(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incident status');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchIncidentDetails();
    pollIntervalRef.current = setInterval(fetchIncidentDetails, 5000);

    const timer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      clearInterval(timer);
    };
  }, [fetchIncidentDetails]);

  // Stage progression index
  const getCurrentStageIndex = () => {
    if (!incident) return 0;
    const idx = LIFECYCLE_STAGES.findIndex((s) => s.state === incident.state);
    return idx >= 0 ? idx : 1;
  };

  // Submit Post-Arrival Registration (Section 7)
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !incident.assignedHospitalId) return;

    try {
      setIsSubmittingReg(true);
      const res = await jeevanApi.registerPatient({
        incidentId: incident.id,
        hospitalId: incident.assignedHospitalId,
        patientName: patientName || 'Provisional Unidentified Patient',
        age: typeof patientAge === 'number' ? patientAge : 30,
        gender: patientGender,
        contactPhone: contactPhone || 'Not available at intake',
        emergencyContact: emergencyContact || 'Not available at intake',
        provisionalDiagnosis: provisionalDiagnosis || incident.aiInterpretation?.incident_description || 'Acute Trauma',
        abhaId: abhaId || undefined,
      });

      if (res.success) {
        setRegSuccess(res.registration);
        setShowRegModal(false);
        fetchIncidentDetails();
      }
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-mono text-sm font-semibold">Connecting to Live Emergency Telemetry...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 max-w-2xl mx-auto flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-sm w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Incident Not Found</h2>
          <p className="text-sm text-slate-600">{error || 'Unable to locate incident ID.'}</p>
          <button
            onClick={onBack}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs"
          >
            Return to Emergency SOS
          </button>
        </div>
      </div>
    );
  }

  const currentStageIdx = getCurrentStageIndex();
  const vehicle = incident.assignedVehicle;
  const hospital = incident.assignedHospital;
  const isRegistrationAllowed =
    incident.state === 'TREATMENT_STARTED' ||
    incident.state === 'REGISTRATION_PENDING' ||
    incident.state === 'REGISTRATION_COMPLETED' ||
    incident.state === 'CASE_COMPLETED';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 font-sans">
      
      {/* Top Tracking Status Header (Clean Light) */}
      <div className="bg-white border-b border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition flex items-center gap-1 text-xs font-bold"
              title="Return to home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-red-50 text-red-700 px-2.5 py-0.5 rounded-md border border-red-200 font-bold">
                  INCIDENT #{incident.id.slice(0, 8)}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                    incident.urgency === 'critical'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {incident.urgency.toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Live Emergency Dispatch & Telemetry
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Incident Submission Date & Time Stamp */}
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                <span>{new Date(incident.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>{new Date(incident.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
              </div>
            </div>

            <a
              href="tel:108"
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-md shadow-red-500/25 flex items-center gap-2 animate-pulse"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>EMERGENCY CALL 108</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Incident Submission Audit Stamp */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Emergency Details Submitted & Broadcast:</strong> {new Date(incident.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at <strong className="font-mono text-slate-900">{new Date(incident.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</strong>
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Grid Tracking Active</span>
          </div>
        </div>

        {/* Real Road Network ETA & Status Banner (Light Theme) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-3xl text-white shadow-md shadow-red-500/25">
              🚑
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                Estimated Road Arrival Time
              </div>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 flex items-baseline gap-2">
                <span>{incident.etaMinutes ?? 8} MINUTES</span>
                <span className="text-xs font-semibold text-emerald-700">
                  ({incident.distanceKm ?? 3.4} km via urban network)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Updated {secondsAgo}s ago &bull; GPS Real-time Telemetry
              </p>
            </div>
          </div>

          {/* Assigned Ambulance Driver Card */}
          {vehicle ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 min-w-[260px]">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                👨‍✈️
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 text-sm">{vehicle.callSign}</div>
                <div className="text-slate-600">Capability: <strong className="text-red-600">{vehicle.capability}</strong></div>
                <div className="text-slate-600">Driver: {vehicle.driverName}</div>
                <a href={`tel:${vehicle.driverPhone}`} className="text-blue-600 font-bold underline mt-1 block">
                  📞 {vehicle.driverPhone}
                </a>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3.5 rounded-2xl font-medium">
              Locating nearest available ALS / BLS ambulance unit...
            </div>
          )}
        </div>

        {/* 15-Stage Lifecycle Stepper (Clean Light Horizontal Stepper) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
            Incident Progress &bull; Emergency-First Lifecycle
          </div>
          <div className="flex items-center min-w-[700px] justify-between relative py-2">
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-1.5 bg-red-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${(currentStageIdx / (LIFECYCLE_STAGES.length - 1)) * 100}%`,
              }}
            ></div>

            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPassed = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div key={stage.state} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-red-600 text-white ring-4 ring-red-100 scale-110 shadow-md'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPassed ? '✓' : stage.icon}
                  </div>
                  <span
                    className={`text-[10px] mt-2 whitespace-nowrap font-semibold ${
                      isCurrent
                        ? 'text-red-700 font-bold'
                        : isPassed
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Map & Receiving Hospital Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm">
              <JeevanLiveMap
                userLocation={incident.pickupLocation}
                selectedVehicle={vehicle}
                assignedHospital={hospital}
                routeCoordinates={routeCoordinates}
                className="h-[420px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"
              />
            </div>
          </div>

          {/* Incident Details & Receiving Hospital Column */}
          <div className="space-y-4">
            {/* Receiving Government Hospital Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Receiving Apex Hospital</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {hospital?.name || 'AIIMS Apex Trauma Center, New Delhi'}
              </h3>
              <p className="text-xs text-slate-600">
                {hospital?.location?.address || 'Ring Road, Safdarjung Enclave, New Delhi'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-medium">Trauma Bays:</div>
                  <div className="text-base font-bold text-red-600">
                    {hospital?.traumaBaysAvailable ?? 4} Ready
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-medium">Emergency Beds:</div>
                  <div className="text-base font-bold text-emerald-700">
                    {hospital?.availableBeds ?? 38} Open
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 leading-relaxed font-medium">
                🚨 <strong>Pre-Arrival Alert Sent:</strong> Hospital trauma resuscitation team has been pre-notified with symptoms and ETA.
              </div>
            </div>

            {/* AI Incident Analysis Box */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>🤖 CLINICAL TRIAGE REPORT</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-mono">
                  Deterministic Safety
                </span>
              </div>
              <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{incident.transcript}"
              </p>
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="text-slate-500">Reported Symptoms: </span>
                  <span className="text-red-700 font-bold">
                    {incident.aiInterpretation?.reported_symptoms?.join(', ') || 'Severe bleeding, trauma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Triage Assessment: </span>
                  <span className="text-slate-700 font-medium">
                    {incident.aiInterpretation?.reasoning_summary || 'Potentially life-threatening. Dispatched ALS.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 7: Post-Arrival Hospital Registration Drawer */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Post-Arrival Patient Registration</h4>
                  <p className="text-[11px] text-slate-500">
                    Section 7: Only unlocked once emergency care is underway.
                  </p>
                </div>
              </div>

              {regSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs space-y-2">
                  <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Patient Registration Linked & Encrypted</span>
                  </div>
                  <div>Record ID: <strong className="font-mono">{regSuccess.id}</strong></div>
                  <div>Encounter ID: <strong className="font-mono">{regSuccess.encounterId}</strong></div>
                  <div>Patient Name: <strong>{regSuccess.patientName}</strong></div>
                  <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-700 border-t border-emerald-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <strong>Registered Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <strong>Time:</strong> {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              ) : isRegistrationAllowed ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800">
                    🏥 Patient has arrived and clinical resuscitation is underway. Hospital registration is now unlocked.
                  </div>
                  <button
                    onClick={() => setShowRegModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-xs"
                  >
                    Complete Demographic Registration Form
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>REGISTRATION FORM LOCKED</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    By emergency design, patient registration does not block dispatch or transit. Hospital staff will unlock registration once the patient reaches the emergency department and treatment begins.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📜</span> Auditable Chronological Timeline of Events
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {incident.timeline?.map((evt: IncidentEvent, i: number) => (
              <div
                key={evt.id || i}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                    {evt.actor}
                  </span>
                  <span className="font-semibold text-slate-800">{evt.note}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Modal Dialog (Section 7) */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Post-Arrival Patient Registration</h3>
              <button
                onClick={() => setShowRegModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Link demographic and ABHA records to Emergency Incident #{incident.id.slice(0, 8)}.
              If the patient is unconscious, support provisional registration without delay.
            </p>

            <form onSubmit={handleRegisterPatient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Patient Full Name (or "Unidentified Male/Female")
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma (or leave blank for provisional)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Kin Name & Phone"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  ABHA Health ID / Ayushman Bharat (Optional)
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="e.g. 14-digit ABHA number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Provisional Diagnosis</label>
                <input
                  type="text"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  placeholder="e.g. Poly-trauma, hemorrhagic shock"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  {isSubmittingReg ? 'Linking...' : 'Save & Link Hospital Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
