import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEncounters } from '../lib/store';
import { api } from '../lib/api';
import type { EncounterRecord, TriageCategory } from '../types';
import { audioAlert } from '../lib/audioAlert';
import { getHospitalSession, logoutHospital } from '../lib/hospitalAuth';
import type { HospitalAccount } from '../types';
import {
  LayoutDashboard,
  Search,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  LogOut,
  PlusCircle,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  UserCheck,
  Settings
} from 'lucide-react';

interface Screen7Patient {
  id: string;
  patientId: string;
  name: string;
  ageGender: string;
  triageLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Deceased';
  triageColor: 'red' | 'coral' | 'yellow' | 'green' | 'slate';
  arrivalTime: string;
  status: 'In Review' | 'Waiting' | 'Completed';
  category: TriageCategory;
}

export const HospitalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EncounterRecord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [session, setSession] = useState<HospitalAccount | null>(getHospitalSession());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'queue' | 'patients' | 'reports' | 'staff' | 'settings'>('dashboard');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // Fallback demo session if direct access
  useEffect(() => {
    const s = getHospitalSession();
    if (!s) {
      // create default session so dashboard displays cleanly
      const demoSession: HospitalAccount = {
        hospitalId: 'HOSP-METRO-01',
        hospitalName: 'City General Hospital',
        city: 'Dehradun',
        department: 'Emergency Department',
        staffId: 'dr.sharma@cityhospital.org',
        staffName: 'Dr. Sharma',
        staffRole: 'Administrator',
        activePlan: 'MONTHLY',
        planValidUntil: '2026-11-30',
        isAuthenticated: true
      };
      setSession(demoSession);
    } else {
      setSession(s);
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = () => setSession(getHospitalSession());
    window.addEventListener('hospital_auth_changed', handleAuthChange);
    return () => window.removeEventListener('hospital_auth_changed', handleAuthChange);
  }, []);

  // Baseline data matching Screen 7
  const defaultScreen7Queue: Screen7Patient[] = [
    {
      id: 'pt-1',
      patientId: 'PT-0001',
      name: 'Ramesh Kumar',
      ageGender: '56 / M',
      triageLevel: 'Critical',
      triageColor: 'red',
      arrivalTime: '10:24 AM',
      status: 'In Review',
      category: 'RED'
    },
    {
      id: 'pt-2',
      patientId: 'PT-0002',
      name: 'Sita Devi',
      ageGender: '42 / F',
      triageLevel: 'High',
      triageColor: 'coral',
      arrivalTime: '10:28 AM',
      status: 'Waiting',
      category: 'RED'
    },
    {
      id: 'pt-3',
      patientId: 'PT-0003',
      name: 'Arjun Singh',
      ageGender: '28 / M',
      triageLevel: 'Medium',
      triageColor: 'yellow',
      arrivalTime: '10:32 AM',
      status: 'Waiting',
      category: 'YELLOW'
    },
    {
      id: 'pt-4',
      patientId: 'PT-0004',
      name: 'Meera Joshi',
      ageGender: '65 / F',
      triageLevel: 'High',
      triageColor: 'coral',
      arrivalTime: '10:36 AM',
      status: 'In Review',
      category: 'RED'
    },
    {
      id: 'pt-5',
      patientId: 'PT-0005',
      name: 'Vikram Patel',
      ageGender: '34 / M',
      triageLevel: 'Low',
      triageColor: 'green',
      arrivalTime: '10:40 AM',
      status: 'Waiting',
      category: 'GREEN'
    }
  ];

  // Load backend encounters if any
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const remote = await api.getEncounters();
        if (isMounted && remote && remote.length > 0) {
          setEncounters(remote);
          return;
        }
      } catch {
        // quiet
      }
      const local = getEncounters();
      if (isMounted && local && local.length > 0) {
        setEncounters(local);
      }
    };
    loadData();
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioAlert.enableSound(next);
    if (next) {
      audioAlert.playSeriousAlarm();
    }
  };

  const handleLogout = () => {
    logoutHospital();
    navigate('/login');
  };

  // Convert encounters or default queue
  const displayQueue: Screen7Patient[] = defaultScreen7Queue.map((item, index) => {
    // If we have actual registered encounter, overlay
    if (encounters[index]) {
      const e = encounters[index];
      return {
        id: e.id,
        patientId: e.encounterNumber || item.patientId,
        name: e.patientName,
        ageGender: `${e.age} / ${e.gender.charAt(0)}`,
        triageLevel: e.category === 'RED' ? 'Critical' : e.category === 'YELLOW' ? 'High' : 'Low',
        triageColor: e.category === 'RED' ? 'red' : e.category === 'YELLOW' ? 'yellow' : 'green',
        arrivalTime: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: e.status === 'In Consult' ? 'In Review' : 'Waiting',
        category: e.category
      };
    }
    return item;
  });

  const filteredQueue = displayQueue.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevelFilter === 'ALL' ||
      p.triageLevel.toLowerCase() === selectedLevelFilter.toLowerCase();
    return matchesSearch && matchesLevel;
  });

  // Numbers from Screen 7: Total 42, Critical 8, Under Review 12, Stable 22
  const kpiTotal = 42;
  const kpiCritical = 8;
  const kpiReview = 12;
  const kpiStable = 22;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 font-sans selection:bg-teal-500/15 selection:text-teal-900">
      
      {/* ========================================================= */}
      {/* SIDEBAR: Exact layout matching Screen 7                   */}
      {/* ========================================================= */}
      <aside className="w-full md:w-64 bg-[#0B2E2B] text-slate-300 flex flex-col justify-between shrink-0 shadow-xl z-30 select-none">
        <div>
          
          {/* Logo Header */}
          <div className="p-6 border-b border-teal-800/40 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                <img
                  src="/logo_icon.png"
                  alt="MEDITRIAGE AI"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-white text-sm tracking-tight block">
                  MEDITRIAGE AI
                </span>
                <span className="text-[10px] text-teal-300">
                  Right Care, Right Time
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items from Screen 7 */}
          <nav className="p-4 space-y-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold ${
                activeTab === 'dashboard'
                  ? 'bg-teal-700/70 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-teal-900/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-teal-300" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'queue'
                  ? 'bg-teal-700/70 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-teal-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-teal-300" />
                <span>Patient Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-200">
                {kpiTotal}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'patients'
                  ? 'bg-teal-700/70 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-teal-900/50'
              }`}
            >
              <Users className="w-4 h-4 text-teal-300" />
              <span>Patients</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'reports'
                  ? 'bg-teal-700/70 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-teal-900/50'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-300" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'staff'
                  ? 'bg-teal-700/70 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-teal-900/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-300" />
              <span>Staff</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-teal-700/70 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-teal-900/50'
              }`}
            >
              <Settings className="w-4 h-4 text-teal-300" />
              <span>Settings</span>
            </button>

            <div className="pt-4 border-t border-teal-800/40">
              <Link
                to="/assess"
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-teal-800/60 hover:bg-teal-800 text-teal-100 text-xs font-semibold transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-teal-300" />
                <span>New Patient Intake</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom User Card from Screen 7 */}
        <div className="p-4 border-t border-teal-800/40 bg-teal-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-700 border border-teal-400/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {session?.staffName ? session.staffName.slice(0, 2).toUpperCase() : 'DR'}
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-semibold text-white block truncate">
                {session?.staffName || 'Dr. Sharma'}
              </span>
              <span className="text-[10px] text-teal-300/80 block truncate">
                {session?.staffRole || 'Administrator'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-teal-300 hover:text-rose-300 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA: Exact layout matching Screen 7         */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar from Screen 7 */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Workstation:
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Emergency & Triage Wing
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute alert siren' : 'Enable alert siren'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-teal-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* Hospital Name & ID from Screen 7 */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {session?.hospitalName || 'City General Hospital'}
                </span>
                <span className="text-[10px] font-mono text-teal-800 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  {session?.hospitalId || 'HOSP-METRO-01'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                🏛️
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          
          {/* Header Title from Screen 7 */}
          <div>
            <h1 className="font-serif text-3xl font-normal text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live overview of your hospital's triage and patient flow.
            </p>
          </div>

          {/* ======================================================= */}
          {/* 4 KPI METRIC CARDS from Screen 7                         */}
          {/* ======================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Patients */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Total Patients
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {kpiTotal}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Critical */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Critical
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-red-600 tracking-tight">
                  {kpiCritical}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Under Review */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Under Review
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
                  {kpiReview}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Stable */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Stable
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
                  {kpiStable}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* ======================================================= */}
          {/* PATIENT QUEUE TABLE from Screen 7                        */}
          {/* ======================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Table Header Row */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-base text-slate-900">
                  Patient Queue
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-medium">
                  {filteredQueue.length} Active
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLevelFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-teal-800 hover:text-teal-950 transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBFB] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Patient ID</th>
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Age / Gender</th>
                    <th className="py-3 px-5">Triage Level</th>
                    <th className="py-3 px-5">Arrival Time</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredQueue.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => navigate(`/staff/encounter/${row.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Patient ID */}
                      <td className="py-3.5 px-5 font-mono font-medium text-slate-900 group-hover:text-teal-800">
                        {row.patientId}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {row.name}
                      </td>

                      {/* Age / Gender */}
                      <td className="py-3.5 px-5 text-slate-600">
                        {row.ageGender}
                      </td>

                      {/* Triage Level Pill */}
                      <td className="py-3.5 px-5">
                        {row.triageLevel === 'Critical' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                            Critical
                          </span>
                        )}
                        {row.triageLevel === 'High' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            High
                          </span>
                        )}
                        {row.triageLevel === 'Medium' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                            Medium
                          </span>
                        )}
                        {row.triageLevel === 'Low' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Low
                          </span>
                        )}
                      </td>

                      {/* Arrival Time */}
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                        {row.arrivalTime}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-5">
                        {row.status === 'In Review' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
                            In Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            Waiting
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
