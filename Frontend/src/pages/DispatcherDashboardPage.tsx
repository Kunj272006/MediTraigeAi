import React, { useState, useEffect } from 'react';
import { jeevanApi } from '../lib/jeevanApi';
import type { EmergencyIncident, IncidentState, Vehicle } from '../types/jeevan';
import { JeevanLiveMap } from '../components/jeevan/JeevanLiveMap';

interface DispatcherDashboardPageProps {
  onSelectIncident: (id: string) => void;
}

export const DispatcherDashboardPage: React.FC<DispatcherDashboardPageProps> = ({
  onSelectIncident,
}) => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [incRes, vehRes] = await Promise.all([
        jeevanApi.getIncidents(),
        jeevanApi.getVehicles(),
      ]);

      if (incRes.success) setIncidents(incRes.incidents);
      if (vehRes.success) setVehicles(vehRes.vehicles);

      if (selectedIncident) {
        const updated = incRes.incidents.find((i: EmergencyIncident) => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      } else if (incRes.incidents.length > 0) {
        setSelectedIncident(incRes.incidents[0]);
      }
    } catch (err: any) {
      console.error('Dispatcher fetch error:', err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  // When an incident is selected, load detailed dispatch scoring candidates
  useEffect(() => {
    if (!selectedIncident) return;
    jeevanApi.getIncident(selectedIncident.id).then((res: { success: boolean; candidates?: any[] }) => {
      if (res.success && res.candidates) {
        setCandidates(res.candidates);
      }
    }).catch(console.error);
  }, [selectedIncident?.id]);

  // Dispatch or Override vehicle assignment
  const handleAssignVehicle = async (vehicleId: string) => {
    if (!selectedIncident) return;
    try {
      setActionMsg('Assigning vehicle to emergency call...');
      const res = await jeevanApi.dispatchVehicle(selectedIncident.id, vehicleId);
      if (res.success) {
        setActionMsg(`Successfully dispatched ${res.vehicle.callSign} to Incident #${selectedIncident.id.slice(0, 8)}`);
        refreshData();
      }
    } catch (err: any) {
      alert(err.message || 'Dispatch failed');
    } finally {
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  // State Transition (e.g. Escalate, Cancel, Advance)
  const handleStateChange = async (newState: IncidentState, note: string) => {
    if (!selectedIncident) return;
    try {
      await jeevanApi.advanceIncidentState(selectedIncident.id, newState, 'DISPATCHER', note);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'State change failed');
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterUrgency === 'all') return true;
    return inc.urgency === filterUrgency;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 font-sans">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📡</span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Emergency Central Dispatcher Command
              </h1>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                108 / 112 NATIONAL GRID
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic dispatch engine &bull; Human supervisor override &bull; Road network optimization
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-700">Available Ambulances: <strong className="text-emerald-700">{vehicles.filter((v) => v.status === 'AVAILABLE').length}</strong></span>
            </div>
            <button
              onClick={refreshData}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-white font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <span>✅</span>
            <span>{actionMsg}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Emergency Incident Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>🚨</span> Live Emergency Queue ({filteredIncidents.length})
              </h2>

              {/* Filter */}
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Urgencies</option>
                <option value="critical">Critical (Trauma/Cardiac)</option>
                <option value="urgent">Urgent</option>
                <option value="routine">Routine</option>
              </select>
            </div>

            {/* Incident List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isCrit = inc.urgency === 'critical';

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-50/80 border-red-300 shadow-xs ring-2 ring-red-200/60'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-slate-600 font-bold">
                        #{inc.id.slice(0, 8)}
                      </span>
                      <span
                        className={`font-black text-[10px] px-2 py-0.5 rounded-full uppercase ${
                          isCrit ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {inc.urgency}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                      "{inc.transcript}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="text-emerald-700 font-mono font-bold">{inc.state}</span>
                      <span>
                        {inc.assignedVehicle
                          ? `🚑 ${inc.assignedVehicle.callSign} (${inc.etaMinutes || 8}m)`
                          : '⚠️ Unassigned'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredIncidents.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active incidents matching the selected filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Incident Details, AI Reasoner, Manual Override & Live Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedIncident ? (
            <>
              {/* Selected Incident Control Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Incident #{selectedIncident.id.slice(0, 8)}
                      </h3>
                      <span className="text-xs font-mono bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 font-bold">
                        {selectedIncident.urgency.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Reported: {new Date(selectedIncident.createdAt).toLocaleTimeString()} &bull; State: <strong className="text-emerald-700">{selectedIncident.state}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectIncident(selectedIncident.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                    >
                      Open Live Telemetry
                    </button>
                    <button
                      onClick={() => handleStateChange('CASE_ESCALATED', 'Escalated by supervisor')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold transition"
                    >
                      ⚠️ Escalate
                    </button>
                  </div>
                </div>

                {/* AI & Clinical Safety Reasoning */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold text-blue-700">🤖 AI + DETERMINISTIC SAFETY REASONING:</span>
                    <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">Confidence: {((selectedIncident.aiInterpretation?.confidence || 0.95) * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {selectedIncident.aiInterpretation?.reasoning_summary || 'Potentially life-threatening acute condition. Deterministic policy enforces ALS priority.'}
                  </p>
                  <div className="text-slate-500 pt-1">
                    Symptoms Detected: <strong className="text-red-700">{selectedIncident.aiInterpretation?.reported_symptoms?.join(', ') || 'Severe trauma'}</strong>
                  </div>
                </div>

                {/* Candidate Vehicles Ranking & Manual Override Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      🏎️ Vehicle Ranking & Manual Override Selection
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Scored by capability, road ETA, and distance
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {candidates.length > 0 ? (
                      candidates.map((c: any) => {
                        const isAssigned = selectedIncident.assignedVehicleId === c.vehicle.id;
                        return (
                          <div
                            key={c.vehicle.id}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                              isAssigned
                                ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{c.vehicle.callSign}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  c.vehicle.capability === 'ALS' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {c.vehicle.capability}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                ETA: <strong className="text-emerald-700">{c.etaMinutes} mins</strong> ({c.distanceKm} km) &bull; Score: <strong className="text-amber-700">{c.score}</strong>
                              </div>
                            </div>

                            <div>
                              {isAssigned ? (
                                <span className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg">
                                  CURRENTLY ASSIGNED
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAssignVehicle(c.vehicle.id)}
                                  disabled={c.vehicle.status !== 'AVAILABLE'}
                                  className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-semibold transition disabled:opacity-40 shadow-xs"
                                >
                                  Assign / Override
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      vehicles.map((v) => (
                        <div
                          key={v.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{v.callSign} ({v.capability})</div>
                            <div className="text-[11px] text-slate-500">Status: {v.status} &bull; Driver: {v.driverName}</div>
                          </div>
                          <button
                            onClick={() => handleAssignVehicle(v.id)}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shadow-xs"
                          >
                            Assign Vehicle
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Dispatcher Actions */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => handleStateChange('DISPATCH_ACCEPTED', 'Manual dispatch accepted by dispatcher')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    Confirm Dispatch Accepted
                  </button>
                  <button
                    onClick={() => handleStateChange('VEHICLE_EN_ROUTE', 'Ambulance is rolling')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    Mark En Route
                  </button>
                  <button
                    onClick={() => handleStateChange('VEHICLE_AT_PICKUP', 'Ambulance at patient scene')}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    Mark At Scene
                  </button>
                  <button
                    onClick={() => handleStateChange('PATIENT_ONBOARD', 'Patient loaded into vehicle')}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    Patient Onboard
                  </button>
                </div>
              </div>

              {/* Live Incident Map */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm">
                <JeevanLiveMap
                  userLocation={selectedIncident.pickupLocation}
                  selectedVehicle={selectedIncident.assignedVehicle}
                  assignedHospital={selectedIncident.assignedHospital}
                  className="h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"
                />
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-500 text-sm shadow-sm">
              Select an incident from the live queue to inspect details and issue dispatch orders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
