import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHospitalSession, logoutHospital } from '../lib/hospitalAuth';
import type { HospitalAccount } from '../types';
import {
  ArrowRight,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  isAssessmentFlow?: boolean;
  onExit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAssessmentFlow, onExit }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HospitalAccount | null>(getHospitalSession());

  useEffect(() => {
    const handleAuthChange = () => setSession(getHospitalSession());
    window.addEventListener('hospital_auth_changed', handleAuthChange);
    return () => window.removeEventListener('hospital_auth_changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    logoutHospital();
    navigate('/login');
  };

  return (
    <header className="w-full bg-white/85 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src="/logo_horizontal.png"
            alt="MEDITRIAGE AI"
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
          />
        </Link>

        {/* Center Navigation Links matching mockup */}
        {!isAssessmentFlow ? (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <Link
              to="/jeevan"
              className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors py-1"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>Emergency 108</span>
            </Link>

            <Link
              to="/dispatcher"
              className="hover:text-teal-900 transition-colors py-1"
            >
              Dispatcher Grid
            </Link>

            <Link
              to="/staff/dashboard"
              className="hover:text-teal-900 transition-colors py-1"
            >
              Triage Queue
            </Link>

            <a
              href="#features"
              className="hover:text-teal-900 transition-colors py-1"
            >
              Features
            </a>

            <a
              href="#pricing"
              className="hover:text-teal-900 transition-colors py-1"
            >
              Pricing
            </a>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-teal-800">
              <span className="w-2 h-2 rounded-full bg-teal-700 animate-pulse"></span>
              Hospital Clinical Triage Desk
            </span>
            {session && (
              <span className="font-mono text-slate-600">
                {session.hospitalId} • {session.staffName}
              </span>
            )}
          </div>
        )}

        {/* Right CTA & Account Status */}
        <div className="flex items-center gap-3">
          {isAssessmentFlow ? (
            <button
              onClick={onExit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Desk</span>
            </button>
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {session.hospitalName.split(' ')[0]} {session.hospitalName.split(' ')[1] || 'Hospital'}
                </span>
                <span className="text-[10px] text-teal-700 font-semibold font-mono">
                  {session.activePlan} Plan Active
                </span>
              </div>

              <Link
                to="/assess"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#0B3B36] text-white hover:bg-[#072623] shadow-sm transition-all group"
              >
                <span>New Triage Intake</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/jeevan"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all animate-pulse"
              >
                <span>🚨</span>
                <span>Emergency 108</span>
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 rounded-full bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-all border border-slate-200 shadow-xs"
              >
                Hospital Login
              </Link>
              <Link
                to="/staff/subscription"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0B3B36] text-white text-xs font-semibold hover:bg-[#072623] shadow-sm transition-all group"
              >
                <span>View Plans (₹999+)</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
