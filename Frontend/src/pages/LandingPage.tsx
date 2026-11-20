import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  ArrowRight,
  Stethoscope,
  Building2,
  Phone,
  MapPin,
  Search,
  Mic,
  AlertTriangle,
  HeartPulse,
  ShieldCheck,
  Clock,
  Navigation,
  Crosshair,
  MessageSquare,
  ClipboardList
} from 'lucide-react';

interface HospitalItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: string;
}

const HOSPITALS_DATA: HospitalItem[] = [
  {
    id: 'hosp-1',
    name: 'City Care Hospital',
    address: '123 Health Park, Dehradun',
    phone: '0135-2658800',
    type: 'Multi-Specialty & Emergency'
  },
  {
    id: 'hosp-2',
    name: 'GMVN Hospital',
    address: 'Mall Road, Dehradun',
    phone: '0135-2616500',
    type: 'District Government Hospital'
  },
  {
    id: 'hosp-3',
    name: 'Doon Medical Centre',
    address: 'Rajpur Road, Dehradun',
    phone: '0135-2336500',
    type: 'Trauma & Critical Care'
  },
  {
    id: 'hosp-4',
    name: 'AIIMS Apex Trauma Center',
    address: 'Ring Road, New Delhi',
    phone: '011-26588500',
    type: 'Apex Government Trauma Center'
  }
];

export const LandingPage: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocationNote, setUserLocationNote] = useState<string | null>(null);

  useEffect(() => {
    if (location.hash) {
      const elem = document.querySelector(location.hash);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (location.pathname === '/hospitals') {
      const elem = document.querySelector('#hospitals');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    } else if (location.pathname === '/about') {
      const elem = document.querySelector('#about');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const filteredHospitals = HOSPITALS_DATA.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setUserLocationNote('Locating...');
      navigator.geolocation.getCurrentPosition(
        () => {
          setUserLocationNote('Nearby hospitals sorted by closest proximity.');
        },
        () => {
          setUserLocationNote('Location permission denied. Showing regional facilities.');
        }
      );
    } else {
      setUserLocationNote('Showing facilities for your region.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 w-full">
        
        {/* ========================================================= */}
        {/* SCREEN 1: HERO SECTION & HOW IT WORKS                     */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          
          {/* Mint Ambient Gradient Wash Top Right */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/40 via-emerald-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Your Health. Our Priority.</span>
              </div>

              {/* Headline matching exact mockup */}
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Your health <br />
                deserves the <br />
                <span className="text-[#138A72]">right attention.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed font-normal">
                Understand your symptoms. Find the right care. Get help when it matters.
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/assess"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#0D382F] hover:bg-[#092822] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] group"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-300" />
                  <span>Check Symptoms</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <a
                  href="#hospitals"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Find Hospitals</span>
                </a>
              </div>

              {/* Subtle Voice Prompt Link from Mockup */}
              <div className="pt-2">
                <Link
                  to="/assess"
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-slate-500" />
                  <span>Prefer speaking? Describe your symptoms naturally.</span>
                </Link>
              </div>

            </div>

            {/* Right Stethoscope Visual (5 cols) matching exact mockup */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-gradient-to-tr from-teal-50 to-emerald-100/50 p-3 shadow-inner flex items-center justify-center">
                <img
                  src="/hero_stethoscope.png"
                  alt="Medical Stethoscope"
                  className="w-full h-full object-cover rounded-full"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* "HOW IT WORKS" 3-STEP BANNER (Matching Mockup Strip)      */}
          {/* ========================================================= */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-4">
                <h2 className="font-bold text-base text-slate-900">How it works</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get the right guidance in just a few steps.
                </p>
              </div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                
                {/* Step 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">1</span>
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      Describe your symptoms
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-300 ml-auto">→</span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">2</span>
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      Get an AI assessment and guidance
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-300 ml-auto">→</span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">3</span>
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      Find nearby hospitals or get emergency help
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* "NEED IMMEDIATE HELP?" BANNER STRIP (Matching Mockup)     */}
          {/* ========================================================= */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-[#D93829]" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Need immediate help?
                </span>
                <span className="text-[11px] text-slate-500">
                  Access emergency assistance for life-threatening situations.
                </span>
              </div>
            </div>

            <Link
              to="/jeevan"
              className="px-4 py-2 rounded-full bg-[#D93829] hover:bg-[#C02F21] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs whitespace-nowrap transition-colors"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
              <span>Call Emergency Services</span>
            </Link>
          </div>

        </section>

        {/* ========================================================= */}
        {/* SCREEN 4: FIND HOSPITALS NEAR YOU (Exact Mockup Layout)   */}
        {/* ========================================================= */}
        <section id="hospitals" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
          
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Facility Locator
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Find Hospitals Near You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search for hospitals and medical facilities in your area.
            </p>
          </div>

          {/* Search Input Row with "Use My Location" */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospitals, specialties..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <button
              type="button"
              onClick={handleUseLocation}
              className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Crosshair className="w-3.5 h-3.5 text-teal-700" />
              <span>Use My Location</span>
            </button>
          </div>

          {userLocationNote && (
            <div className="text-[11px] text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
              {userLocationNote}
            </div>
          )}

          {/* Two-Column Grid: Hospital Cards (Left) + Map (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Hospital Cards */}
            <div className="lg:col-span-7 space-y-3">
              {filteredHospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-teal-800" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                        {hosp.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {hosp.address}
                      </p>
                      <span className="text-[10px] text-teal-800 font-medium">
                        {hosp.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + hosp.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3 h-3 text-slate-500" />
                      <span>Directions</span>
                    </a>
                    <a
                      href={`tel:${hosp.phone}`}
                      className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Map Card matching exact mockup */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs relative bg-slate-100 min-h-[260px] flex items-center justify-center">
              <img
                src="/map_preview.png"
                alt="Hospital Location Map"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-teal-900/5 pointer-events-none" />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-sm flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-blue-600 fill-blue-600" />
                <span>Showing Verified Medical Centers</span>
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* SCREEN 5: EMERGENCY ASSISTANCE (Exact Mockup Layout)      */}
        {/* ========================================================= */}
        <section id="emergency" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
          
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Emergency Assistance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quick access to emergency services when every second matters.
            </p>
          </div>

          {/* Central Emergency Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FBFBFA] border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#D93829] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 fill-[#D93829]" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Emergency Helpline</span>
                    <span className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight">108</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Ambulance Service</span>
                    <span className="font-bold text-sm text-slate-800">Available 24/7</span>
                  </div>
                </div>
              </div>

              {/* Big Red Request Ambulance Button matching mockup */}
              <Link
                to="/jeevan"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D93829] hover:bg-[#C02F21] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
              >
                <span>Request Ambulance</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

            {/* Right Ambulance Visual (5 cols) matching exact mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-64 sm:w-72 h-64 sm:h-72 rounded-full bg-gradient-to-tr from-slate-100 to-red-50 p-4 flex items-center justify-center shadow-inner overflow-hidden">
                <img
                  src="/ambulance_preview.png"
                  alt="Emergency Ambulance"
                  className="w-full h-full object-cover rounded-full"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            </div>

          </div>

          {/* Bottom Alert Note matching mockup */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span>In case of a life-threatening emergency, please call 108 immediately.</span>
          </div>

        </section>

        {/* ========================================================= */}
        {/* SCREEN 6: ABOUT MEDITRIAGE AI (Exact Mockup Layout)       */}
        {/* ========================================================= */}
        <section id="about" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-8">
          
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              About MediTriage AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              A smart healthcare companion, designed to help you make informed decisions about your health.
            </p>
          </div>

          {/* 3 Feature Cards matching exact mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 mb-3">
                <HeartPulse className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                AI-Powered Guidance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get reliable health guidance based on your symptoms.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 mb-3">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Trusted & Safe
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your privacy and well-being are our priority.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 mb-3">
                <Clock className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Always Here
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access help anytime, anywhere.
              </p>
            </div>

          </div>

          {/* "How It Works?" Bottom Strip with Stethoscope Visual */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                How It Works?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                A simple process to get the right care.
              </p>
              <div className="pt-4">
                <Link
                  to="/assess"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900"
                >
                  <span>Start your symptom evaluation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="w-40 h-28 sm:w-48 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-xs border border-slate-200/60">
              <img
                src="/about_stethoscope.png"
                alt="Medical Care Stethoscope"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </section>

      </main>

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src="/logo_horizontal.png"
              alt="MEDITRIAGE AI"
              className="h-6 w-auto object-contain"
            />
            <span>•</span>
            <span>© 2026 MEDITRIAGE AI Healthcare</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <Link to="/assess" className="hover:text-slate-900">Assess Symptoms</Link>
            <a href="#hospitals" className="hover:text-slate-900">Find Hospitals</a>
            <a href="#about" className="hover:text-slate-900">About</a>
            <Link to="/login" className="hover:text-slate-900">Staff Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
