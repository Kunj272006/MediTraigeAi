import React from 'react';

export const AmbulanceIllustration: React.FC<{ className?: string }> = ({ className = 'w-80 h-64' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Emergency red/amber ambient pulse */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-100/60 via-red-50/40 to-transparent blur-2xl" />

      <svg
        viewBox="0 0 360 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-lg select-none"
      >
        <defs>
          <linearGradient id="cabWhite" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          <linearGradient id="glassWindshield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="emergencyStripe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D93829" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>

          <linearGradient id="wheelRubber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="beaconGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="180" cy="215" rx="145" ry="12" fill="#0F172A" fillOpacity="0.12" />

        {/* Emergency Beacon Lights On Roof */}
        <g>
          {/* Light bar mount */}
          <rect x="150" y="58" width="55" height="6" rx="2" fill="#475569" />
          {/* Blue beacon */}
          <rect x="154" y="50" width="20" height="8" rx="3" fill="#0284C7" />
          {/* Red beacon */}
          <rect x="180" y="50" width="20" height="8" rx="3" fill="#DC2626" />
          {/* Light rays */}
          <circle cx="164" cy="54" r="14" fill="#38BDF8" fillOpacity="0.3" className="animate-pulse" />
          <circle cx="190" cy="54" r="14" fill="#EF4444" fillOpacity="0.3" className="animate-pulse" />
        </g>

        {/* Main Ambulance Body */}
        {/* Rear box */}
        <path
          d="M 55 70 Q 55 64 63 64 L 215 64 Q 220 64 220 70 L 220 185 L 55 185 Z"
          fill="url(#cabWhite)"
          stroke="#CBD5E1"
          strokeWidth="2"
        />

        {/* Front Cab */}
        <path
          d="M 220 90 L 260 115 Q 285 130 288 150 L 290 185 L 220 185 Z"
          fill="url(#cabWhite)"
          stroke="#CBD5E1"
          strokeWidth="2"
        />

        {/* Windshield */}
        <path
          d="M 224 96 L 254 118 Q 268 128 270 142 L 224 142 Z"
          fill="url(#glassWindshield)"
          stroke="#0284C7"
          strokeWidth="1.5"
        />

        {/* Side Passenger Windows */}
        <rect x="75" y="80" width="45" height="32" rx="4" fill="url(#glassWindshield)" stroke="#0284C7" strokeWidth="1" />
        <rect x="135" y="80" width="45" height="32" rx="4" fill="url(#glassWindshield)" stroke="#0284C7" strokeWidth="1" />

        {/* Red Emergency Stripe across body */}
        <rect x="55" y="146" width="232" height="18" fill="url(#emergencyStripe)" />
        {/* Secondary mint accent stripe */}
        <rect x="55" y="164" width="232" height="4" fill="#138A72" />

        {/* Medical Cross on Body */}
        <g transform="translate(155, 110)">
          <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#D93829" strokeWidth="1.5" />
          <rect x="-10" y="-3" width="20" height="6" rx="1.5" fill="#D93829" />
          <rect x="-3" y="-10" width="6" height="20" rx="1.5" fill="#D93829" />
        </g>

        {/* Front Headlight & Bumper */}
        <path d="M 285 160 L 292 165 L 290 180 L 285 180 Z" fill="#FBBF24" />
        <rect x="282" y="180" width="14" height="8" rx="2" fill="#475569" />
        <rect x="48" y="180" width="10" height="8" rx="2" fill="#475569" />

        {/* Rear Wheel Arch & Wheel */}
        <path d="M 85 185 A 25 25 0 0 1 135 185" fill="#0F172A" />
        <circle cx="110" cy="185" r="22" fill="url(#wheelRubber)" stroke="#0F172A" strokeWidth="2" />
        <circle cx="110" cy="185" r="12" fill="#94A3B8" />
        <circle cx="110" cy="185" r="5" fill="#475569" />

        {/* Front Wheel Arch & Wheel */}
        <path d="M 230 185 A 25 25 0 0 1 280 185" fill="#0F172A" />
        <circle cx="255" cy="185" r="22" fill="url(#wheelRubber)" stroke="#0F172A" strokeWidth="2" />
        <circle cx="255" cy="185" r="12" fill="#94A3B8" />
        <circle cx="255" cy="185" r="5" fill="#475569" />

        {/* Text "AMBULANCE 108" */}
        <text x="80" y="159" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1.5">
          AMBULANCE 108
        </text>
      </svg>
    </div>
  );
};
