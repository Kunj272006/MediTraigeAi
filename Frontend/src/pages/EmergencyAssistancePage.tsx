import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AmbulanceIllustration } from '../components/AmbulanceIllustration';
import {
  Phone,
  Info,
  Mic,
  MicOff,
  AlertOctagon
} from 'lucide-react';

export const EmergencyAssistancePage: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleVoiceToggle = () => {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechClass) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (e: any) => {
        const text = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleRequestAmbulance = () => {
    setRequestSent(true);
    setTimeout(() => {
      navigate('/jeevan');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-red-500/20 selection:text-red-900 font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex flex-col justify-center w-full">
        
        {/* Main Card (Matching Screen 5) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-slate-200/80 shadow-sm relative overflow-hidden">
          
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-bl from-rose-100/40 via-red-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Heading Section */}
          <div className="mb-8 relative z-10">
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Emergency Assistance
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl">
              Quick access to emergency services when every second matters.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Left Column: Helpline, Status, and Action CTA */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Emergency Helpline Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                    <Phone className="w-6 h-6 fill-red-600 text-red-600" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                      Emergency Helpline
                    </span>
                    <span className="font-sans text-3xl sm:text-4xl font-extrabold text-red-600 tracking-tight block">
                      108
                    </span>
                  </div>
                </div>

                <div className="sm:border-l sm:border-slate-200 sm:pl-6 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">Ambulance Service</span>
                  </div>
                  <span className="text-xs text-slate-500 block">Available 24/7 across city</span>
                </div>
              </div>

              {/* Primary Action Button: Request Ambulance */}
              <div>
                <button
                  type="button"
                  onClick={handleRequestAmbulance}
                  disabled={requestSent}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#D93829] hover:bg-[#C02F21] text-white text-base font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <AlertOctagon className="w-5 h-5 text-white" />
                  <span>{requestSent ? 'Connecting to Dispatch...' : 'Request Ambulance →'}</span>
                </button>
              </div>

              {/* Voice Emergency Input Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Need to speak your emergency?
                  </span>
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? 'Listening...' : 'Tap to Speak'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  {transcript || (isRecording ? 'Listening for your emergency...' : 'State your location and symptoms clearly.')}
                </p>
              </div>

              {/* Info Notice (Matching Exact Mockup Bottom Blue Strip) */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/60 flex items-center gap-3 text-xs text-blue-900">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <span>In case of a life-threatening emergency, please call 108 immediately.</span>
              </div>

            </div>

            {/* Right Column: Clean Ambulance Graphic (Pristine High-Resolution Vector) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <AmbulanceIllustration className="w-80 sm:w-96 h-64 sm:h-80" />
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
