import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEncounters } from '../lib/store';
import { api } from '../lib/api';
import type { EncounterRecord, TriageCategory } from '../types';
import { TRIAGE_WARNINGS } from '../types';
import { audioAlert } from '../lib/audioAlert';
import { getHospitalSession, logoutHospital, SUBSCRIPTION_PLANS } from '../lib/hospitalAuth';
import type { HospitalAccount } from '../types';
import { TriageIcon } from '../components/TriageIcon';
import {
  LayoutDashboard,
  Search,
  Volume2,
  VolumeX,
  ChevronRight,
  Clock,
  Building2,
  LogOut,
  PlusCircle,
  CreditCard,
  Siren,
  AlertTriangle,
  Stethoscope,
  EyeOff,
  Activity,
  HeartPulse,
  Radio,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const HospitalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EncounterRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | TriageCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [session, setSession] = useState<HospitalAccount | null>(getHospitalSession());
  const [alarmBlinking, setAlarmBlinking] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Live real-time clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => setSession(getHospitalSession());
    window.addEventListener('hospital_auth_changed', handleAuthChange);
    return () => window.removeEventListener('hospital_auth_changed', handleAuthChange);
  }, []);

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const remote = await api.getEncounters();
        if (isMounted && remote && remote.length > 0) {
          setEncounters(remote);
          
          const hasEmergency = remote.some((e) => e.category === 'RED' && e.status === 'Waiting');
          if (hasEmergency && soundEnabled) {
            setAlarmBlinking(true);
            audioAlert.playSeriousAlarm();
            setTimeout(() => {
              if (isMounted) setAlarmBlinking(false);
            }, 3000);
          }
          return;
        }
      } catch {
        // fallback to local
      }

      const local = getEncounters();
      if (isMounted) {
        setEncounters(local);
        const hasEmergency = local.some((e) => e.category === 'RED' && e.status === 'Waiting');
        if (hasEmergency && soundEnabled) {
          setAlarmBlinking(true);
          audioAlert.playSeriousAlarm();
          setTimeout(() => {
            if (isMounted) setAlarmBlinking(false);
          }, 3000);
        }
      }
    };

    loadData();
    const pollInterval = setInterval(loadData, 15000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioAlert.enableSound(next);
    if (next) {
      setAlarmBlinking(true);
      audioAlert.playSeriousAlarm();
      setTimeout(() => setAlarmBlinking(false), 2000);
    }
  };

  const handleLogout = () => {
    logoutHospital();
    navigate('/login');
  };

  // Metrics computation
  const totalCount = encounters.length;
  const redCount = encounters.filter((e) => e.category === 'RED').length;
  const yellowCount = encounters.filter((e) => e.category === 'YELLOW').length;
  const greenCount = encounters.filter((e) => e.category === 'GREEN').length;
  const blackCount = encounters.filter((e) => e.category === 'BLACK').length;

  const filteredEncounters = encounters.filter((e) => {
    const matchesFilter = selectedFilter === 'ALL' || e.category === selectedFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      e.patientName.toLowerCase().includes(query) ||
      e.uhid.toLowerCase().includes(query) ||
      e.contactNumber.toLowerCase().includes(query) ||
      e.symptoms.selectedSymptoms.some((s) => s.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const activePlanInfo = SUBSCRIPTION_PLANS.find((p) => p.id === session?.activePlan) || SUBSCRIPTION_PLANS[2];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 selection:bg-teal-500/20 selection:text-teal-900 font-sans">
      
      {/* ========================================================= */}
      {/* SLEEK DARK SIDEBAR */}
      {/* ========================================================= */}
      <aside className="w-full md:w-68 lg:w-72 bg-[#091512] text-slate-300 flex flex-col justify-between shrink-0 border-r border-teal-950/80 shadow-2xl z-30">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/95 flex items-center justify-center p-1.5 shadow-md shadow-black/40 transition-transform group-hover:scale-105 shrink-0 ring-1 ring-white/20">
                <img
                  src="/logo_icon.png"
                  alt="MEDITRIAGE AI"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-sans font-bold text-sm tracking-tight text-white block group-hover:text-teal-300 transition-colors">
                  MEDITRIAGE AI
                </span>
                <span className="text-[10px] tracking-wider text-teal-400 font-semibold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Clinical Console
                </span>
              </div>
            </Link>
          </div>

          {/* Hospital Org Banner */}
          {session && (
            <div className="p-4 mx-3.5 my-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-inner text-xs transition-all hover:bg-white/[0.06]">
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-semibold text-white truncate text-xs">
                  {session.hospitalName}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-teal-200/70 pt-1 border-t border-white/[0.06]">
                <span className="font-mono bg-teal-950/80 px-2 py-0.5 rounded text-teal-300 border border-teal-800/60 font-medium text-[10px]">
                  {session.hospitalId}
                </span>
                <span className="text-amber-300 font-semibold text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  {activePlanInfo.durationLabel}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5 text-xs font-medium">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-semibold ${
                selectedFilter === 'ALL'
                  ? 'bg-gradient-to-r from-teal-800 to-teal-700 text-white shadow-md shadow-teal-950/50 border border-teal-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-teal-300" />
                <span>Triage Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                {totalCount}
              </span>
            </button>

            <Link
              to="/assess"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all group"
            >
              <PlusCircle className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              <span>New Patient Intake</span>
            </Link>

            <Link
              to="/staff/subscription"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all group"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Subscription Plans</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/80">
                {activePlanInfo.priceFormatted}
              </span>
            </Link>

            {/* Clinical Telemetry Header */}
            <div className="pt-5 pb-2 px-3 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
                <span>Clinical Telemetry</span>
              </span>
              <span className="text-[9px] text-teal-500 font-mono">LIVE</span>
            </div>

            {/* Red Filter */}
            <button
              onClick={() => setSelectedFilter('RED')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                selectedFilter === 'RED'
                  ? 'bg-rose-950/80 text-white border border-rose-500/60 shadow-md ring-1 ring-rose-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  {redCount > 0 && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  )}
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="font-medium">Red (5–10m)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                {redCount}
              </span>
            </button>

            {/* Yellow Filter */}
            <button
              onClick={() => setSelectedFilter('YELLOW')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                selectedFilter === 'YELLOW'
                  ? 'bg-amber-950/80 text-white border border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="font-medium">Yellow (30m–1h)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold shadow-xs">
                {yellowCount}
              </span>
            </button>

            {/* Green Filter */}
            <button
              onClick={() => setSelectedFilter('GREEN')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                selectedFilter === 'GREEN'
                  ? 'bg-emerald-950/80 text-white border border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="font-medium">Green (2–4h)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                {greenCount}
              </span>
            </button>

            {/* Black Filter */}
            <button
              onClick={() => setSelectedFilter('BLACK')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                selectedFilter === 'BLACK'
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span className="font-medium">Black (Deceased)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-bold">
                {blackCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-white/[0.07] bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 border border-teal-500/40 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
              {session?.staffName.slice(0, 2).toUpperCase() || 'DR'}
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-semibold text-white block truncate">
                {session?.staffName || 'Dr. A. Sharma'}
              </span>
              <span className="text-[10px] text-teal-300/80 block truncate">
                {session?.staffRole || 'Chief Triage Officer'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of hospital console"
            className="text-slate-400 hover:text-rose-300 p-2 rounded-xl hover:bg-white/[0.05] transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CLINICAL CONTENT WORKSTATION */}
      {/* ========================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* ========================================================= */}
        {/* EMERGENCY TELEMETRY BROADCAST BAR (Active when RED > 0) */}
        {/* ========================================================= */}
        {redCount > 0 ? (
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/95 via-rose-900/90 to-[#1e070a]/95 border border-rose-500/40 p-4 sm:p-5 shadow-xl text-white mb-6 backdrop-blur-md transition-all ${
            alarmBlinking ? 'ring-4 ring-rose-500/30' : ''
          }`}>
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-full bg-rose-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center shrink-0 shadow-inner">
                  <Siren className="w-6 h-6 text-rose-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      CRITICAL TRIAGE ALERT
                    </span>
                    <span className="text-xs text-rose-200/90 font-medium">
                      Treatment window: 5–10 mins
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {redCount} Patient{redCount > 1 ? 's' : ''} in High-Acuity Emergency Resuscitation Bay
                  </h3>
                  <p className="text-xs text-rose-200/80 mt-0.5">
                    Physician intervention required immediately. Audio telemetry active across connected hospital consoles.
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('RED')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-all"
                >
                  Filter Red Queue
                </button>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                    soundEnabled
                      ? 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-400'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span>Siren Active</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-slate-300" />
                      <span>Siren Muted</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-emerald-950/70 border border-emerald-500/30 p-3.5 sm:p-4 text-white mb-6 flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-emerald-100">
                All high-acuity resuscitation bays clear. Triage queue operating within normal parameters.
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
              Status: Nominal
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TOP WORKSTATION HEADER */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
                Hospital Triage Queue
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Dispatch Live</span>
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
              <span>
                Active Facility: <strong className="text-slate-800">{session?.hospitalName || 'Metro City General Hospital'}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                ID: <code className="font-mono text-teal-800 font-semibold">{session?.hospitalId || 'HOSP-METRO-01'}</code>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600 font-mono">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/assess"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3B36] hover:bg-[#072623] text-white text-xs font-semibold shadow-apple hover:shadow-apple-hover transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>New Patient Intake</span>
            </Link>

            <Link
              to="/staff/subscription"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-subtle transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>{activePlanInfo.durationLabel} Plan</span>
            </Link>

            <button
              type="button"
              onClick={toggleSound}
              className={`p-2.5 rounded-full border text-xs font-medium transition-all ${
                soundEnabled
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
              title={soundEnabled ? 'Mute audible alarms' : 'Enable audible alarms'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4 INTERACTIVE TRIAGE KPI CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          
          {/* Card 1: Red */}
          <div
            onClick={() => setSelectedFilter('RED')}
            className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 ${
              selectedFilter === 'RED'
                ? 'bg-rose-50/90 border-rose-500 shadow-lg ring-2 ring-rose-400/40 -translate-y-0.5'
                : 'bg-white hover:bg-rose-50/40 border-slate-200/90 hover:border-rose-300 shadow-subtle hover:shadow-apple'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                <Siren className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100/80 border border-rose-300/80 px-2.5 py-0.5 rounded-full">
                5–10 MINS
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-serif text-4xl font-bold text-rose-950 tracking-tight">
                {redCount}
              </span>
              <span className="text-xs font-semibold text-rose-600">
                Critical
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900 group-hover:text-rose-900 transition-colors">
              Immediate Resuscitation
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>High-acuity trauma bay</span>
            </div>
          </div>

          {/* Card 2: Yellow */}
          <div
            onClick={() => setSelectedFilter('YELLOW')}
            className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 ${
              selectedFilter === 'YELLOW'
                ? 'bg-amber-50/90 border-amber-500 shadow-lg ring-2 ring-amber-400/40 -translate-y-0.5'
                : 'bg-white hover:bg-amber-50/40 border-slate-200/90 hover:border-amber-300 shadow-subtle hover:shadow-apple'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/80 border border-amber-300/80 px-2.5 py-0.5 rounded-full">
                30–60 MINS
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-serif text-4xl font-bold text-amber-950 tracking-tight">
                {yellowCount}
              </span>
              <span className="text-xs font-semibold text-amber-600">
                Urgent
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
              Urgent Examination
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Physician assessment window</span>
            </div>
          </div>

          {/* Card 3: Green */}
          <div
            onClick={() => setSelectedFilter('GREEN')}
            className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 ${
              selectedFilter === 'GREEN'
                ? 'bg-emerald-50/90 border-emerald-500 shadow-lg ring-2 ring-emerald-400/40 -translate-y-0.5'
                : 'bg-white hover:bg-emerald-50/40 border-slate-200/90 hover:border-emerald-300 shadow-subtle hover:shadow-apple'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-300/80 px-2.5 py-0.5 rounded-full">
                2–4 HOURS
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-serif text-4xl font-bold text-emerald-950 tracking-tight">
                {greenCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                Standard
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
              Standard Consultation
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Outpatient routine queue</span>
            </div>
          </div>

          {/* Card 4: Black */}
          <div
            onClick={() => setSelectedFilter('BLACK')}
            className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 ${
              selectedFilter === 'BLACK'
                ? 'bg-slate-100 border-slate-700 shadow-lg ring-2 ring-slate-400/40 -translate-y-0.5'
                : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-400 shadow-subtle hover:shadow-apple'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200/70 border border-slate-300 text-slate-700 flex items-center justify-center font-bold">
                <EyeOff className="w-5 h-5 text-slate-700" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-200/80 border border-slate-300 px-2.5 py-0.5 rounded-full">
                EXPECTANT
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-serif text-4xl font-bold text-slate-900 tracking-tight">
                {blackCount}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Protocol
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900">
              Expectant / Deceased
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span>Confirmed clinical record</span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* FILTER BAR AND SEARCH INPUT */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-apple mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedFilter === 'ALL'
                    ? 'bg-[#0B3B36] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All Patients ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('RED')}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedFilter === 'RED'
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                <span>Red 5–10m ({redCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('YELLOW')}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedFilter === 'YELLOW'
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span>Yellow 30m–1h ({yellowCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('GREEN')}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedFilter === 'GREEN'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Green 2–4h ({greenCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('BLACK')}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedFilter === 'BLACK'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0"></span>
                <span>Black ({blackCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px] sm:min-w-[320px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search UHID, patient name, symptoms..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* PATIENT QUEUE TABLE (POLISHED CLINICAL GRID) */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-apple overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">UHID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Age / Sex</th>
                  <th className="py-3.5 px-4">Symptoms & Chief Complaint</th>
                  <th className="py-3.5 px-4">Triage Priority</th>
                  <th className="py-3.5 px-4">Wait Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEncounters.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Activity className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600">No matching patients in queue</span>
                        <span className="text-xs text-slate-400">Try adjusting your category filter or search terms.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEncounters.map((enc, idx) => {
                    const warn = TRIAGE_WARNINGS[enc.category] || TRIAGE_WARNINGS.GREEN;
                    const isRedItem = enc.category === 'RED';
                    const hasVitals = enc.vitals && (enc.vitals.oxygenSaturation || enc.vitals.systolicBp);

                    return (
                      <tr
                        key={enc.id}
                        onClick={() => navigate(`/staff/encounter/${enc.id}`)}
                        className={`relative group cursor-pointer transition-all duration-150 ${
                          isRedItem && enc.status === 'Waiting'
                            ? 'bg-rose-50/40 hover:bg-rose-50/70 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-rose-500 before:rounded-r'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-4 px-4 font-mono text-slate-400 text-xs">
                          {idx + 1}
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {enc.uhid}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B3B36] to-[#124e47] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {enc.patientName.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 group-hover:text-teal-900 block text-xs">
                                {enc.patientName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {enc.contactNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600">
                          <span className="font-medium">{enc.age}y</span>
                          <span className="text-slate-300 mx-1">•</span>
                          <span>{enc.gender}</span>
                        </td>

                        <td className="py-4 px-4 max-w-sm">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {enc.symptoms.selectedSymptoms.slice(0, 3).map((sym, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80"
                              >
                                {sym}
                              </span>
                            ))}
                            {enc.symptoms.selectedSymptoms.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{enc.symptoms.selectedSymptoms.length - 3} more
                              </span>
                            )}
                            {hasVitals && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                                <HeartPulse className="w-3 h-3 text-teal-700" />
                                {enc.vitals.oxygenSaturation ? `SpO2: ${enc.vitals.oxygenSaturation}%` : ''}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${warn.badgeBorderClass}`}>
                            <TriageIcon category={enc.category} size="xs" badge={false} />
                            <span>{warn.code}</span>
                            <span className="opacity-40">•</span>
                            <span>{warn.treatmentWindow}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-600">
                          <span className={`inline-flex items-center gap-1 font-medium ${
                            isRedItem && enc.waitTimeMinutes > 10 ? 'text-rose-600 font-bold' : ''
                          }`}>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{enc.waitTimeMinutes}m wait</span>
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            enc.status === 'Waiting'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : enc.status === 'In Consult'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : enc.status === 'Being Seen'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              enc.status === 'Waiting' ? 'bg-amber-500 animate-pulse' : 'bg-current'
                            }`}></span>
                            <span>{enc.status}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/staff/encounter/${enc.id}`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 hover:text-white hover:bg-[#0B3B36] transition-all group-hover:shadow-xs"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Status */}
          <div className="p-3.5 px-5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filteredEncounters.length}</strong> of <strong>{totalCount}</strong> active patients
            </span>
            <span className="font-mono text-[11px] text-teal-800">
              Auto-refresh: 15s • Sound Telemetry: {soundEnabled ? 'Enabled' : 'Muted'}
            </span>
          </div>
        </div>

      </main>
    </div>
  );
};
