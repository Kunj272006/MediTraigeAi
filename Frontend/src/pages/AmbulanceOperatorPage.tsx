import React, { useState, useEffect } from 'react';
import { jeevanApi } from '../lib/jeevanApi';
import type { EmergencyIncident, IncidentState, Vehicle, VehicleStatus } from '../types/jeevan';
import { JeevanLiveMap } from '../components/jeevan/JeevanLiveMap';

export const AmbulanceOperatorPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Load vehicles
  const loadFleet = async () => {
    try {
      const res = await jeevanApi.getVehicles();
      if (res.success && res.vehicles.length > 0) {
        setVehicles(res.vehicles);
        if (!selectedVehicleId) {
          setSelectedVehicleId(res.vehicles[0].id);
          setActiveVehicle(res.vehicles[0]);
        } else {
          const curr = res.vehicles.find((v: Vehicle) => v.id === selectedVehicleId);
          if (curr) setActiveVehicle(curr);
        }
      }
    } catch (err: any) {
      console.error('Error fetching fleet:', err);
    }
  };

  // Check if active vehicle has an assigned incident
  const checkAssignedIncident = async () => {
    if (!activeVehicle) return;
    try {
      const incRes = await jeevanApi.getIncidents();
      if (incRes.success) {
        // Find incident assigned to this vehicle
        const assigned = incRes.incidents.find(
          (i: EmergencyIncident) => i.assignedVehicleId === activeVehicle.id && i.state !== 'CASE_COMPLETED'
        );
        setActiveIncident(assigned || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFleet();
    const interval = setInterval(() => {
      loadFleet();
      checkAssignedIncident();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedVehicleId]);

  useEffect(() => {
    checkAssignedIncident();
  }, [activeVehicle?.id]);

  // Handle vehicle selector change
  const handleSelectVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    const v = vehicles.find((x) => x.id === vId);
    if (v) setActiveVehicle(v);
  };

  // Toggle Availability
  const handleToggleAvailability = async () => {
    if (!activeVehicle) return;
    const nextStatus: VehicleStatus =
      activeVehicle.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    try {
      const res = await jeevanApi.updateVehicleStatus(activeVehicle.id, nextStatus);
      if (res.success) {
        setActiveVehicle(res.vehicle);
        setStatusMsg(`Status updated to ${nextStatus}`);
      }
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // Advance state for current active incident
  const handleAdvanceState = async (toState: IncidentState, note: string) => {
    if (!activeIncident) return;
    try {
      const res = await jeevanApi.advanceIncidentState(
        activeIncident.id,
        toState,
        'OPERATOR',
        note
      );
      if (res.success) {
        setActiveIncident(res.incident);
        setStatusMsg(`Incident status advanced to: ${toState}`);
        loadFleet();
      }
    } catch (err: any) {
      alert(err.message || 'Status transition error');
    } finally {
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // Reject assignment
  const handleReject = async () => {
    if (!activeIncident) return;
    try {
      await jeevanApi.advanceIncidentState(
        activeIncident.id,
        'OPERATOR_DECLINED',
        'OPERATOR',
        'Vehicle operator declined: Mechanical inspection or road delay'
      );
      setActiveIncident(null);
      setStatusMsg('Assignment declined. Returned to dispatcher queue.');
      loadFleet();
    } catch (err: any) {
      alert(err.message || 'Decline failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 font-sans">
      {/* Operator Header */}
      <div className="bg-white border-b border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-2xs">
              🚑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Ambulance Mobile Operator MDT
                </h1>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  VERIFIED UNIT
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Vehicle Mobile Data Terminal (MDT) &bull; Navigation & Patient Status Sync
              </p>
            </div>
          </div>

          {/* Vehicle Unit Picker & Status */}
          <div className="flex items-center gap-3">
            <select
              value={selectedVehicleId}
              onChange={(e) => handleSelectVehicle(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs font-bold rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.callSign} ({v.capability}) - {v.status}
                </option>
              ))}
            </select>

            {activeVehicle && (
              <button
                onClick={handleToggleAvailability}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs ${
                  activeVehicle.status === 'AVAILABLE'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                {activeVehicle.status === 'AVAILABLE' ? '🟢 ONLINE / READY' : '⚪ GO AVAILABLE'}
              </button>
            )}
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-emerald-900 text-xs font-semibold shadow-xs">
            {statusMsg}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Active Emergency Callout Banner */}
        {activeIncident ? (
          <div className="bg-white border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="animate-ping w-3 h-3 rounded-full bg-red-600"></span>
                <span className="text-sm font-black text-red-700 uppercase tracking-wider">
                  ACTIVE EMERGENCY DISPATCH ASSIGNMENT
                </span>
                <span className="text-xs bg-red-50 border border-red-200 px-2 py-0.5 rounded text-red-800 font-mono font-bold">
                  #{activeIncident.id.slice(0, 8)}
                </span>
              </div>

              <div className="text-xs text-slate-600">
                Current State: <strong className="text-amber-700 font-bold">{activeIncident.state}</strong>
              </div>
            </div>

            {/* Incident Details & Symptoms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500">PATIENT / INCIDENT REPORT:</div>
                <div className="text-sm font-semibold text-slate-900">"{activeIncident.transcript}"</div>
                <div className="text-slate-600 pt-1">
                  Symptoms: <strong className="text-red-700">{activeIncident.aiInterpretation?.reported_symptoms?.join(', ') || 'Acute Trauma'}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500">DESTINATION APEX FACILITY:</div>
                <div className="text-sm font-semibold text-blue-700">
                  {activeIncident.assignedHospital?.name || 'AIIMS Apex Trauma Center'}
                </div>
                <div className="text-slate-600 pt-1">
                  Pre-notified Beds: <strong className="text-emerald-700">{activeIncident.assignedHospital?.traumaBaysAvailable ?? 4} Trauma Bays</strong>
                </div>
              </div>
            </div>

            {/* Stepper Buttons for Driver */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              {activeIncident.state === 'DISPATCH_PENDING' && (
                <>
                  <button
                    onClick={() => handleAdvanceState('DISPATCH_ACCEPTED', 'Driver accepted call')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md text-sm transition"
                  >
                    ✅ ACCEPT ASSIGNMENT
                  </button>
                  <button
                    onClick={handleReject}
                    className="bg-slate-100 hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-700 hover:text-red-700 font-bold py-3.5 px-4 rounded-xl transition"
                  >
                    ✕ DECLINE
                  </button>
                </>
              )}

              {activeIncident.state === 'DISPATCH_ACCEPTED' && (
                <button
                  onClick={() => handleAdvanceState('VEHICLE_EN_ROUTE', 'Siren on, rolling to pickup')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md text-sm transition"
                >
                  ⚡ START ROLLING / EN ROUTE TO SCENE
                </button>
              )}

              {activeIncident.state === 'VEHICLE_EN_ROUTE' && (
                <button
                  onClick={() => handleAdvanceState('VEHICLE_AT_PICKUP', 'Arrived at patient location')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md text-sm transition"
                >
                  📍 ARRIVED AT PATIENT SCENE
                </button>
              )}

              {activeIncident.state === 'VEHICLE_AT_PICKUP' && (
                <button
                  onClick={() => handleAdvanceState('PATIENT_ONBOARD', 'Patient secured in ambulance, en route to hospital')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md text-sm transition"
                >
                  🛣️ PATIENT SECURED ONBOARD &rarr; HEADING TO HOSPITAL
                </button>
              )}

              {activeIncident.state === 'PATIENT_ONBOARD' && (
                <button
                  onClick={() => handleAdvanceState('ARRIVED_AT_HOSPITAL', 'Ambulance backed into trauma bay')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md text-sm transition"
                >
                  🏥 ARRIVED AT HOSPITAL TRAUMA BAY
                </button>
              )}

              {activeIncident.state === 'ARRIVED_AT_HOSPITAL' && (
                <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-slate-700 text-xs font-medium">
                  Patient handover in progress. Awaiting hospital clinical staff confirmation of treatment initiation.
                </div>
              )}
            </div>

            {/* Navigation Map for Driver */}
            <div className="pt-2">
              <JeevanLiveMap
                userLocation={activeIncident.pickupLocation}
                selectedVehicle={activeVehicle || undefined}
                assignedHospital={activeIncident.assignedHospital}
                className="h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"
              />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <span className="text-4xl">🟢</span>
            <h3 className="text-lg font-bold text-slate-900">Ambulance Unit Standing By</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your unit ({activeVehicle?.callSign || 'Selected Unit'}) is active in the 108 dispatch grid.
              When a citizen emergency or medical transport request matches this unit, assignment orders will chime here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
