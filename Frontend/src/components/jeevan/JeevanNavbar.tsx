import React from 'react';
import { Phone, ShieldAlert, Radio, Ambulance, Building2, Settings, ArrowLeft } from 'lucide-react';

export type JeevanPortalRole = 'citizen' | 'dispatcher' | 'operator' | 'hospital' | 'admin';

interface JeevanNavbarProps {
  activeRole: JeevanPortalRole;
  onSelectRole: (role: JeevanPortalRole) => void;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  activeIncidentCount?: number;
}

export const JeevanNavbar: React.FC<JeevanNavbarProps> = ({
  activeRole,
  onSelectRole,
  language,
  onLanguageChange,
  activeIncidentCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          
          {/* Brand Logo & Emergency Grid Identity (No 'Jeevan AI' text) */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectRole('citizen')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/25 text-white font-black text-xl transition-transform group-hover:scale-105">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  108 EMERGENCY DISPATCH
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  NATIONAL GRID
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Emergency First &bull; Smart Transport &bull; Govt Hospital Sync
              </p>
            </div>
          </div>

          {/* Role Navigation Switcher (Clean Light Pills) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => onSelectRole('citizen')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeRole === 'citizen'
                  ? 'bg-red-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>🚨</span>
              <span>Emergency SOS</span>
            </button>

            <button
              onClick={() => onSelectRole('dispatcher')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 relative ${
                activeRole === 'dispatcher'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Dispatcher Grid</span>
              {activeIncidentCount > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse ml-0.5">
                  {activeIncidentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectRole('operator')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeRole === 'operator'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>Ambulance MDT</span>
            </button>

            <button
              onClick={() => onSelectRole('hospital')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeRole === 'hospital'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Govt Hospital</span>
            </button>

            <button
              onClick={() => onSelectRole('admin')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Quick Actions & Language Toggle */}
          <div className="flex items-center gap-3">
            {/* Return to MediTriage Landing */}
            <a
              href="/"
              className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition font-semibold"
              title="Return to Main Hospital Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hospital Home</span>
            </a>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs font-bold">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                हिन्दी
              </button>
            </div>

            {/* Direct Emergency Call Button */}
            <a
              href="tel:108"
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2.5 rounded-full shadow-md shadow-red-600/30 transition-transform active:scale-95 animate-pulse"
              title="Immediate Emergency Ambulance Hotline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>CALL 108</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onSelectRole('citizen')}
            className={`py-1.5 px-2.5 rounded-lg font-bold ${activeRole === 'citizen' ? 'bg-red-50 text-red-600' : 'text-slate-600'}`}
          >
            🚨 SOS
          </button>
          <button
            onClick={() => onSelectRole('dispatcher')}
            className={`py-1.5 px-2.5 rounded-lg font-bold ${activeRole === 'dispatcher' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
          >
            📡 Dispatch
          </button>
          <button
            onClick={() => onSelectRole('operator')}
            className={`py-1.5 px-2.5 rounded-lg font-bold ${activeRole === 'operator' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
          >
            🚑 Ambulance
          </button>
          <button
            onClick={() => onSelectRole('hospital')}
            className={`py-1.5 px-2.5 rounded-lg font-bold ${activeRole === 'hospital' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
          >
            🏥 Hospital
          </button>
          <button
            onClick={() => onSelectRole('admin')}
            className={`py-1.5 px-2.5 rounded-lg font-bold ${activeRole === 'admin' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
          >
            ⚙️ Admin
          </button>
        </div>
      </div>
    </header>
  );
};
