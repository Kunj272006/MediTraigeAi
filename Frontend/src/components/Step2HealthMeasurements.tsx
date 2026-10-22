import React from 'react';
import type { VitalsData } from '../types';
import { Activity, Heart, Thermometer, Wind, Droplets } from 'lucide-react';

interface Step2Props {
  data: VitalsData;
  onChange: (updates: Partial<VitalsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2HealthMeasurements: React.FC<Step2Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-charcoal-900 leading-tight">
          Current Health Measurements
        </h1>
        <p className="text-sm text-charcoal-600 mt-2">
          If you have these readings, please enter them. If not, you can select <span className="font-semibold text-charcoal-800">"Not measured"</span>.
        </p>
      </div>

      {/* 6 Measurement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Blood Pressure */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal-700 tracking-wide uppercase">
                Blood Pressure (mmHg)
              </span>
              <Activity className="w-4 h-4 text-forest-700" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] text-charcoal-400 font-medium uppercase mb-1 block">
                  Systolic
                </label>
                <input
                  type="number"
                  disabled={!data.isBpMeasured}
                  value={data.systolicBp ?? ''}
                  onChange={(e) =>
                    onChange({
                      systolicBp: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="120"
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm font-semibold disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-charcoal-400 font-medium uppercase mb-1 block">
                  Diastolic
                </label>
                <input
                  type="number"
                  disabled={!data.isBpMeasured}
                  value={data.diastolicBp ?? ''}
                  onChange={(e) =>
                    onChange({
                      diastolicBp: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="80"
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm font-semibold disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-charcoal-100 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-700">
              <input
                type="radio"
                name="bp-toggle"
                checked={data.isBpMeasured}
                onChange={() => onChange({ isBpMeasured: true })}
                className="text-forest-800 focus:ring-forest-800 accent-forest-800"
              />
              <span>Measured</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-500">
              <input
                type="radio"
                name="bp-toggle"
                checked={!data.isBpMeasured}
                onChange={() =>
                  onChange({ isBpMeasured: false, systolicBp: null, diastolicBp: null })
                }
                className="text-forest-800 focus:ring-forest-800 accent-forest-800"
              />
              <span>Not measured</span>
            </label>
          </div>
        </div>

        {/* 2. Heart Rate */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal-700 tracking-wide uppercase">
                Heart Rate
              </span>
              <Heart className="w-4 h-4 text-forest-700" />
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="number"
                  disabled={!data.isHeartRateMeasured}
                  value={data.heartRate ?? ''}
                  onChange={(e) =>
                    onChange({
                      heartRate: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="72"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm font-semibold disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
                <span className="absolute right-4 top-3 text-xs text-charcoal-400 font-medium">
                  bpm
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-charcoal-100 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-700">
              <input
                type="radio"
                name="hr-toggle"
                checked={data.isHeartRateMeasured}
                onChange={() => onChange({ isHeartRateMeasured: true })}
                className="accent-forest-800"
              />
              <span>Measured</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-500">
              <input
                type="radio"
                name="hr-toggle"
                checked={!data.isHeartRateMeasured}
                onChange={() => onChange({ isHeartRateMeasured: false, heartRate: null })}
                className="accent-forest-800"
              />
              <span>Not measured</span>
            </label>
          </div>
        </div>

        {/* 3. Temperature */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal-700 tracking-wide uppercase">
                Temperature
              </span>
              <Thermometer className="w-4 h-4 text-forest-700" />
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  disabled={!data.isTempMeasured}
                  value={data.temperature ?? ''}
                  onChange={(e) =>
                    onChange({
                      temperature: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="36.8"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm font-semibold disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
                <span className="absolute right-4 top-3 text-xs text-charcoal-400 font-medium">
                  °C
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-charcoal-100 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-700">
              <input
                type="radio"
                name="temp-toggle"
                checked={data.isTempMeasured}
                onChange={() => onChange({ isTempMeasured: true })}
                className="accent-forest-800"
              />
              <span>Measured</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-500">
              <input
                type="radio"
                name="temp-toggle"
                checked={!data.isTempMeasured}
                onChange={() => onChange({ isTempMeasured: false, temperature: null })}
                className="accent-forest-800"
              />
              <span>Not measured</span>
            </label>
          </div>
        </div>

        {/* 4. Oxygen Saturation (SpO2) */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal-700 tracking-wide uppercase">
                Oxygen Saturation (SpO₂)
              </span>
              <Activity className="w-4 h-4 text-forest-700" />
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="100"
                  disabled={!data.isSpo2Measured}
                  value={data.oxygenSaturation ?? ''}
                  onChange={(e) =>
                    onChange({
                      oxygenSaturation: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="98"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm font-semibold disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
                <span className="absolute right-4 top-3 text-xs text-charcoal-400 font-medium">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-charcoal-100 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-700">
              <input
                type="radio"
                name="spo2-toggle"
                checked={data.isSpo2Measured}
                onChange={() => onChange({ isSpo2Measured: true })}
                className="accent-forest-800"
              />
              <span>Measured</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-500">
              <input
                type="radio"
                name="spo2-toggle"
                checked={!data.isSpo2Measured}
                onChange={() => onChange({ isSpo2Measured: false, oxygenSaturation: null })}
                className="accent-forest-800"
              />
              <span>Not measured</span>
            </label>
          </div>
        </div>

        {/* 5. Respiratory Rate */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal-700 tracking-wide uppercase">
                Respiratory Rate
              </span>
              <Wind className="w-4 h-4 text-forest-700" />
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="number"
                  disabled={!data.isRespRateMeasured}
                  value={data.respiratoryRate ?? ''}
                  onChange={(e) =>
                    onChange({
                      respiratoryRate: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="16"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm font-semibold disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
                <span className="absolute right-4 top-3 text-xs text-charcoal-400 font-medium">
                  breaths/min
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-charcoal-100 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-700">
              <input
                type="radio"
                name="resp-toggle"
                checked={data.isRespRateMeasured}
                onChange={() => onChange({ isRespRateMeasured: true })}
                className="accent-forest-800"
              />
              <span>Measured</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-500">
              <input
                type="radio"
                name="resp-toggle"
                checked={!data.isRespRateMeasured}
                onChange={() => onChange({ isRespRateMeasured: false, respiratoryRate: null })}
                className="accent-forest-800"
              />
              <span>Not measured</span>
            </label>
          </div>
        </div>

        {/* 6. Blood Sugar */}
        <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal-700 tracking-wide uppercase">
                Blood Sugar (if available)
              </span>
              <Droplets className="w-4 h-4 text-forest-700" />
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="number"
                  disabled={!data.isSugarMeasured}
                  value={data.bloodSugar ?? ''}
                  onChange={(e) =>
                    onChange({
                      bloodSugar: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="120"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-sm font-semibold disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                />
                <span className="absolute right-4 top-3 text-xs text-charcoal-400 font-medium">
                  mg/dL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-charcoal-100 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-700">
              <input
                type="radio"
                name="sugar-toggle"
                checked={data.isSugarMeasured}
                onChange={() => onChange({ isSugarMeasured: true })}
                className="accent-forest-800"
              />
              <span>Measured</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-500">
              <input
                type="radio"
                name="sugar-toggle"
                checked={!data.isSugarMeasured}
                onChange={() => onChange({ isSugarMeasured: false, bloodSugar: null })}
                className="accent-forest-800"
              />
              <span>Not measured</span>
            </label>
          </div>
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
          onClick={onNext}
          className="px-7 py-2.5 rounded-full bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 shadow-sm transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
