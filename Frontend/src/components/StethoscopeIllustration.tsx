import React from 'react';

export const StethoscopeIllustration: React.FC<{ className?: string }> = ({ className = 'w-72 h-72' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Soft mint/emerald ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-100/60 via-emerald-50/50 to-teal-50/30 blur-xl" />
      
      {/* Pristine high-precision medical stethoscope vector */}
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-md select-none"
      >
        <defs>
          <linearGradient id="metallicTube" x1="40" y1="60" x2="280" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B3B36" />
            <stop offset="50%" stopColor="#138A72" />
            <stop offset="100%" stopColor="#082A24" />
          </linearGradient>

          <linearGradient id="metalChrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="45%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="chestpieceGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.05" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0B3B36" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Ambient background ring */}
        <circle cx="160" cy="160" r="135" fill="url(#chestpieceGlow)" />
        <circle cx="160" cy="160" r="135" stroke="#138A72" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Coiled Flexible Tubing (Smooth Bezier) */}
        <path
          d="M 125 78 C 125 140, 110 230, 175 240 C 240 248, 255 175, 205 155 C 160 138, 145 195, 185 210 C 215 220, 225 200, 220 185"
          stroke="url(#metallicTube)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />

        {/* Highlight sheen along tubing */}
        <path
          d="M 126 82 C 126 138, 112 226, 175 236 C 235 244, 251 177, 204 158"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />

        {/* Binaural Metal Spring & Y-Joint */}
        <path
          d="M 98 90 C 105 78, 145 78, 152 90"
          stroke="url(#metalChrome)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Left Binaural Tube */}
        <path
          d="M 98 90 C 95 60, 92 40, 85 28"
          stroke="url(#metalChrome)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Left Earpiece */}
        <ellipse cx="84" cy="26" rx="6" ry="8" fill="#0B3B36" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Right Binaural Tube */}
        <path
          d="M 152 90 C 155 60, 158 40, 165 28"
          stroke="url(#metalChrome)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Right Earpiece */}
        <ellipse cx="166" cy="26" rx="6" ry="8" fill="#0B3B36" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Y-Connector Block */}
        <rect x="120" y="80" width="10" height="14" rx="3" fill="url(#metalChrome)" stroke="#94A3B8" strokeWidth="1" />

        {/* Chestpiece Assembly (Floating in Foreground) */}
        <g transform="translate(205, 155) rotate(-15)" filter="url(#softGlow)">
          {/* Stem */}
          <path d="M 0 0 L 15 -8" stroke="url(#metalChrome)" strokeWidth="8" strokeLinecap="round" />
          
          {/* Base Rim */}
          <circle cx="28" cy="-14" r="28" fill="url(#metalChrome)" stroke="#94A3B8" strokeWidth="1.5" />
          
          {/* Diaphragm Rim */}
          <circle cx="28" cy="-14" r="23" fill="#0B3B36" />
          <circle cx="28" cy="-14" r="20" fill="#138A72" fillOpacity="0.2" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.4" />
          
          {/* Center Sound Hub */}
          <circle cx="28" cy="-14" r="9" fill="url(#metalChrome)" />
          <circle cx="28" cy="-14" r="4" fill="#0B3B36" />

          {/* Diaphragm Glass Glare */}
          <path
            d="M 12 -22 A 20 20 0 0 1 44 -22"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </g>

        {/* Subtle floating heartbeat pulse wave */}
        <path
          d="M 35 275 L 60 275 L 70 260 L 80 290 L 90 270 L 100 280 L 110 275 L 140 275"
          stroke="#138A72"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  );
};
