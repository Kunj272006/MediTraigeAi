import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogOut } from 'lucide-react';

interface NavbarProps {
  isAssessmentFlow?: boolean;
  onExit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAssessmentFlow, onExit }) => {
  return (
    <header className="w-full bg-ivory-100/90 backdrop-blur-md border-b border-charcoal-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-ivory-100 shadow-sm transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M4 4h4v6.5l4-3 4 3V4h4v16h-4v-6.5l-4 3-4-3V20H4V4z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold tracking-tight text-lg text-charcoal-900 leading-tight">
              MEDITRIAGE <span className="text-forest-700 font-semibold">AI</span>
            </span>
            <span className="text-[10px] tracking-widest text-charcoal-500 uppercase font-medium">
              Right Care, Right Time
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        {!isAssessmentFlow ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal-600">
            <Link to="/#patients" className="hover:text-forest-800 transition-colors">
              For Patients
            </Link>
            <Link to="/staff/dashboard" className="hover:text-forest-800 transition-colors">
              For Hospitals
            </Link>
            <Link to="/#how-it-works" className="hover:text-forest-800 transition-colors">
              How It Works
            </Link>
            <Link to="/#about" className="hover:text-forest-800 transition-colors">
              About
            </Link>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-6 text-xs text-charcoal-500 font-medium">
            <span className="flex items-center gap-1.5 text-forest-800">
              <span className="w-2 h-2 rounded-full bg-forest-700"></span>
              Encrypted Session
            </span>
            <span>Preliminary Assessment Mode</span>
          </div>
        )}

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAssessmentFlow ? (
            <button
              onClick={onExit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-200/50 transition-all border border-charcoal-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          ) : (
            <>
              <Link
                to="/staff/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200 transition-all"
              >
                Hospital Staff
              </Link>
              <Link
                to="/assess"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-forest-800 text-ivory-100 hover:bg-forest-900 shadow-sm hover:shadow transition-all group"
              >
                <span>Start assessment</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
