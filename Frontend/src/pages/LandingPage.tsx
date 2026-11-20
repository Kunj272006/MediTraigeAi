import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { audioAlert } from '../lib/audioAlert';
import { type HospitalAccount } from '../types';
import { getHospitalSession } from '../lib/hospitalAuth';
import { jeevanApi } from '../lib/jeevanApi';
import type { Hospital } from '../types/jeevan';
import {
  ArrowRight,
  Volume2,
  Stethoscope,
  Siren,
  Activity,
  Building2,
  Phone,
  MapPin,
  Search,
  Mic,
  CheckCircle2,
  ShieldCheck,
  Navigation
} from 'lucide-react';

const FALLBACK_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-AIIMS-01',
    name: 'AIIMS Apex Trauma Center',
    category: 'AIIMS_APEX',
    location: { lat: 28.5672, lng: 77.2065, address: 'Ring Road, Raj Nagar, Safdarjung Enclave, New Delhi', landmark: 'Gate No. 2' },
    phone: '011-26588500',
    emergencyDepartmentOpen: true,
    totalBeds: 260,
    availableBeds: 12,
    traumaBaysAvailable: 4,
    oxygenAvailable: true,
    departments: [
      { name: 'Emergency Medicine', availableDoctors: 6, opdOpen: true },
      { name: 'Trauma Surgery', availableDoctors: 4, opdOpen: true },
      { name: 'Cardiology', availableDoctors: 3, opdOpen: true }
    ]
  },
  {
    id: 'HOSP-SAFDARJUNG-02',
    name: 'Safdarjung Government Hospital',
    category: 'DISTRICT_HOSPITAL',
    location: { lat: 28.5701, lng: 77.2081, address: 'Ansari Nagar West, Ring Road, New Delhi', landmark: 'Opposite AIIMS' },
    phone: '011-26165060',
    emergencyDepartmentOpen: true,
    totalBeds: 1550,
    availableBeds: 18,
    traumaBaysAvailable: 5,
    oxygenAvailable: true,
    departments: [
      { name: 'Emergency & Casualty', availableDoctors: 8, opdOpen: true },
      { name: 'General Medicine', availableDoctors: 5, opdOpen: true }
    ]
  },
  {
    id: 'HOSP-RML-03',
    name: 'Dr. Ram Manohar Lohia Hospital',
    category: 'DISTRICT_HOSPITAL',
    location: { lat: 28.6247, lng: 77.2008, address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi', landmark: 'Near GPO' },
    phone: '011-23365525',
    emergencyDepartmentOpen: true,
    totalBeds: 1400,
    availableBeds: 14,
    traumaBaysAvailable: 3,
    oxygenAvailable: true,
    departments: [
      { name: 'Emergency Medicine', availableDoctors: 5, opdOpen: true },
      { name: 'Pulmonology', availableDoctors: 3, opdOpen: true }
    ]
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [alarmActive, setAlarmActive] = useState(false);
  const [session, setSession] = useState<HospitalAccount | null>(getHospitalSession());
  const [hospitals, setHospitals] = useState<Hospital[]>(FALLBACK_HOSPITALS);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState<'ALL' | 'EMERGENCY_OPEN' | 'TRAUMA_BAY'>('ALL');

  // Hero Voice State (Phase 4 requirement: Clearly accessible voice-input option)
  const [heroVoiceStatus, setHeroVoiceStatus] = useState<
    'idle' | 'permission_requested' | 'recording' | 'processing' | 'transcription_available' | 'error_retry'
  >('idle');
  const [heroTranscript, setHeroTranscript] = useState('');
  const [heroVoiceError, setHeroVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleAuthChange = () => setSession(getHospitalSession());
    window.addEventListener('hospital_auth_changed', handleAuthChange);
    return () => window.removeEventListener('hospital_auth_changed', handleAuthChange);
  }, []);

  // Fetch live hospitals from backend API if available
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const res = await jeevanApi.getHospitals();
        if (res && res.success && res.hospitals && res.hospitals.length > 0) {
          setHospitals(res.hospitals);
        }
      } catch {
        // Fallback already pre-seeded
      }
    };
    loadHospitals();
  }, []);

  const handleTestSoundAlert = () => {
    setAlarmActive(true);
    audioAlert.playSeriousAlarm();
    setTimeout(() => setAlarmActive(false), 2400);
  };

  // Hero Speech Recognition
  const startHeroVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHeroVoiceStatus('error_retry');
      setHeroVoiceError('Voice dictation is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      setHeroVoiceStatus('permission_requested');
      setHeroVoiceError(null);

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setHeroVoiceStatus('recording');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setHeroTranscript(transcript);
        if (event.results[0]?.isFinal) {
          setHeroVoiceStatus('transcription_available');
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setHeroVoiceError('Microphone permission denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          setHeroVoiceError('No speech detected. Please tap retry and speak clearly.');
        } else {
          setHeroVoiceError(`Microphone notice: ${event.error}`);
        }
        setHeroVoiceStatus('error_retry');
      };

      recognition.onend = () => {
        setHeroVoiceStatus((prev) => (prev === 'recording' ? 'transcription_available' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setHeroVoiceStatus('error_retry');
      setHeroVoiceError(e?.message || 'Unable to start microphone.');
    }
  };

  const stopHeroVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setHeroVoiceStatus('transcription_available');
  };

  const proceedWithHeroTranscript = () => {
    if (heroTranscript.trim()) {
      // Store in session storage for Assessment page prefill
      sessionStorage.setItem('meditriage_hero_symptoms', heroTranscript.trim());
    }
    navigate('/assess');
  };

  // Hospital directory filtering
  const filteredHospitals = hospitals.filter((h) => {
    const matchesQuery =
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      (h.location?.address && h.location.address.toLowerCase().includes(hospitalSearch.toLowerCase())) ||
      (h.departments && h.departments.some((d) => d.name.toLowerCase().includes(hospitalSearch.toLowerCase())));

    if (!matchesQuery) return false;
    if (hospitalFilter === 'EMERGENCY_OPEN' && !h.emergencyDepartmentOpen) return false;
    if (hospitalFilter === 'TRAUMA_BAY' && (!h.traumaBaysAvailable || h.traumaBaysAvailable <= 0)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900 font-sans text-charcoal-900">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================= */}
        {/* 1. EMERGENCY FAST-ACCESS NOTICE                           */}
        {/* ========================================================= */}
        <aside aria-label="Urgent Medical Action" className="w-full bg-ivory-200 border-b border-charcoal-200 text-charcoal-800 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-triage-red shrink-0" />
              <span className="font-semibold text-charcoal-900">Life-Threatening Emergency?</span>
              <span className="text-charcoal-600 hidden md:inline">For sudden chest pain, severe hemorrhage, or loss of consciousness, do not wait for self-triage.</span>
            </div>
            <Link
              to="/jeevan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-triage-red hover:text-red-700 underline underline-offset-2 shrink-0"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Request 108 Emergency Ambulance Immediately</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. EDITORIAL HERO: 3 Core Pillars & Voice-Input Option    */}
        {/* ========================================================= */}
        <section className="relative w-full bg-white border-b border-charcoal-200 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column (7 cols): Editorial Typography & Direct Actions */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Clinical Domain Kicker */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-medium">
                  <Activity className="w-3.5 h-3.5 text-forest-700" />
                  <span>Clinical Decision Support & Care Coordination</span>
                </div>

                {/* Editorial Headline */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-charcoal-950 leading-[1.12]">
                  Right Care, <br />
                  at the <span className="italic font-serif text-forest-700">Right Time.</span>
                </h1>

                {/* Clear 3-part Communication */}
                <p className="text-base sm:text-lg text-charcoal-700 max-w-xl font-normal leading-relaxed">
                  A calm, clinically structured healthcare experience designed to help you <strong>understand your symptoms</strong>, <strong>find appropriate healthcare facilities</strong>, and <strong>access immediate emergency assistance</strong>.
                </p>

                {/* Primary & Secondary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/assess"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-forest-800 text-ivory-50 text-sm font-semibold hover:bg-forest-900 shadow-xs transition-all group"
                  >
                    <Stethoscope className="w-4 h-4 text-forest-100" />
                    <span>Begin Symptom Assessment</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <a
                    href="#hospitals"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-ivory-100 text-charcoal-800 text-sm font-medium hover:bg-ivory-200 border border-charcoal-300 transition-all"
                  >
                    <Building2 className="w-4 h-4 text-charcoal-500" />
                    <span>Find Nearby Hospitals</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleTestSoundAlert}
                    className={`inline-flex items-center gap-2 px-4 py-3.5 rounded-full border text-xs sm:text-sm font-medium transition-all ${
                      alarmActive
                        ? 'bg-triage-red-light border-triage-red text-triage-red'
                        : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-ivory-50'
                    }`}
                    title="Acoustic alarm verification chime for serious conditions"
                  >
                    <Volume2 className="w-4 h-4 text-charcoal-500" />
                    <span>{alarmActive ? 'Chime Active...' : 'Test Alert Chime'}</span>
                  </button>
                </div>

                {/* ========================================================= */}
                {/* HERO VOICE-INPUT CONSOLE (Phase 4 Requirement)           */}
                {/* ========================================================= */}
                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-ivory-50 border border-charcoal-200 max-w-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        heroVoiceStatus === 'recording'
                          ? 'bg-triage-red text-white'
                          : 'bg-forest-50 text-forest-800 border border-forest-100'
                      }`}>
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-charcoal-900 block">
                          Speak Your Symptoms Directly
                        </span>
                        <span className="text-[11px] text-charcoal-500">
                          {heroVoiceStatus === 'recording'
                            ? 'Listening... speak clearly into your microphone'
                            : 'Click to dictate your symptoms and begin triage immediately'}
                        </span>
                      </div>
                    </div>

                    {heroVoiceStatus === 'recording' ? (
                      <button
                        type="button"
                        onClick={stopHeroVoice}
                        className="px-3.5 py-1.5 rounded-full bg-triage-red text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                      >
                        Stop Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startHeroVoice}
                        className="px-3.5 py-1.5 rounded-full bg-forest-800 text-ivory-50 text-xs font-medium hover:bg-forest-900 transition-colors"
                      >
                        Speak Symptoms
                      </button>
                    )}
                  </div>

                  {/* Transcribed Hero Speech Output */}
                  {heroTranscript && (
                    <div className="mt-3 pt-3 border-t border-charcoal-200 space-y-2">
                      <div className="text-[11px] font-medium text-charcoal-500">
                        Transcribed text (editable):
                      </div>
                      <input
                        type="text"
                        value={heroTranscript}
                        onChange={(e) => setHeroTranscript(e.target.value)}
                        className="w-full bg-white border border-charcoal-200 rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-forest-800"
                        placeholder="Spoken symptoms..."
                      />
                      <button
                        type="button"
                        onClick={proceedWithHeroTranscript}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 transition-colors"
                      >
                        <span>Start Assessment with These Symptoms</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {heroVoiceError && (
                    <div className="mt-2 text-xs text-triage-red flex items-center justify-between">
                      <span>{heroVoiceError}</span>
                      <button
                        type="button"
                        onClick={startHeroVoice}
                        className="underline font-semibold ml-2"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                {/* Clinical Safety Standards Bar */}
                <div className="pt-4 border-t border-charcoal-200 flex flex-wrap items-center gap-6 text-xs text-charcoal-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Evidence-Based Triage Matrix</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Real-Time Speech-to-Text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Live 108 Dispatch Telemetry</span>
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): Acuity Stratification Hierarchy */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border-b border-charcoal-200 pb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Clinical Urgency Tiers
                  </span>
                  <span className="text-xs text-charcoal-500">Target Response Window</span>
                </div>

                <div className="space-y-3">
                  {/* Red Card */}
                  <div className="p-4 rounded-2xl border border-charcoal-200 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-triage-red shrink-0" />
                        <div>
                          <span className="font-semibold text-charcoal-950 text-sm block">Red — Resuscitation</span>
                          <span className="text-xs text-charcoal-600">Immediate threat to airway, breathing, or hemodynamic stability.</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-triage-red bg-triage-red-light border border-triage-red-border px-2 py-0.5 rounded-md whitespace-nowrap">
                        ≤ 10 Mins
                      </span>
                    </div>
                  </div>

                  {/* Yellow Card */}
                  <div className="p-4 rounded-2xl border border-charcoal-200 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-triage-yellow shrink-0" />
                        <div>
                          <span className="font-semibold text-charcoal-950 text-sm block">Yellow — Urgent Care</span>
                          <span className="text-xs text-charcoal-600">Severe localized pain, marked vital anomalies, or potential for rapid decline.</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-800 bg-triage-yellow-light border border-triage-yellow-border px-2 py-0.5 rounded-md whitespace-nowrap">
                        30–60 Mins
                      </span>
                    </div>
                  </div>

                  {/* Green Card */}
                  <div className="p-4 rounded-2xl border border-charcoal-200 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-triage-green shrink-0" />
                        <div>
                          <span className="font-semibold text-charcoal-950 text-sm block">Green — Standard Care</span>
                          <span className="text-xs text-charcoal-600">Stable, non-urgent presentations suitable for outpatient evaluation.</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                        2–4 Hours
                      </span>
                    </div>
                  </div>

                  {/* Black Card */}
                  <div className="p-4 rounded-2xl border border-charcoal-200 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-charcoal-900 shrink-0" />
                        <div>
                          <span className="font-semibold text-charcoal-950 text-sm block">Black — Clinician Protocol</span>
                          <span className="text-xs text-charcoal-600">Catastrophic non-salvageable injury or verified clinical demise.</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-charcoal-600 bg-ivory-100 border border-charcoal-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                        Document Only
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clinician Portal Prompt */}
                <div className="p-4 rounded-2xl bg-ivory-100 border border-charcoal-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-charcoal-900 block">Are you hospital care staff?</span>
                    <span className="text-charcoal-600">Log in to your emergency workstation queue.</span>
                  </div>
                  <Link
                    to={session ? "/staff/dashboard" : "/login"}
                    className="px-3.5 py-1.5 rounded-full bg-charcoal-900 text-ivory-50 text-xs font-semibold hover:bg-black transition-colors shrink-0"
                  >
                    {session ? "Open Queue" : "Staff Login"}
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. HOW THE ASSESSMENT WORKS (Sequential & Logical)       */}
        {/* ========================================================= */}
        <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-charcoal-200">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800 block mb-2">
              Clinical Methodology
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-950 tracking-tight">
              How the symptom assessment works.
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 mt-2 leading-relaxed">
              Designed around evidence-based emergency triage principles to evaluate urgency without making speculative medical diagnoses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t-2 border-forest-800 pt-5 space-y-2">
              <span className="font-mono text-xs text-forest-800 font-bold">01 / INTAKE</span>
              <h3 className="font-serif text-xl font-normal text-charcoal-950">Describe Symptoms</h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Enter symptoms by typing or speaking in natural language. Add duration, severity, and optional physiological measurements.
              </p>
            </div>

            <div className="border-t-2 border-forest-800 pt-5 space-y-2">
              <span className="font-mono text-xs text-forest-800 font-bold">02 / STRATIFICATION</span>
              <h3 className="font-serif text-xl font-normal text-charcoal-950">Urgency Assessment</h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                The algorithm cross-references reported complaints against international Emergency Severity Index (ESI) red flags and vital anomalies.
              </p>
            </div>

            <div className="border-t-2 border-forest-800 pt-5 space-y-2">
              <span className="font-mono text-xs text-forest-800 font-bold">03 / ACTION</span>
              <h3 className="font-serif text-xl font-normal text-charcoal-950">Care Guidance</h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Receive recommended response timeframes, suggested medical specialties, differential possibilities to discuss with a doctor, and immediate hospital options.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. HEALTHCARE & HOSPITAL DISCOVERY (Phase 4 & 7)          */}
        {/* ========================================================= */}
        <section id="hospitals" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-charcoal-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800 block mb-2">
                Facility Directory
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-950 tracking-tight">
                Discover nearby healthcare facilities.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-xl">
                Verified public hospitals and trauma centers with real available capacity, active emergency departments, and contact actions.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setHospitalFilter('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  hospitalFilter === 'ALL'
                    ? 'bg-forest-800 text-ivory-50'
                    : 'bg-white border border-charcoal-200 text-charcoal-700 hover:bg-ivory-100'
                }`}
              >
                All Facilities
              </button>
              <button
                type="button"
                onClick={() => setHospitalFilter('EMERGENCY_OPEN')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  hospitalFilter === 'EMERGENCY_OPEN'
                    ? 'bg-forest-800 text-ivory-50'
                    : 'bg-white border border-charcoal-200 text-charcoal-700 hover:bg-ivory-100'
                }`}
              >
                24/7 Emergency Open
              </button>
              <button
                type="button"
                onClick={() => setHospitalFilter('TRAUMA_BAY')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  hospitalFilter === 'TRAUMA_BAY'
                    ? 'bg-forest-800 text-ivory-50'
                    : 'bg-white border border-charcoal-200 text-charcoal-700 hover:bg-ivory-100'
                }`}
              >
                Trauma Bays Available
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={hospitalSearch}
              onChange={(e) => setHospitalSearch(e.target.value)}
              placeholder="Search hospitals by name, address, or medical specialty..."
              className="w-full bg-white border border-charcoal-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          {/* Hospital Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white border border-charcoal-200 rounded-2xl p-5 shadow-subtle flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase bg-ivory-100 text-charcoal-600 px-2 py-0.5 rounded border border-charcoal-200">
                      {hospital.id}
                    </span>
                    {hospital.emergencyDepartmentOpen && (
                      <span className="text-[10px] font-semibold text-forest-800 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-700" />
                        <span>24/7 Emergency</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-normal text-charcoal-950">
                      {hospital.name}
                    </h3>
                    <p className="text-xs text-charcoal-600 mt-1 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0 mt-0.5" />
                      <span>{hospital.location?.address || 'Public Hospital Facility'}</span>
                    </p>
                  </div>

                  {/* Bed & Trauma Telemetry */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-charcoal-100 text-xs">
                    <div className="bg-ivory-50 p-2 rounded-xl">
                      <span className="text-[10px] text-charcoal-500 block uppercase font-medium">Available Beds</span>
                      <span className="font-semibold text-charcoal-900 text-sm">
                        {hospital.availableBeds || 'Available'}
                      </span>
                    </div>
                    <div className="bg-ivory-50 p-2 rounded-xl">
                      <span className="text-[10px] text-charcoal-500 block uppercase font-medium">Trauma Bays</span>
                      <span className="font-semibold text-forest-800 text-sm">
                        {hospital.traumaBaysAvailable || 0} Open
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="pt-4 mt-4 border-t border-charcoal-100 flex items-center gap-2">
                  <a
                    href={`tel:${hospital.phone || '108'}`}
                    className="flex-1 py-2 px-3 rounded-xl border border-charcoal-200 hover:bg-ivory-100 text-xs font-semibold text-charcoal-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-forest-700" />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + (hospital.location?.address || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredHospitals.length === 0 && (
            <div className="text-center py-8 text-xs text-charcoal-500">
              No facilities found matching your search. Try adjusting the query or filter.
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 5. EMERGENCY ASSISTANCE OVERVIEW                          */}
        {/* ========================================================= */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-charcoal-200">
          <div className="bg-white border border-charcoal-200 rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-subtle">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-triage-red block">
                Emergency Medical Services
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-950">
                Direct 108 Emergency Ambulance Dispatch.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Connect directly with public Advanced Life Support (ALS) and Basic Life Support (BLS) ambulances. Automated hospital pre-arrival notification and real-time GPS telemetry.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/jeevan"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-triage-red hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              >
                <Siren className="w-4 h-4" />
                <span>Launch 108 Emergency Grid</span>
              </Link>
              <a
                href="tel:108"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-charcoal-300 text-charcoal-800 text-xs sm:text-sm font-medium hover:bg-ivory-100 transition-colors"
              >
                <Phone className="w-4 h-4 text-charcoal-600" />
                <span>Dial 108</span>
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. TRUST, SAFETY & CLINICAL LIMITATIONS                   */}
        {/* ========================================================= */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-ivory-100 border border-charcoal-200 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-charcoal-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-forest-800" />
              <span>Clinical Decision Support Safety Standards & Legal Boundaries</span>
            </div>
            <div className="text-xs text-charcoal-600 leading-relaxed space-y-2">
              <p>
                <strong>Not a Medical Diagnosis:</strong> MediTriage AI functions as a clinical decision support and urgency stratification platform. The outputs provided represent probabilistic categorization based on reported symptoms and vital signs. They do not constitute a definitive medical diagnosis, prescription, or individualized clinical directive.
              </p>
              <p>
                <strong>Escalation Protocol:</strong> In any situation involving chest discomfort, sudden breathlessness, neurological deficits (such as facial drooping or speech difficulty), or acute traumatic injury, immediately proceed to the nearest emergency department or activate emergency medical services by calling 108.
              </p>
              <p>
                <strong>Data Protection:</strong> Health measurements and reported symptoms are processed strictly for clinical prioritization and are not sold or commercialized.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ========================================================= */}
      {/* 7. RESTRAINED EDITORIAL FOOTER                           */}
      {/* ========================================================= */}
      <footer className="w-full border-t border-charcoal-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-charcoal-600">
          <div className="flex items-center gap-3">
            <img
              src="/logo_horizontal.png"
              alt="MediTriage AI Logo"
              className="h-7 w-auto object-contain"
              style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
            />
            <span>•</span>
            <span>Clinical Triage Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-charcoal-700">
            <Link to="/assess" className="hover:text-forest-800 transition-colors">
              Symptom Triage
            </Link>
            <a href="#hospitals" className="hover:text-forest-800 transition-colors">
              Facility Directory
            </a>
            <Link to="/jeevan" className="hover:text-triage-red transition-colors">
              108 Emergency
            </Link>
            <Link to="/login" className="hover:text-forest-800 transition-colors">
              Staff Portal
            </Link>
          </div>

          <div className="text-[11px] text-charcoal-400">
            © 2026 MediTriage AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
