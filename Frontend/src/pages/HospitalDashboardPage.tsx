import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEncounters } from '../lib/store';
import type { EncounterRecord, TriageCategory } from '../types';
import { audioAlert } from '../lib/audioAlert';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileSpreadsheet,
  Bell,
  BarChart3,
  Stethoscope,
  Settings,
  Search,
  Volume2,
  VolumeX,
  ChevronRight,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Calendar,
  LogOut
} from 'lucide-react';

export const HospitalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EncounterRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | TriageCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const data = getEncounters();
    setEncounters(data);

    // If there is any unacknowledged Red patient, check sound
    const hasEmergency = data.some((e) => e.category === 'RED' && e.status === 'Waiting');
    if (hasEmergency && soundEnabled) {
      audioAlert.playCriticalChime();
    }
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioAlert.enableSound(next);
    if (next) audioAlert.playCriticalChime();
  };

  // Metrics computation
  const totalCount = encounters.length;
  const redCount = encounters.filter((e) => e.category === 'RED').length;
  const yellowCount = encounters.filter((e) => e.category === 'YELLOW').length;
  const greenCount = encounters.filter((e) => e.category === 'GREEN').length;
  const blackCount = encounters.filter((e) => e.category === 'BLACK').length;
  const inConsultCount = encounters.filter((e) => e.status === 'In Consult' || e.status === 'Being Seen').length;

  const filteredEncounters = encounters.filter((e) => {
    const matchesFilter = selectedFilter === 'ALL' || e.category === selectedFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      e.patientName.toLowerCase().includes(query) ||
      e.uhid.toLowerCase().includes(query) ||
      e.contactNumber.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col md:flex-row text-charcoal-900 selection:bg-forest-100 selection:text-forest-900">
      {/* Dark Sidebar (Matches Screen 08 Left Pane) */}
      <aside className="w-full md:w-64 bg-[#0E1E1A] text-ivory-200 flex flex-col justify-between shrink-0 border-r border-[#182F2A]">
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-[#1A332E] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-ivory-100 font-bold">
                M
              </div>
              <div>
                <span className="font-sans font-bold text-sm tracking-tight text-white block">
                  MEDITRIAGE AI
                </span>
                <span className="text-[9px] uppercase tracking-wider text-teal-300/70 font-medium">
                  Staff Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5 text-xs font-medium">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-forest-800/80 text-white font-semibold transition-all shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-300" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setSelectedFilter('ALL')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ivory-300 hover:text-white hover:bg-forest-900/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Patient Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-triage-red text-white text-[10px] font-bold">
                {redCount}
              </span>
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold tracking-wider text-charcoal-500">
              Clinical Modules
            </div>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ivory-300 hover:text-white hover:bg-forest-900/40 transition-colors">
              <UserCheck className="w-4 h-4" />
              <span>Patients</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ivory-300 hover:text-white hover:bg-forest-900/40 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Medical Records</span>
            </button>

            <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-ivory-300 hover:text-white hover:bg-forest-900/40 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </div>
              {redCount > 0 && <span className="w-2 h-2 rounded-full bg-triage-red animate-ping" />}
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ivory-300 hover:text-white hover:bg-forest-900/40 transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ivory-300 hover:text-white hover:bg-forest-900/40 transition-colors">
              <Stethoscope className="w-4 h-4" />
              <span>Staff</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ivory-300 hover:text-white hover:bg-forest-900/40 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-[#1A332E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-forest-700/60 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-white">
              DA
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-white block">Dr. A. Sharma</span>
              <span className="text-[10px] text-teal-300/70">City General Hospital</span>
            </div>
          </div>
          <Link to="/" title="Exit to Public View" className="text-charcoal-400 hover:text-white p-1">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-medium text-charcoal-900">
              Hospital Dashboard
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Live overview of patient registrations and triage status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-charcoal-200 text-xs font-medium text-charcoal-700 shadow-subtle">
              <Building2 className="w-3.5 h-3.5 text-forest-800" />
              <span>City General Hospital</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-charcoal-200 text-xs font-medium text-charcoal-500 shadow-subtle">
              <Calendar className="w-3.5 h-3.5" />
              <span>23 Oct 2026, 03:18 PM</span>
            </div>

            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? 'bg-forest-50 border-forest-200 text-forest-900'
                  : 'bg-white border-charcoal-200 text-charcoal-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4 Metric Cards (Matching Screen 08) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Patients */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
              Total Patients
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-charcoal-900">{totalCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +12% from yesterday
              </span>
            </div>
          </div>

          {/* Card 2: Urgent Cases */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
              Urgent
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-charcoal-900">{redCount + yellowCount}</span>
              <span className="text-[11px] font-semibold text-triage-red bg-triage-red-light px-2 py-0.5 rounded-full">
                Requires attention
              </span>
            </div>
          </div>

          {/* Card 3: Avg Wait Time */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
              Avg. Wait Time
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-charcoal-900">28 min</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> -18% from yesterday
              </span>
            </div>
          </div>

          {/* Card 4: In Consultation */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
              In Consultation
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-charcoal-900">{inConsultCount}</span>
              <span className="text-[11px] font-medium text-charcoal-500">
                Currently with doctors
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl p-4 sm:p-5 shadow-apple mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedFilter === 'ALL'
                    ? 'bg-forest-800 text-ivory-100 shadow-sm'
                    : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
                }`}
              >
                All ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('RED')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedFilter === 'RED'
                    ? 'bg-triage-red text-white shadow-sm'
                    : 'bg-triage-red-light text-triage-red hover:bg-red-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>Red ({redCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('YELLOW')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedFilter === 'YELLOW'
                    ? 'bg-triage-yellow text-white shadow-sm'
                    : 'bg-triage-yellow-light text-amber-700 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>Yellow ({yellowCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('GREEN')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedFilter === 'GREEN'
                    ? 'bg-triage-green text-white shadow-sm'
                    : 'bg-triage-green-light text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>Green ({greenCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('BLACK')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedFilter === 'BLACK'
                    ? 'bg-triage-black text-white shadow-sm'
                    : 'bg-triage-black-light text-charcoal-700 hover:bg-charcoal-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>Black ({blackCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, UHID or Phone..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-charcoal-200 bg-ivory-50 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
            </div>
          </div>
        </div>

        {/* Patient Queue Table (Matching Screen 08) */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl shadow-apple overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-ivory-50 border-b border-charcoal-200 text-charcoal-500 font-bold tracking-wide uppercase text-[10px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">UHID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Presenting Symptoms</th>
                  <th className="py-3 px-4">Triage</th>
                  <th className="py-3 px-4">Wait Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredEncounters.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-charcoal-400">
                      No patient encounters match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredEncounters.map((enc, idx) => {
                    const isRedItem = enc.category === 'RED';
                    const isYellowItem = enc.category === 'YELLOW';
                    const isGreenItem = enc.category === 'GREEN';

                    return (
                      <tr
                        key={enc.id}
                        onClick={() => navigate(`/staff/encounter/${enc.id}`)}
                        className={`hover:bg-ivory-100/80 cursor-pointer transition-colors ${
                          isRedItem && enc.status === 'Waiting' ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-charcoal-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-charcoal-800">
                          {enc.uhid}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                          {enc.patientName}
                        </td>
                        <td className="py-3.5 px-4 text-charcoal-600">{enc.age}</td>
                        <td className="py-3.5 px-4 text-charcoal-600">
                          {enc.gender.charAt(0)}
                        </td>
                        <td className="py-3.5 px-4 text-charcoal-700 max-w-xs truncate">
                          {enc.symptoms.selectedSymptoms.join(', ')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isRedItem
                                ? 'bg-triage-red-light text-triage-red'
                                : isYellowItem
                                ? 'bg-triage-yellow-light text-amber-700'
                                : isGreenItem
                                ? 'bg-triage-green-light text-emerald-800'
                                : 'bg-triage-black-light text-charcoal-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{enc.triageLabel}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-charcoal-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          <span>{enc.waitTimeMinutes} min</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-semibold ${
                              enc.status === 'Waiting'
                                ? 'text-amber-700'
                                : enc.status === 'In Consult' || enc.status === 'Being Seen'
                                ? 'text-forest-700'
                                : 'text-charcoal-500'
                            }`}
                          >
                            {enc.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <ChevronRight className="w-4 h-4 text-charcoal-400 inline-block" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="py-3 px-4 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-400 bg-ivory-50">
            <span>Showing {filteredEncounters.length} patients</span>
            <span>Hospital Triage Protocol v1.4 • Live Active Queue</span>
          </div>
        </div>
      </main>
    </div>
  );
};
