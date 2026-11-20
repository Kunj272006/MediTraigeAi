import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  ArrowLeft,
  Search,
  MapPin,
  Phone,
  Navigation,
  Building2,
  CheckCircle2,
  Crosshair,
  ExternalLink
} from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  category: string;
  bedsAvailable: number;
  open24_7: boolean;
  distanceKm: number;
  lat: number;
  lng: number;
}

const HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'City Care Hospital',
    address: '123 Health Park, Dehradun',
    phone: '+91 135 271 8800',
    category: 'Multi-Specialty & Emergency',
    bedsAvailable: 14,
    open24_7: true,
    distanceKm: 1.2,
    lat: 30.3165,
    lng: 78.0322
  },
  {
    id: 'hosp-2',
    name: 'GMVN Government Hospital',
    address: 'Mall Road, Dehradun',
    phone: '+91 135 265 4321',
    category: 'District Government Hospital',
    bedsAvailable: 28,
    open24_7: true,
    distanceKm: 2.5,
    lat: 30.3256,
    lng: 78.0437
  },
  {
    id: 'hosp-3',
    name: 'Doon Medical Centre',
    address: 'Rajpur Road, Dehradun',
    phone: '+91 135 274 5500',
    category: 'Emergency Trauma & Surgical',
    bedsAvailable: 9,
    open24_7: true,
    distanceKm: 3.8,
    lat: 30.3412,
    lng: 78.0589
  },
  {
    id: 'hosp-4',
    name: 'AIIMS Apex Trauma Center',
    address: 'Virbhadra Road, Rishikesh',
    phone: '0135-2462929',
    category: 'National Apex Trauma Center',
    bedsAvailable: 42,
    open24_7: true,
    distanceKm: 14.0,
    lat: 30.0869,
    lng: 78.2882
  }
];

export const FindHospitalsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedHosp, setSelectedHosp] = useState<Hospital>(HOSPITALS[0]);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  const filtered = HOSPITALS.filter(
    (h) =>
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.address.toLowerCase().includes(query.toLowerCase()) ||
      h.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLocating(true);
      setLocationNote('Detecting your GPS location...');
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocating(false);
          setLocationNote('Showing facilities nearest to your current location.');
        },
        () => {
          setLocating(false);
          setLocationNote('Location access denied. Displaying regional facilities.');
        }
      );
    } else {
      setLocationNote('Showing regional facilities.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Heading (Matching Screen 4) */}
        <div className="mb-6">
          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Find Hospitals Near You
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search for hospitals and medical facilities in your area.
          </p>
        </div>

        {/* Search Bar + Use My Location Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hospitals, specialties, or locations..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#138A72] focus:ring-2 focus:ring-[#138A72]/15 shadow-2xs transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <Crosshair className={`w-4 h-4 text-[#138A72] ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>

        {locationNote && (
          <div className="mb-4 text-xs font-medium text-teal-800 bg-teal-50/80 border border-teal-200/60 rounded-xl px-3.5 py-2 animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{locationNote}</span>
          </div>
        )}

        {/* Two-Column Split: Hospital Cards (Left) and Clean Map View (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Hospital Cards */}
          <div className="lg:col-span-6 space-y-3.5">
            {filtered.map((hosp) => {
              const isSelected = selectedHosp.id === hosp.id;
              return (
                <div
                  key={hosp.id}
                  onClick={() => setSelectedHosp(hosp)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'border-[#138A72] ring-2 ring-[#138A72]/15'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#138A72] shrink-0 mt-0.5">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                          {hosp.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{hosp.address}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {hosp.bedsAvailable} Beds Open
                          </span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {hosp.distanceKm} km away
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2.5 mt-4 pt-3.5 border-t border-slate-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${hosp.name}, ${hosp.address}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <Navigation className="w-3 h-3 text-[#138A72]" />
                      <span>Directions</span>
                    </a>

                    <a
                      href={`tel:${hosp.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No hospitals found matching &quot;{query}&quot;. Try another search term.
              </div>
            )}
          </div>

          {/* Right Column: Clean Interactive Map View */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs overflow-hidden sticky top-28">
            <div className="relative w-full h-[480px] rounded-xl bg-slate-100 overflow-hidden flex flex-col justify-between p-4">
              
              {/* Map Canvas Visual (Grid + Landmarks) */}
              <div className="absolute inset-0 bg-[#E8ECEF] opacity-90">
                <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mapGrid)" />
                  {/* Stylized road arteries */}
                  <path d="M 0 140 Q 180 120 360 220 T 600 340" fill="none" stroke="#CBD5E1" strokeWidth="12" />
                  <path d="M 0 140 Q 180 120 360 220 T 600 340" fill="none" stroke="#FFFFFF" strokeWidth="8" />
                  <path d="M 160 0 Q 180 200 240 480" fill="none" stroke="#CBD5E1" strokeWidth="10" />
                  <path d="M 160 0 Q 180 200 240 480" fill="none" stroke="#FFFFFF" strokeWidth="6" />
                </svg>
              </div>

              {/* Hospital Markers Pinpointed on Map */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Pin 1: City Care Hospital */}
                <div className="absolute left-[34%] top-[28%] pointer-events-auto transform -translate-x-1/2 -translate-y-full cursor-pointer group">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[#138A72] text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                      City Care (14 beds)
                    </div>
                  </div>
                </div>

                {/* Pin 2: GMVN Hospital */}
                <div className="absolute left-[62%] top-[45%] pointer-events-auto transform -translate-x-1/2 -translate-y-full cursor-pointer group">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[#0B3B36] text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                      GMVN Govt (28 beds)
                    </div>
                  </div>
                </div>

                {/* Pin 3: Doon Medical Centre */}
                <div className="absolute left-[45%] top-[72%] pointer-events-auto transform -translate-x-1/2 -translate-y-full cursor-pointer group">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Doon Medical (9 beds)
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Hospital Info Card Overlay */}
              <div className="relative z-10 mt-auto bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-md border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#138A72] uppercase tracking-wider block">
                      Active Facility Pin
                    </span>
                    <span className="text-xs font-bold text-slate-900 block">
                      {selectedHosp.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedHosp.address} • {selectedHosp.phone}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${selectedHosp.name}, ${selectedHosp.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#138A72] hover:bg-[#0E6C59] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
