import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

interface EmergencyBannerProps {
  variant?: 'subtle' | 'critical';
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ variant = 'subtle' }) => {
  if (variant === 'critical') {
    return (
      <div className="w-full bg-triage-red-light border border-triage-red-border rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 text-charcoal-900 shadow-sm animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-triage-red/10 text-triage-red flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-triage-red">
              Critical Warning: Potential Medical Emergency Detected
            </h4>
            <p className="text-xs text-charcoal-700 mt-0.5">
              If experiencing severe chest pain, intense breathlessness, sudden speech loss, or collapse, seek emergency care immediately.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/jeevan"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-red-700 border border-red-200 hover:bg-red-50 transition shadow-2xs"
          >
            <span>🚨 Dispatch 108</span>
          </a>
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-triage-red text-white hover:bg-red-700 transition shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 108</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="bg-ivory-200/80 border border-charcoal-200/80 rounded-full px-5 py-2.5 flex items-center justify-center gap-2.5 text-xs text-charcoal-600 shadow-subtle text-center">
        <AlertTriangle className="w-4 h-4 text-triage-yellow shrink-0" />
        <span>
          <strong className="text-charcoal-800 font-semibold">Preliminary guidance only.</strong> This tool does not replace professional medical advice. In an emergency, seek immediate medical help or call emergency services (<strong>108 / 112</strong>).
        </span>
      </div>
    </div>
  );
};
