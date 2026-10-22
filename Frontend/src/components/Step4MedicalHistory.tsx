import React, { useState } from 'react';
import type { MedicalHistoryData } from '../types';
import { UploadCloud, X, FileText } from 'lucide-react';

interface Step4Props {
  data: MedicalHistoryData;
  onChange: (updates: Partial<MedicalHistoryData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const COMMON_CONDITIONS = [
  'Diabetes (Type 2)',
  'Hypertension',
  'Asthma',
  'Thyroid Disorder',
  'Heart Disease',
  'Kidney Disease',
  'None'
];

export const Step4MedicalHistory: React.FC<Step4Props> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [medInput, setMedInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  const toggleCondition = (cond: string) => {
    if (cond === 'None') {
      onChange({ conditions: ['None'] });
      return;
    }
    const current = (data.conditions || []).filter((c) => c !== 'None');
    if (current.includes(cond)) {
      onChange({ conditions: current.filter((c) => c !== cond) });
    } else {
      onChange({ conditions: [...current, cond] });
    }
  };

  const addMedication = () => {
    if (!medInput.trim()) return;
    onChange({
      medications: [...(data.medications || []), medInput.trim()],
      noMedications: false,
    });
    setMedInput('');
  };

  const removeMedication = (index: number) => {
    const updated = [...(data.medications || [])];
    updated.splice(index, 1);
    onChange({ medications: updated });
  };

  const addAllergy = () => {
    if (!allergyInput.trim()) return;
    onChange({
      allergies: [...(data.allergies || []), allergyInput.trim()],
      noAllergies: false,
    });
    setAllergyInput('');
  };

  const removeAllergy = (index: number) => {
    const updated = [...(data.allergies || [])];
    updated.splice(index, 1);
    onChange({ allergies: updated });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs = Array.from(files).map((f) => ({
      id: Math.random().toString(36).substring(7),
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.type,
    }));

    onChange({
      uploadedDocuments: [...(data.uploadedDocuments || []), ...newDocs],
    });
  };

  const removeDoc = (id: string) => {
    onChange({
      uploadedDocuments: (data.uploadedDocuments || []).filter((d) => d.id !== id),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-charcoal-900 leading-tight">
          Relevant Medical History
        </h1>
        <p className="text-sm text-charcoal-600 mt-2">
          This information helps us understand your overall health better.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conditions, Meds, Allergies (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Conditions */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple">
            <span className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase block mb-3">
              Existing Medical Conditions
            </span>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_CONDITIONS.map((cond) => {
                const isSelected = (data.conditions || []).includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-forest-800 text-ivory-100 font-semibold shadow-sm'
                        : 'bg-ivory-100 border border-charcoal-200 text-charcoal-700 hover:bg-ivory-200'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple space-y-3">
            <span className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase block">
              Current Medications
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                disabled={data.noMedications}
                value={medInput}
                onChange={(e) => setMedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                placeholder="e.g. Metformin 500mg, Amlodipine 5mg..."
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-xs disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
              <button
                type="button"
                disabled={data.noMedications || !medInput.trim()}
                onClick={addMedication}
                className="px-4 py-2 rounded-xl bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {data.medications && data.medications.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.medications.map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-xs font-semibold text-forest-900"
                  >
                    <span>{m}</span>
                    <button type="button" onClick={() => removeMedication(idx)}>
                      <X className="w-3 h-3 text-forest-700 hover:text-triage-red" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <label className="flex items-center gap-2 pt-2 border-t border-charcoal-100 text-xs text-charcoal-600 cursor-pointer">
              <input
                type="checkbox"
                checked={data.noMedications}
                onChange={(e) =>
                  onChange({
                    noMedications: e.target.checked,
                    medications: e.target.checked ? [] : data.medications,
                  })
                }
                className="rounded text-forest-800 accent-forest-800"
              />
              <span>I do not take any regular medications</span>
            </label>
          </div>

          {/* Allergies */}
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple space-y-3">
            <span className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase block">
              Allergies
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                disabled={data.noAllergies}
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                placeholder="e.g. Penicillin, Sulfa, Dust, Peanuts..."
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory-50 text-charcoal-900 text-xs disabled:bg-charcoal-100 disabled:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
              />
              <button
                type="button"
                disabled={data.noAllergies || !allergyInput.trim()}
                onClick={addAllergy}
                className="px-4 py-2 rounded-xl bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {data.allergies && data.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.allergies.map((a, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ivory-200 border border-charcoal-200 text-xs font-semibold text-charcoal-800"
                  >
                    <span>{a}</span>
                    <button type="button" onClick={() => removeAllergy(idx)}>
                      <X className="w-3 h-3 text-charcoal-500 hover:text-triage-red" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <label className="flex items-center gap-2 pt-2 border-t border-charcoal-100 text-xs text-charcoal-600 cursor-pointer">
              <input
                type="checkbox"
                checked={data.noAllergies}
                onChange={(e) =>
                  onChange({
                    noAllergies: e.target.checked,
                    allergies: e.target.checked ? ['No known allergies'] : [],
                  })
                }
                className="rounded text-forest-800 accent-forest-800"
              />
              <span>I have no known allergies</span>
            </label>
          </div>
        </div>

        {/* Right Column: Document Upload (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-charcoal-700 tracking-wide uppercase block mb-4 self-start">
              Upload Documents (optional)
            </span>

            <div className="w-full border-2 border-dashed border-charcoal-300 hover:border-forest-700/60 rounded-2xl p-6 transition-colors bg-ivory-50 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-charcoal-800 max-w-xs mb-1">
                Upload prescription, medical reports or other relevant documents.
              </p>
              <p className="text-[10px] text-charcoal-400 mb-4">JPG, PNG, PDF (Max 10MB)</p>

              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-800 hover:bg-white hover:border-charcoal-400 transition-all shadow-subtle">
                <span>Choose Files</span>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* List of uploaded documents */}
            {data.uploadedDocuments && data.uploadedDocuments.length > 0 && (
              <div className="w-full mt-4 space-y-2 text-left">
                <span className="text-[10px] uppercase font-bold text-charcoal-500 block">
                  Attached Files ({data.uploadedDocuments.length})
                </span>
                {data.uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-charcoal-200 bg-ivory-100 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-forest-700 shrink-0" />
                      <span className="truncate text-charcoal-800 font-medium">{doc.name}</span>
                      <span className="text-[10px] text-charcoal-400 shrink-0">{doc.size}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="text-charcoal-400 hover:text-triage-red ml-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
