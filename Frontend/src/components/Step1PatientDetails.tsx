import React, { useEffect } from 'react';
import type { PatientDetailsData } from '../types';
import { Calendar, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface Step1Props {
  data: PatientDetailsData;
  onChange: (updates: Partial<PatientDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const LOCATIONS = [
  'Dehradun, Uttarakhand',
  'Rishikesh, Uttarakhand',
  'Haridwar, Uttarakhand',
  'Delhi NCR, India',
  'Chandigarh, India',
  'Jaipur, Rajasthan',
  'Other Location'
];

export const Step1PatientDetails: React.FC<Step1Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  // Automatically calculate age when DOB fields change
  useEffect(() => {
    if (data.dobYear && data.dobYear.length === 4) {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(data.dobYear, 10);
      if (!isNaN(birthYear) && birthYear >= 1900 && birthYear <= currentYear) {
        const calculatedAge = currentYear - birthYear;
        if (calculatedAge !== data.age) {
          onChange({ age: calculatedAge });
        }
      }
    }
  }, [data.dobYear, data.dobMonth, data.dobDay, data.age, onChange]);

  const isValid =
    data.fullName.trim().length >= 2 &&
    data.dobDay &&
    data.dobMonth &&
    data.dobYear.length === 4 &&
    data.contactNumber.trim().length >= 10 &&
    data.location;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-charcoal-900 leading-tight">
          Tell us about yourself
        </h1>
        <p className="text-sm text-charcoal-600 mt-2">
          This helps us provide a more accurate assessment.
        </p>
      </div>

      <div className="space-y-6 bg-white border border-charcoal-200/80 rounded-2xl p-6 sm:p-8 shadow-apple">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-charcoal-700 tracking-wide uppercase mb-2">
            Full Name <span className="text-triage-red">*</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g. Aarav Singh"
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 placeholder:text-charcoal-400 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all"
          />
        </div>

        {/* DOB and Age */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-charcoal-700 tracking-wide uppercase mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest-800" />
              <span>Date of Birth <span className="text-triage-red">*</span></span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                max="31"
                value={data.dobDay}
                onChange={(e) => onChange({ dobDay: e.target.value })}
                placeholder="Day"
                className="w-full px-3 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm text-center focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
              <select
                value={data.dobMonth}
                onChange={(e) => onChange({ dobMonth: e.target.value })}
                className="w-full px-3 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={data.dobYear}
                onChange={(e) => onChange({ dobYear: e.target.value })}
                placeholder="Year"
                className="w-full px-3 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm text-center focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 tracking-wide uppercase mb-2">
              Age
            </label>
            <div className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-100 text-charcoal-900 text-sm font-semibold flex items-center justify-between">
              <span>{data.age ? `${data.age} years` : '—'}</span>
              <span className="text-[10px] text-charcoal-400 uppercase font-normal">Calculated</span>
            </div>
          </div>
        </div>

        {/* Sex */}
        <div>
          <label className="block text-xs font-bold text-charcoal-700 tracking-wide uppercase mb-2">
            Sex <span className="text-triage-red">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Male', 'Female', 'Other'] as const).map((genderOption) => {
              const selected = data.gender === genderOption;
              return (
                <button
                  type="button"
                  key={genderOption}
                  onClick={() => onChange({ gender: genderOption })}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    selected
                      ? 'border-forest-800 bg-forest-50 text-forest-900 font-semibold shadow-subtle ring-1 ring-forest-800'
                      : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-700 bg-ivory-50'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selected ? 'border-forest-800' : 'border-charcoal-300'
                    }`}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-forest-800" />}
                  </span>
                  <span>{genderOption}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-xs font-bold text-charcoal-700 tracking-wide uppercase mb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-forest-800" />
            <span>Contact Number <span className="text-triage-red">*</span></span>
          </label>
          <div className="flex gap-2">
            <div className="px-3.5 py-3 rounded-xl border border-charcoal-200 bg-ivory-200 text-charcoal-800 text-sm font-semibold flex items-center gap-1 shrink-0">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={data.contactNumber}
              onChange={(e) => onChange({ contactNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="98765 43210"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-charcoal-700 tracking-wide uppercase mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-forest-800" />
            <span>Location <span className="text-triage-red">*</span></span>
          </label>
          <select
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 flex items-center gap-2 text-xs text-charcoal-500">
          <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
          <span>We will only use this information for registration and care-related communication.</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className="px-7 py-2.5 rounded-full bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
