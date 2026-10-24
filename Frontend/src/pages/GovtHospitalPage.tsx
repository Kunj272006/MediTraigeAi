import React, { useState, useEffect } from 'react';
import { jeevanApi } from '../lib/jeevanApi';
import type {
  EmergencyIncident,
  Hospital,
  HospitalAppointment
} from '../types/jeevan';

export const GovtHospitalPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [appointments, setAppointments] = useState<HospitalAppointment[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Registration Form in hospital desk
  const [activeRegIncident, setActiveRegIncident] = useState<EmergencyIncident | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(28);
  const [patientGender, setPatientGender] = useState('Male');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');

  const loadData = async () => {
    try {
      const [hospRes, incRes, apptRes] = await Promise.all([
        jeevanApi.getHospitals(),
        jeevanApi.getIncidents(),
        jeevanApi.getAppointments(),
      ]);

      if (hospRes.success && hospRes.hospitals.length > 0) {
        setHospitals(hospRes.hospitals);
        if (!selectedHospitalId) {
          setSelectedHospitalId(hospRes.hospitals[0].id);
          setSelectedHospital(hospRes.hospitals[0]);
        } else {
          const found = hospRes.hospitals.find((h: Hospital) => h.id === selectedHospitalId);
          if (found) setSelectedHospital(found);
        }
      }

      if (incRes.success) setIncidents(incRes.incidents);
      if (apptRes.success) setAppointments(apptRes.appointments);
    } catch (err: any) {
      console.error('Hospital data fetch error:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [selectedHospitalId]);

  const handleSelectHospital = (id: string) => {
    setSelectedHospitalId(id);
    const h = hospitals.find((x) => x.id === id);
    if (h) setSelectedHospital(h);
  };

  // Hospital Clinical Action: Confirm Patient Arrival
  const handleConfirmArrival = async (incidentId: string) => {
    try {
      await jeevanApi.advanceIncidentState(
        incidentId,
        'ARRIVED_AT_HOSPITAL',
        'HOSPITAL_STAFF',
        'Hospital triage desk confirmed ambulance bay arrival'
      );
      setStatusMsg('Ambulance arrival logged at trauma bay.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Arrival confirmation error');
    }
  };

  // Hospital Clinical Action: Start Emergency Treatment (Section 7 Trigger)
  const handleStartTreatment = async (incidentId: string) => {
    try {
      await jeevanApi.advanceIncidentState(
        incidentId,
        'TREATMENT_STARTED',
        'HOSPITAL_STAFF',
        'Emergency trauma resuscitation initiated by ER duty officer'
      );
      setStatusMsg('Emergency treatment initiated! Post-arrival patient registration unlocked.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Treatment start error');
    }
  };

  // Complete Hospital Patient Registration (Section 7)
  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegIncident || !selectedHospital) return;

    try {
      const res = await jeevanApi.registerPatient({
        incidentId: activeRegIncident.id,
        hospitalId: selectedHospital.id,
        patientName: patientName || 'Provisional Patient',
        age: typeof patientAge === 'number' ? patientAge : 30,
        gender: patientGender,
        contactPhone: contactPhone || '9999999999',
        emergencyContact: emergencyContact || 'Accompanied by EMT',
        provisionalDiagnosis: provisionalDiagnosis || activeRegIncident.aiInterpretation?.incident_description || 'Acute Trauma',
        abhaId: abhaId || undefined,
      });

      if (res.success) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setStatusMsg(`Patient registered on ${dateStr} at ${timeStr} • Assigned Encounter ID: ${res.registration.encounterId}`);
        setActiveRegIncident(null);
        setPatientName('');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Registration error');
    }
  };

  // Adjust Bed Capacity Live
  const handleUpdateBeds = async (deltaBeds: number, deltaTrauma: number) => {
    if (!selectedHospital) return;
    const newBeds = Math.max(0, selectedHospital.availableBeds + deltaBeds);
    const newTrauma = Math.max(0, selectedHospital.traumaBaysAvailable + deltaTrauma);
    try {
      const res = await jeevanApi.updateHospitalCapacity(selectedHospital.id, newBeds, newTrauma);
      if (res.success) {
        setSelectedHospital(res.hospital);
        setStatusMsg('Hospital bed capacity updated in central grid.');
      }
    } catch (err: any) {
      alert(err.message || 'Capacity update error');
    }
  };

  // Incoming emergencies targeting this hospital
  const incomingEmergencies = incidents.filter(
    (i) => i.assignedHospitalId === selectedHospital?.id || !i.assignedHospitalId
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 font-sans">
      {/* Hospital Command Banner */}
      <div className="bg-white border-b border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-2xs">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Government Hospital Emergency Command
                </h1>
                <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                  APEX TRAUMA NODE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pre-arrival Telemetry &bull; Resuscitation Bay Coordination &bull; Post-Care Registration
              </p>
            </div>
          </div>

          {/* Hospital Facility Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedHospitalId}
              onChange={(e) => handleSelectHospital(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs font-bold rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-emerald-900 text-xs font-semibold shadow-xs">
            {statusMsg}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {/* Hospital Resource & Resuscitation Capacity Grid */}
        {selectedHospital && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500">AVAILABLE TRAUMA BAYS</div>
              <div className="text-3xl font-black text-red-600 flex items-center justify-between">
                <span>{selectedHospital.traumaBaysAvailable}</span>
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => handleUpdateBeds(0, -1)}
                    className="w-7 h-7 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold rounded-lg transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateBeds(0, 1)}
                    className="w-7 h-7 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold rounded-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Fully equipped ICU resuscitation beds</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500">OPEN EMERGENCY BEDS</div>
              <div className="text-3xl font-black text-emerald-700 flex items-center justify-between">
                <span>{selectedHospital.availableBeds}</span>
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => handleUpdateBeds(-1, 0)}
                    className="w-7 h-7 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold rounded-lg transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateBeds(1, 0)}
                    className="w-7 h-7 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold rounded-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Total hospital beds: {selectedHospital.totalBeds}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500">OXYGEN & BLOOD BANK</div>
              <div className="text-xl font-bold text-blue-700">VERIFIED OPERATIONAL</div>
              <p className="text-[11px] text-slate-500">Central PSA Plant & O-Negative stocks primed</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500">OPD CLINICAL TOKENS</div>
              <div className="text-3xl font-black text-amber-700">{appointments.length}</div>
              <p className="text-[11px] text-slate-500">Digital OPD tokens issued today</p>
            </div>
          </div>
        )}

        {/* Incoming Emergency Ambulances Table */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🚨</span> Incoming Emergency Ambulances & Pre-Arrival Queue
              </h2>
              <p className="text-xs text-slate-500">
                Pre-arrival patient data &bull; Confirm arrival &bull; Confirm treatment initiation
              </p>
            </div>
            <span className="text-xs font-mono text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              {incomingEmergencies.length} CASES ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            {incomingEmergencies.map((inc) => {
              const isTreatmentActive =
                inc.state === 'TREATMENT_STARTED' ||
                inc.state === 'REGISTRATION_PENDING' ||
                inc.state === 'REGISTRATION_COMPLETED';

              return (
                <div
                  key={inc.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">#{inc.id.slice(0, 8)}</span>
                      <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {inc.urgency}
                      </span>
                      <span className="font-mono text-emerald-700 font-semibold">{inc.state}</span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900">
                      "{inc.transcript}"
                    </div>

                    <div className="text-slate-500 flex items-center gap-3 pt-1">
                      <span>Vehicle: <strong className="text-slate-800">{inc.assignedVehicle?.callSign || 'Pending'}</strong></span>
                      <span>ETA: <strong className="text-emerald-700 font-bold">{inc.etaMinutes || 8} mins</strong></span>
                      <span>Symptoms: <strong className="text-red-700">{inc.aiInterpretation?.reported_symptoms?.join(', ') || 'Acute trauma'}</strong></span>
                    </div>
                  </div>

                  {/* Clinical Actions */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {inc.state === 'PATIENT_ONBOARD' && (
                      <button
                        onClick={() => handleConfirmArrival(inc.id)}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition"
                      >
                        Confirm Ambulance Bay Arrival
                      </button>
                    )}

                    {inc.state === 'ARRIVED_AT_HOSPITAL' && (
                      <button
                        onClick={() => handleStartTreatment(inc.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm animate-pulse transition"
                      >
                        🩺 Confirm Emergency Treatment Started
                      </button>
                    )}

                    {isTreatmentActive && (
                      <button
                        onClick={() => {
                          setActiveRegIncident(inc);
                          setPatientName(inc.provisionalPatientName || '');
                        }}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                      >
                        📝 Open Hospital Registration
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {incomingEmergencies.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No active incoming emergency transports at this moment.
              </div>
            )}
          </div>
        </div>

        {/* Post-Arrival Patient Registration Drawer (Section 7) */}
        {activeRegIncident && (
          <div className="bg-white border-2 border-blue-500 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📝</span> Post-Arrival Patient Registration & Demographic Record
                </h3>
                <p className="text-xs text-slate-500">
                  Section 7: Registered after care begins &bull; Linked to Incident #{activeRegIncident.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setActiveRegIncident(null)}
                className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveRegistration} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Patient Phone</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Emergency Kin Contact</label>
                  <input
                    type="text"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Relation & Phone"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ABHA Health ID (Ayushman)</label>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="14-digit ABHA Number"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Provisional Clinical Diagnosis</label>
                <input
                  type="text"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Traumatic Hemorrhage, GCS 12"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition text-xs"
              >
                Submit Official Hospital Registration & Link Encounter
              </button>
            </form>
          </div>
        )}

        {/* Routine OPD Appointments List (Scenario C) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>📅</span> Digital OPD Appointments (Scenario C)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {appointments.map((a) => (
              <div key={a.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{a.patientName}</span>
                  <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-bold">
                    {a.bookingToken}
                  </span>
                </div>
                <div className="text-slate-600">Department: <strong className="text-slate-900">{a.department}</strong></div>
                <div className="text-slate-600">Slot: <strong className="text-emerald-700">{a.slotTime}</strong></div>
                <div className="text-slate-500 font-mono text-[10px]">Phone: {a.patientPhone}</div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="col-span-full p-6 text-center text-xs text-slate-400">
                No OPD tokens booked for this facility yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
