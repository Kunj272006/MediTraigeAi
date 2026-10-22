import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  'Patient Details',
  'Health Measurements',
  'Symptoms',
  'Medical History',
  'Review'
];

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="relative flex items-center justify-between">
        {/* Connecting Line Track */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-charcoal-200 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-forest-800 transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
        />

        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={label}
              className="relative z-10 flex flex-col items-center cursor-pointer group"
              onClick={() => onStepClick && stepNum <= currentStep && onStepClick(stepNum)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-forest-800 text-ivory-100 ring-4 ring-forest-100 shadow-sm scale-110'
                    : isCompleted
                    ? 'bg-forest-800 text-ivory-100'
                    : 'bg-ivory-100 border-2 border-charcoal-300 text-charcoal-500 group-hover:border-charcoal-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : stepNum}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium tracking-tight text-center hidden sm:block ${
                  isActive
                    ? 'text-charcoal-900 font-bold'
                    : isCompleted
                    ? 'text-charcoal-700'
                    : 'text-charcoal-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile label display */}
      <div className="sm:hidden text-center mt-3 text-xs font-semibold text-charcoal-800">
        Step {currentStep} of {STEP_LABELS.length}: {STEP_LABELS[currentStep - 1]}
      </div>
    </div>
  );
};
