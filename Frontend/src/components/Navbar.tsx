import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getHospitalSession, logoutHospital } from '../lib/hospitalAuth';
import type { HospitalAccount } from '../types';
import {
  ArrowRight,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Stethoscope,
  Siren,
  LayoutDashboard,
  Building2
} from 'lucide-react';

interface NavbarProps {
  isAssessmentFlow?: boolean;
  onExit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAssessmentFlow, onExit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<HospitalAccount | null>(getHospitalSession());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => setSession(getHospitalSession());
    window.addEventListener('hospital_auth_changed', handleAuthChange);
    return () => window.removeEventListener('hospital_auth_changed', handleAuthChange);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutHospital();
    navigate('/login');
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-charcoal-200 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo - Preserved exactly as required */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 rounded-lg">
            <img
              src="/logo_horizontal.png"
              alt="MediTriage AI Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:opacity-95"
              style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          {!isAssessmentFlow && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-charcoal-700">
              <Link
                to="/assess"
                className={`flex items-center gap-1.5 py-1 transition-colors hover:text-forest-800 ${
                  location.pathname === '/assess' ? 'text-forest-800 font-semibold' : ''
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-forest-700" />
                <span>Symptom Triage</span>
              </Link>

              <a
                href="/#hospitals"
                className="py-1 transition-colors hover:text-forest-800"
              >
                Find Hospitals
              </a>

              <Link
                to="/jeevan"
                className={`flex items-center gap-1.5 py-1 transition-colors hover:text-triage-red ${
                  location.pathname === '/jeevan' ? 'text-triage-red font-semibold' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-triage-red" />
                <span>Emergency 108 SOS</span>
              </Link>

              <Link
                to="/dispatcher"
                className={`py-1 transition-colors hover:text-forest-800 ${
                  location.pathname === '/dispatcher' ? 'text-forest-800 font-semibold' : ''
                }`}
              >
                Dispatch Grid
              </Link>

              <Link
                to="/staff/dashboard"
                className={`py-1 transition-colors hover:text-forest-800 ${
                  location.pathname.startsWith('/staff') ? 'text-forest-800 font-semibold' : ''
                }`}
              >
                Clinical Queue
              </Link>
            </nav>
          )}
        </div>

        {/* Assessment Flow State Header */}
        {isAssessmentFlow && (
          <div className="hidden sm:flex items-center gap-4 text-xs text-charcoal-600 font-medium">
            <span className="flex items-center gap-2 text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-100">
              <span className="w-2 h-2 rounded-full bg-forest-700" />
              <span>Clinical Intake Desk</span>
            </span>
            {session && (
              <span className="font-mono text-charcoal-500 text-[11px]">
                {session.hospitalId} • {session.staffName}
              </span>
            )}
          </div>
        )}

        {/* Right CTA / Session Actions */}
        <div className="flex items-center gap-3">
          {isAssessmentFlow ? (
            <button
              onClick={onExit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 hover:bg-charcoal-100 transition-all border border-charcoal-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Desk</span>
            </button>
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-charcoal-900 leading-tight">
                  {session.hospitalName.split(' ')[0]} {session.hospitalName.split(' ')[1] || 'Hospital'}
                </span>
                <span className="text-[11px] text-forest-700 font-mono">
                  {session.staffRole || 'Staff on Duty'}
                </span>
              </div>

              <Link
                to="/assess"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-forest-800 text-ivory-50 hover:bg-forest-900 shadow-xs transition-all"
              >
                <span>New Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/jeevan"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-triage-red text-white text-xs font-semibold hover:bg-red-700 shadow-xs transition-colors"
              >
                <Siren className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">108 Emergency</span>
                <span className="sm:hidden">108</span>
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-ivory-100 text-charcoal-800 text-xs font-medium hover:bg-ivory-200 transition-colors border border-charcoal-200"
              >
                Hospital Staff Login
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          {!isAssessmentFlow && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 md:hidden transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {!isAssessmentFlow && mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-200 bg-white px-4 py-4 space-y-3 animate-fade-in shadow-lg">
          <Link
            to="/assess"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-charcoal-800 hover:bg-ivory-100 transition-colors"
          >
            <Stethoscope className="w-4 h-4 text-forest-700" />
            <span>Symptom Triage Assessment</span>
          </Link>
          <a
            href="/#hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-charcoal-800 hover:bg-ivory-100 transition-colors"
          >
            <Building2 className="w-4 h-4 text-forest-700" />
            <span>Find Nearby Hospitals</span>
          </a>
          <Link
            to="/jeevan"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-triage-red hover:bg-triage-red-light transition-colors"
          >
            <Siren className="w-4 h-4 text-triage-red" />
            <span>Emergency 108 SOS Dispatch</span>
          </Link>
          <Link
            to="/dispatcher"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-charcoal-800 hover:bg-ivory-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-forest-700" />
            <span>Fleet & Emergency Dispatch Grid</span>
          </Link>
          <Link
            to="/staff/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-charcoal-800 hover:bg-ivory-100 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>Hospital Triage Queue</span>
          </Link>
          <div className="pt-2 border-t border-charcoal-200">
            <Link
              to="/login"
              className="w-full text-center block py-2.5 rounded-xl bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900"
            >
              Hospital Staff Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
