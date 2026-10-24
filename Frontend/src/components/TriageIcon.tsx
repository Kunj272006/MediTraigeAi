import React from 'react';
import type { TriageCategory } from '../types';
import { Siren, Zap, Stethoscope, HeartOff } from 'lucide-react';

interface TriageIconProps {
  category: TriageCategory;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  badge?: boolean;
}

export const TriageIcon: React.FC<TriageIconProps> = ({
  category,
  size = 'md',
  className = '',
  badge = true
}) => {
  const containerSizes = {
    xs: 'w-5 h-5 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl'
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  if (!badge) {
    switch (category) {
      case 'RED':
        return <Siren className={`${iconSizes} text-rose-600 shrink-0 ${className}`} />;
      case 'YELLOW':
        return <Zap className={`${iconSizes} text-amber-600 shrink-0 ${className}`} />;
      case 'GREEN':
        return <Stethoscope className={`${iconSizes} text-emerald-600 shrink-0 ${className}`} />;
      case 'BLACK':
        return <HeartOff className={`${iconSizes} text-slate-700 shrink-0 ${className}`} />;
      default:
        return null;
    }
  }

  switch (category) {
    case 'RED':
      return (
        <div className={`${containerSizes} bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0 shadow-xs ${className}`}>
          <Siren className={`${iconSizes} animate-pulse`} />
        </div>
      );
    case 'YELLOW':
      return (
        <div className={`${containerSizes} bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 shadow-xs ${className}`}>
          <Zap className={`${iconSizes}`} />
        </div>
      );
    case 'GREEN':
      return (
        <div className={`${containerSizes} bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs ${className}`}>
          <Stethoscope className={`${iconSizes}`} />
        </div>
      );
    case 'BLACK':
      return (
        <div className={`${containerSizes} bg-slate-500/10 border border-slate-500/20 text-slate-700 flex items-center justify-center shrink-0 shadow-xs ${className}`}>
          <HeartOff className={`${iconSizes}`} />
        </div>
      );
    default:
      return null;
  }
};
