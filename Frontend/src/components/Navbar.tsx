import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  Menu,
  X,
  Stethoscope,
  Building2,
  Info,
  Home
} from 'lucide-react';

interface NavbarProps {
  isAssessmentFlow?: boolean;
  onExit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAssessmentFlow, onExit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Preserved exactly as in mockup */}
        <Link to="/" className="flex items-center gap-2 group focus:outline-none">
          <img
            src="/logo_horizontal.png"
            alt="MEDITRIAGE AI"
            className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:opacity-95"
            style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
          />
        </Link>

        {/* Center Navigation Links - Matching exact mockup (Home, Assess Symptoms, Find Hospitals, About) */}
        {!isAssessmentFlow ? (
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-700">
            <Link
              to="/"
              className={`transition-colors hover:text-slate-900 ${
                location.pathname === '/' ? 'text-slate-950 font-semibold' : ''
              }`}
            >
              Home
            </Link>

            <Link
              to="/assess"
              className={`transition-colors hover:text-slate-900 ${
                location.pathname === '/assess' ? 'text-slate-950 font-semibold' : ''
              }`}
            >
              Assess Symptoms
            </Link>

            <a
              href="/#hospitals"
              className="transition-colors hover:text-slate-900"
            >
              Find Hospitals
            </a>

            <a
              href="/#about"
              className="transition-colors hover:text-slate-900"
            >
              About
            </a>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Symptom Assessment in Progress</span>
          </div>
        )}

        {/* Right CTA - Exact Red Pill Button from Mockup: 📞 Emergency */}
        <div className="flex items-center gap-3">
          {isAssessmentFlow ? (
            <button
              onClick={onExit || (() => navigate('/'))}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Exit
            </button>
          ) : (
            <Link
              to="/jeevan"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#D93829] hover:bg-[#C02F21] text-white text-xs font-semibold shadow-xs transition-transform hover:scale-[1.02]"
            >
              <Phone className="w-3.5 h-3.5 fill-white text-white" />
              <span>Emergency</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          {!isAssessmentFlow && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {!isAssessmentFlow && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2.5 shadow-lg animate-fade-in">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home</span>
          </Link>

          <Link
            to="/assess"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            <Stethoscope className="w-4 h-4 text-slate-500" />
            <span>Assess Symptoms</span>
          </Link>

          <a
            href="/#hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Find Hospitals</span>
          </a>

          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span>About MediTriage AI</span>
          </a>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/jeevan"
              className="w-full py-2.5 rounded-full bg-[#D93829] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
              <span>108 Emergency Assistance</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
