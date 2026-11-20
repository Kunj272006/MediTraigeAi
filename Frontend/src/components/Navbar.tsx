import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Shield,
  FileText,
  BookOpen,
  LifeBuoy
} from 'lucide-react';

interface NavbarProps {
  isAssessmentFlow?: boolean;
  onExit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAssessmentFlow, onExit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setResourcesOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Exact layout with Tagline */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
          <img
            src="/logo_horizontal.png"
            alt="MEDITRIAGE AI - Right Care, Right Time"
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:opacity-95"
            style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
          />
        </Link>

        {/* Center Navigation Links - Matching Image 1 */}
        {!isAssessmentFlow ? (
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-600">
            <Link
              to="/staff/dashboard"
              className="transition-colors hover:text-slate-900 font-medium"
            >
              Triage Queue
            </Link>

            <a
              href="#features"
              className="transition-colors hover:text-slate-900 font-medium"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition-colors hover:text-slate-900 font-medium"
            >
              How It Works
            </a>

            <Link
              to="/pricing"
              className="transition-colors hover:text-slate-900 font-medium"
            >
              Pricing
            </Link>

            {/* Resources Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="inline-flex items-center gap-1 transition-colors hover:text-slate-900 font-medium cursor-pointer"
              >
                <span>Resources</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>

              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in text-xs">
                  <Link
                    to="/about"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-teal-700" />
                    <span>Clinical Guidelines</span>
                  </Link>
                  <Link
                    to="/assess"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span>Symptom Protocol</span>
                  </Link>
                  <Link
                    to="/jeevan"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-teal-700" />
                    <span>Jeevan Emergency Dispatch</span>
                  </Link>
                  <a
                    href="mailto:support@meditriage.ai"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4 text-teal-700" />
                    <span>Contact Support</span>
                  </a>
                </div>
              )}
            </div>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Symptom Assessment in Progress</span>
          </div>
        )}

        {/* Right Actions - Matching Image 1: [Hospital Login] [View Plans (₹999+) ->] */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAssessmentFlow ? (
            <button
              onClick={onExit || (() => navigate('/'))}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Exit
            </button>
          ) : (
            <>
              {/* Hospital Login Pill */}
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors"
              >
                Hospital Login
              </Link>

              {/* View Plans Pill CTA */}
              <Link
                to="/pricing"
                className="hidden sm:inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#0B3B36] hover:bg-[#072522] text-white text-xs font-semibold shadow-xs transition-transform hover:scale-[1.02]"
              >
                <span>View Plans (₹999+)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {/* Mobile Menu Hamburger */}
          {!isAssessmentFlow && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && !isAssessmentFlow && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 animate-fade-in shadow-lg text-xs">
          <Link
            to="/staff/dashboard"
            className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
          >
            Triage Queue
          </Link>
          <a
            href="#features"
            className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
          >
            How It Works
          </a>
          <Link
            to="/pricing"
            className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
          >
            Pricing (from ₹999/mo)
          </Link>
          <Link
            to="/login"
            className="block px-3 py-2.5 rounded-xl bg-slate-50 text-slate-900 font-semibold"
          >
            Hospital Staff Login
          </Link>
        </div>
      )}
    </header>
  );
};
