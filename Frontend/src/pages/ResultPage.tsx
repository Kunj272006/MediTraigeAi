import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getEncounters } from '../lib/store';
import {
  AlertTriangle,
  Download,
  RotateCcw,
  Copy,
  Check,
  Building2,
  ArrowRight
} from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const encounters = getEncounters();
  const encounter = encounters.find((e) => e.id === id) || encounters[0];

  const handleCopyUHID = () => {
    if (encounter?.uhid) {
      navigator.clipboard.writeText(encounter.uhid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isRed = encounter.category === 'RED';
  const isYellow = encounter.category === 'YELLOW';

  const categoryColorClass = isRed
    ? 'text-triage-red'
    : isYellow
    ? 'text-triage-yellow'
    : 'text-triage-green';

  const dotColorClass = isRed
    ? 'bg-triage-red ring-triage-red-light'
    : isYellow
    ? 'bg-triage-yellow ring-triage-yellow-light'
    : 'bg-triage-green ring-triage-green-light';

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full animate-in fade-in duration-300">
        {/* Triage Result Badge */}
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-widest text-charcoal-400 uppercase">
            Triage Result
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Result & Urgent Banner (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Result Headline */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-4 h-4 rounded-full ring-8 shrink-0 ${dotColorClass}`} />
                <h1 className={`font-serif text-4xl sm:text-5xl font-medium tracking-tight ${categoryColorClass}`}>
                  {encounter.triageLabel}
                </h1>
              </div>

              <h2 className="font-serif text-2xl font-normal text-charcoal-900 mt-3 leading-snug">
                {encounter.plainLanguageSummary}
              </h2>
              <p className="text-xs text-charcoal-500 mt-2">
                This is a preliminary triage assessment based on the information provided.
              </p>
            </div>

            {/* Red Emergency Guidance Callout Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-triage-red-light border border-triage-red-border text-charcoal-900 flex items-start gap-3.5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-triage-red/10 text-triage-red flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-triage-red block mb-0.5">
                  If your condition worsens
                </span>
                e.g. severe breathing difficulty, sudden chest pain, confusion, or collapse, seek immediate medical help or call emergency services (<strong>108 / 112</strong>).
              </div>
            </div>

            {/* Encounter Meta Card */}
            <div className="bg-white border border-charcoal-200/90 rounded-2xl p-5 shadow-apple space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-charcoal-100 pb-2.5">
                <span className="text-charcoal-500 font-medium">Patient UHID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal-900 text-sm">
                    {encounter.uhid}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUHID}
                    className="p-1 rounded-md hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-800 transition-colors"
                    title="Copy UHID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-forest-700" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                    Patient Name
                  </span>
                  <span className="font-semibold text-charcoal-800">
                    {encounter.patientName} ({encounter.age}y, {encounter.gender})
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                    Encounter No.
                  </span>
                  <span className="font-mono font-semibold text-charcoal-800">
                    {encounter.encounterNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Next Steps & Hospital Desk (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Next Steps Card */}
            <div className="bg-white border border-charcoal-200/90 rounded-2xl p-6 shadow-apple space-y-5">
              <h3 className="font-serif text-xl font-medium text-charcoal-900">
                Next Steps
              </h3>

              <div className="space-y-4 text-xs">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-50 border border-forest-100 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-charcoal-900">
                      {isRed
                        ? 'Proceed to Emergency Desk immediately'
                        : isYellow
                        ? 'Visit a doctor within a few hours'
                        : 'Routine doctor consultation'}
                    </h4>
                    <p className="text-charcoal-500 mt-0.5 leading-normal">
                      {encounter.recommendedAction}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-50 border border-forest-100 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-charcoal-900">
                      Share this summary
                    </h4>
                    <p className="text-charcoal-500 mt-0.5 leading-normal">
                      Show your UHID (<strong className="font-mono text-charcoal-800">{encounter.uhid}</strong>) to the hospital reception desk.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-50 border border-forest-100 text-forest-800 font-semibold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-charcoal-900">
                      Monitor your symptoms
                    </h4>
                    <p className="text-charcoal-500 mt-0.5 leading-normal">
                      If your symptoms worsen or you develop difficulty breathing, notify triage staff immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2.5 px-4 rounded-full border border-charcoal-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Summary</span>
                </button>

                <Link
                  to="/assess"
                  className="w-full py-2.5 px-4 rounded-full bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Assessment</span>
                </Link>
              </div>
            </div>

            {/* Quick link to staff dashboard to test review */}
            <div className="p-4 rounded-2xl bg-ivory-200/60 border border-charcoal-200 text-xs text-charcoal-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-forest-800" />
                <span>Simulate Hospital Triage View</span>
              </div>
              <Link
                to={`/staff/encounter/${encounter.id}`}
                className="text-forest-800 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Open in Queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-charcoal-400">
        MEDITRIAGE AI • Validated Preliminary Clinical Protocol • Encrypted Healthcare Session
      </footer>
    </div>
  );
};
