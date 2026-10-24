import React, { useState, useEffect } from 'react';
import { jeevanApi } from '../lib/jeevanApi';
import type { Hospital, Vehicle } from '../types/jeevan';

export const AdminPortalPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const loadData = async () => {
    try {
      const [statsRes, vehRes, hospRes] = await Promise.all([
        jeevanApi.getAdminStats(),
        jeevanApi.getVehicles(),
        jeevanApi.getHospitals(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (vehRes.success) setVehicles(vehRes.vehicles);
      if (hospRes.success) setHospitals(hospRes.hospitals);
    } catch (err: any) {
      console.error('Admin data fetch error:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 font-sans">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl shadow-2xs">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  108 National Emergency System Administration
                </h1>
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                  CENTRAL GRID ROOT
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Verified Fleet Registry &bull; Hospital Resource Network &bull; Deterministic Policy Controls
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-white font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <span>🔄</span> Sync Grid
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {/* Key System Statistics */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">TOTAL INCIDENTS</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalIncidents}</div>
            </div>
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">ACTIVE EMERGENCIES</div>
              <div className="text-2xl font-black text-red-600 mt-1">{stats.activeEmergencies}</div>
            </div>
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">ONLINE AMBULANCES</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{stats.availableAmbulances} / {stats.totalVehicles}</div>
            </div>
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">CONNECTED HOSPITALS</div>
              <div className="text-2xl font-black text-blue-700 mt-1">{stats.hospitalsConnected}</div>
            </div>
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">AVAILABLE RESUS BAYS</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{stats.availableTraumaBays}</div>
            </div>
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">AI SAFETY STATUS</div>
              <div className="text-xs font-mono font-bold text-indigo-700 mt-1 truncate">
                {stats.geminiAiStatus}
              </div>
            </div>
          </div>
        )}

        {/* Verified Fleet Management */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🚑</span> Verified Emergency & Medical Fleet Registry
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Strict Availability Rule: Offline without valid telemetry heartbeat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono border-b border-slate-200">
                <tr>
                  <th className="p-3">Call Sign</th>
                  <th className="p-3">Registration</th>
                  <th className="p-3">Capability</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Driver Phone</th>
                  <th className="p-3">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 font-mono">{v.callSign}</td>
                    <td className="p-3 text-slate-600 font-mono">{v.registrationNumber}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        v.capability === 'ALS' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {v.capability}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-700">{v.status}</td>
                    <td className="p-3 text-slate-700">{v.driverName}</td>
                    <td className="p-3 font-mono text-slate-600">{v.driverPhone}</td>
                    <td className="p-3 text-[10px] text-slate-400 font-mono">
                      {new Date(v.lastUpdated).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connected Government Hospitals Directory */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>🏥</span> Verified Government Apex Facilities & Beds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map((h) => (
              <div key={h.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{h.name}</h3>
                    <p className="text-slate-500 text-[11px]">{h.location.address}</p>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {h.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center">
                    <div className="text-slate-500 text-[10px] font-semibold">Trauma Bays</div>
                    <div className="text-base font-black text-red-600 mt-0.5">{h.traumaBaysAvailable}</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center">
                    <div className="text-slate-500 text-[10px] font-semibold">Open Beds</div>
                    <div className="text-base font-black text-emerald-700 mt-0.5">{h.availableBeds} / {h.totalBeds}</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center">
                    <div className="text-slate-500 text-[10px] font-semibold">Helpline</div>
                    <div className="text-xs font-mono font-bold text-blue-700 mt-1">{h.phone}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
