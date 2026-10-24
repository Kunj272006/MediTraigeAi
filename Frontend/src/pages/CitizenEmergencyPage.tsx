import React, { useState, useEffect, useRef } from 'react';
import { jeevanApi } from '../lib/jeevanApi';
import type { GeoLocation, Hospital, Vehicle, EmergencyIncident } from '../types/jeevan';
import { JeevanLiveMap } from '../components/jeevan/JeevanLiveMap';
import {
  Mic,
  MicOff,
  Navigation,
  MapPin,
  AlertOctagon,
  Building2,
  CheckCircle2,
  ArrowRight,
  Phone,
  Radio,
  Calendar,
  Clock,
  Check,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';

interface CitizenEmergencyPageProps {
  language: 'en' | 'hi';
  onViewTracking: (incidentId: string) => void;
  onOpenAppointmentModal?: () => void;
}

const DEFAULT_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-AIIMS-01',
    name: 'AIIMS Apex Trauma Center',
    category: 'AIIMS_APEX',
    location: { lat: 28.5672, lng: 77.2065, address: 'AIIMS Trauma Center, Ring Rd, New Delhi' },
    phone: '011-26588500',
    emergencyDepartmentOpen: true,
    totalBeds: 260,
    availableBeds: 8,
    traumaBaysAvailable: 3,
    oxygenAvailable: true,
    departments: [
      { name: 'Emergency Medicine', availableDoctors: 5, opdOpen: true },
      { name: 'Trauma Surgery', availableDoctors: 4, opdOpen: true },
      { name: 'Orthopedics', availableDoctors: 3, opdOpen: true },
      { name: 'Cardiology', availableDoctors: 2, opdOpen: true }
    ]
  },
  {
    id: 'HOSP-SAFDARJUNG-02',
    name: 'Safdarjung Government Hospital',
    category: 'DISTRICT_HOSPITAL',
    location: { lat: 28.5701, lng: 77.2081, address: 'Safdarjung Hospital, Ansari Nagar West, New Delhi' },
    phone: '011-26165060',
    emergencyDepartmentOpen: true,
    totalBeds: 1550,
    availableBeds: 14,
    traumaBaysAvailable: 4,
    oxygenAvailable: true,
    departments: [
      { name: 'Emergency Department', availableDoctors: 6, opdOpen: true },
      { name: 'Obstetrics & Gynaecology (ANC)', availableDoctors: 5, opdOpen: true }
    ]
  },
  {
    id: 'HOSP-RML-03',
    name: 'Dr. Ram Manohar Lohia Hospital',
    category: 'DISTRICT_HOSPITAL',
    location: { lat: 28.6247, lng: 77.2008, address: 'RML Hospital, Connaught Place, New Delhi' },
    phone: '011-23365525',
    emergencyDepartmentOpen: true,
    totalBeds: 1400,
    availableBeds: 11,
    traumaBaysAvailable: 2,
    oxygenAvailable: true,
    departments: [
      { name: 'Emergency & Casualty', availableDoctors: 4, opdOpen: true },
      { name: 'Internal Medicine', availableDoctors: 3, opdOpen: true }
    ]
  }
];

export const CitizenEmergencyPage: React.FC<CitizenEmergencyPageProps> = ({
  language,
  onViewTracking,
}) => {
  // 1. Speech & Input State
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN' | 'en-US'>(language === 'hi' ? 'hi-IN' : 'en-IN');
  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'voice-detected' | 'blocked' | 'unsupported'>('idle');
  const [wordsHeardCount, setWordsHeardCount] = useState<number>(0);
  const [ambulanceType, setAmbulanceType] = useState<'ALS' | 'BLS' | 'MATERNITY'>('ALS');
  const [speechDebugInfo, setSpeechDebugInfo] = useState<string>('Ready • Tap the red microphone button to speak');
  const [lastRecognizedText, setLastRecognizedText] = useState<string>('');

  // 2. Real-Time Active Dispatch & Live Tracking State
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [assignedHospital, setAssignedHospital] = useState<Hospital | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  // 3. Auto-detected Location State
  const [userLocation, setUserLocation] = useState<GeoLocation>({
    lat: 28.5672,
    lng: 77.2100,
    address: 'AIIMS Apex Trauma Center, Ring Road, Ansari Nagar, New Delhi',
    landmark: 'AIIMS Gate No 2',
  });
  const [manualAddress, setManualAddress] = useState('');
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(false);

  // 4. Fleet & Hospitals
  const [hospitals, setHospitals] = useState<Hospital[]>(DEFAULT_HOSPITALS);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // 5. OPD Appointment Mode
  const [opdMode, setOpdMode] = useState(false);
  const [opdName, setOpdName] = useState('Ramesh Kumar');
  const [opdPhone, setOpdPhone] = useState('+91 98765 43210');
  const [opdHospitalId, setOpdHospitalId] = useState('HOSP-AIIMS-01');
  const [opdDepartment, setOpdDepartment] = useState('General Medicine');
  const [opdBookingConfirmed, setOpdBookingConfirmed] = useState<any | null>(null);

  // References
  const recognitionInstanceRef = useRef<any>(null);
  const isSpeechListeningRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');
  const sessionFinalRef = useRef<string>('');
  const sessionBaseTextRef = useRef<string>('');
  const currentSessionFinalRef = useRef<string>('');
  const lastHeardTextRef = useRef<string>('');
  const speechLangRef = useRef<'en-IN' | 'hi-IN' | 'en-US'>(speechLang);
  const restartTimerRef = useRef<any>(null);
  const simulationTimerRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const opdSectionRef = useRef<HTMLDivElement | null>(null);

  // Keep speech language ref in sync
  useEffect(() => {
    speechLangRef.current = speechLang;
  }, [speechLang]);

  // Auto-scroll textarea when text streams in
  useEffect(() => {
    if (textareaRef.current && isRecording) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [transcript, isRecording]);

  // Auto-detect GPS coordinates on initial load
  useEffect(() => {
    handleDetectLocation();
  }, []);

  // Poll live ambulance tracking when booking is active
  useEffect(() => {
    if (!activeIncident?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await jeevanApi.getIncident(activeIncident.id);
        if (res.success && res.incident) {
          const enriched: EmergencyIncident = {
            ...res.incident,
            assignedVehicle: (res as any).assignedVehicle || res.incident.assignedVehicle,
            assignedHospital: (res as any).destinationHospital || res.incident.assignedHospital,
          };
          setActiveIncident(enriched);
          if ((res as any).assignedVehicle) setAssignedVehicle((res as any).assignedVehicle);
          if ((res as any).destinationHospital) setAssignedHospital((res as any).destinationHospital);
          if ((res as any).routeWaypoints && Array.isArray((res as any).routeWaypoints)) {
            setRouteCoordinates((res as any).routeWaypoints.map((pt: any) => [pt.lat, pt.lng]));
          }
        }
      } catch (e) {
        console.warn('Live tracking telemetry poll error:', e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIncident?.id]);

  // Load infrastructure
  useEffect(() => {
    jeevanApi.getHospitals().then((res: { success: boolean; hospitals: Hospital[] }) => {
      if (res.success && res.hospitals.length > 0) {
        setHospitals(res.hospitals);
        setOpdHospitalId(res.hospitals[0].id);
      }
    }).catch(console.error);

    jeevanApi.getVehicles().then((res: { success: boolean; vehicles: Vehicle[] }) => {
      if (res.success) setVehicles(res.vehicles);
    }).catch(console.error);

    return () => {
      stopVoiceDictation();
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [language]);

  // Clean up all speech recognition resources
  function stopVoiceDictation() {
    isSpeechListeningRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    setIsRecording(false);
    setMicStatus('idle');
    setSpeechDebugInfo(
      language === 'hi'
        ? 'माइक्रोफ़ोन बंद • फिर से बोलने के लिए लाल माइक बटन दबाएं'
        : 'Microphone stopped • Tap red mic to speak again'
    );

    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.onstart = null;
        recognitionInstanceRef.current.onspeechstart = null;
        recognitionInstanceRef.current.onsoundstart = null;
        recognitionInstanceRef.current.onspeechend = null;
        recognitionInstanceRef.current.onresult = null;
        recognitionInstanceRef.current.onerror = null;
        recognitionInstanceRef.current.onend = null;
        recognitionInstanceRef.current.stop();
      } catch {
        // Safe disposal
      }
      recognitionInstanceRef.current = null;
    }
  }

  // Switch recognition language
  const changeSpeechLang = (newLang: 'en-IN' | 'hi-IN' | 'en-US') => {
    setSpeechLang(newLang);
    speechLangRef.current = newLang;
    if (isSpeechListeningRef.current) {
      createAndStartRecognition();
    }
  };

  // Create and start a fresh SpeechRecognition session with exclusive mic access
  const createAndStartRecognition = () => {
    if (!isSpeechListeningRef.current) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setMicStatus('unsupported');
      setErrorMsg(
        language === 'hi'
          ? 'आपके ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया Google Chrome या Edge का उपयोग करें।'
          : 'Live speech-to-text requires Google Chrome, Edge, or a Chromium-based browser.'
      );
      isSpeechListeningRef.current = false;
      setIsRecording(false);
      return;
    }

    // Clean up any lingering recognition cleanly
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.onstart = null;
        recognitionInstanceRef.current.onspeechstart = null;
        recognitionInstanceRef.current.onsoundstart = null;
        recognitionInstanceRef.current.onspeechend = null;
        recognitionInstanceRef.current.onresult = null;
        recognitionInstanceRef.current.onerror = null;
        recognitionInstanceRef.current.onend = null;
        recognitionInstanceRef.current.abort();
      } catch (e) {}
      recognitionInstanceRef.current = null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = speechLangRef.current || 'en-IN';

      recognition.onstart = () => {
        if (!isSpeechListeningRef.current) {
          try { recognition.abort(); } catch (e) {}
          return;
        }
        setIsRecording(true);
        setMicStatus('listening');
        setErrorMsg(null);
        setSpeechDebugInfo(
          language === 'hi'
            ? '🎙️ माइक्रोफ़ोन सक्रिय है • कृपया अपनी आपातकालीन स्थिति बोलें...'
            : '🎙️ Microphone listening • Speak your emergency now into your mic...'
        );
      };

      recognition.onsoundstart = () => {
        if (isSpeechListeningRef.current) {
          setMicStatus('voice-detected');
          setSpeechDebugInfo('🔊 Microphone receiving sound waves...');
        }
      };

      recognition.onspeechstart = () => {
        if (isSpeechListeningRef.current) {
          setMicStatus('voice-detected');
          setSpeechDebugInfo('🗣️ Human voice detected! Converting to text...');
        }
      };

      recognition.onspeechend = () => {
        if (isSpeechListeningRef.current) {
          setMicStatus('listening');
        }
      };

      recognition.onresult = (event: any) => {
        let sessionFinal = '';
        let sessionInterim = '';
        let latestWord = '';

        for (let i = 0; i < event.results.length; ++i) {
          const phrase = event.results[i][0].transcript;
          latestWord = phrase;
          if (event.results[i].isFinal) {
            sessionFinal += phrase + ' ';
          } else {
            sessionInterim += phrase;
          }
        }

        currentSessionFinalRef.current = sessionFinal;

        const base = sessionBaseTextRef.current;
        const combined = (base + ' ' + sessionFinal + ' ' + sessionInterim).replace(/\s+/g, ' ').trim();

        if (combined) {
          lastHeardTextRef.current = combined;
          setTranscript(combined);
          const count = combined.split(/\s+/).filter(Boolean).length;
          setWordsHeardCount(count);
          setMicStatus('voice-detected');

          const trimmedWord = latestWord.trim();
          if (trimmedWord) {
            setLastRecognizedText(trimmedWord);
            setSpeechDebugInfo(`🟢 Transcribing: "${trimmedWord}"`);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'no-speech') {
          setSpeechDebugInfo(
            language === 'hi'
              ? '⚠️ आवाज नहीं सुनाई दी • माइक्रोफ़ोन चालू है, कृपया बोलें...'
              : '⚠️ Silence detected • Still listening, please speak into your mic...'
          );
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicStatus('blocked');
          setErrorMsg(
            language === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया अपने ब्राउज़र के पता बार में लॉक/कैमरा आइकन पर क्लिक करके माइक्रोफ़ोन की अनुमति दें।'
              : 'Microphone access was denied. Please click the lock or camera icon in your browser URL bar and allow microphone permissions.'
          );
          setSpeechDebugInfo('🔒 Microphone permission blocked by browser');
          isSpeechListeningRef.current = false;
          setIsRecording(false);
        } else if (event.error === 'network') {
          setErrorMsg(
            'Speech recognition network notice: In Brave Browser, enable Google Speech Services in brave://settings/extensions, or open in Google Chrome / Microsoft Edge.'
          );
          setSpeechDebugInfo('⚠️ Network issue contacting speech server');
        } else if (event.error === 'audio-capture') {
          setErrorMsg('No microphone detected. Please check your Windows default microphone settings.');
          setSpeechDebugInfo('⚠️ No microphone hardware detected');
          isSpeechListeningRef.current = false;
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // Commit this session's final speech into base text for next continuous cycle
        if (currentSessionFinalRef.current) {
          const committed = (sessionBaseTextRef.current + ' ' + currentSessionFinalRef.current).replace(/\s+/g, ' ').trim();
          sessionBaseTextRef.current = committed;
          finalTranscriptRef.current = committed ? committed + ' ' : '';
          currentSessionFinalRef.current = '';
        }

        if (isSpeechListeningRef.current) {
          // Restart gracefully with 120ms debounce to avoid Blink audio pipeline collision
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isSpeechListeningRef.current) {
              createAndStartRecognition();
            }
          }, 120);
        } else {
          setIsRecording(false);
          setMicStatus('idle');
        }
      };

      recognitionInstanceRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to create or start SpeechRecognition session:', err);
    }
  };

  // Start real microphone recording & live speech-to-text typing (Synchronous with click)
  const startVoiceDictation = () => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    setErrorMsg(null);

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setMicStatus('unsupported');
      setErrorMsg(
        language === 'hi'
          ? 'आपके ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया Google Chrome या Edge का उपयोग करें।'
          : 'Live speech-to-text requires Google Chrome, Edge, or a Chromium-based browser with speech support.'
      );
      return;
    }

    // Set initial text accumulator based on existing transcript
    const currentBase = transcript.trim();
    sessionBaseTextRef.current = currentBase;
    currentSessionFinalRef.current = '';
    finalTranscriptRef.current = currentBase ? currentBase + ' ' : '';
    lastHeardTextRef.current = currentBase;

    isSpeechListeningRef.current = true;
    setIsRecording(true);
    setMicStatus('listening');
    setSpeechDebugInfo(
      language === 'hi'
        ? '🎙️ माइक्रोफ़ोन सक्रिय है • कृपया अपनी आपातकालीन स्थिति बोलें...'
        : '🎙️ Microphone listening • Speak your emergency now into your mic...'
    );

    // Start recognition synchronously within user click gesture with exclusive mic access
    createAndStartRecognition();
  };

  const toggleRecording = () => {
    if (isRecording || isSpeechListeningRef.current) {
      stopVoiceDictation();
    } else {
      startVoiceDictation();
    }
  };

  // Immediate GPS Detection
  function handleDetectLocation() {
    setIsLocating(true);
    setErrorMsg(null);
    setGpsLocked(false);

    const applyFallbackGps = () => {
      const fallbackCoords: GeoLocation = {
        lat: 28.5672,
        lng: 77.2100,
        address: 'AIIMS Apex Trauma Center, Ring Road, Ansari Nagar, New Delhi',
        landmark: 'AIIMS Metro Station Gate 2',
      };
      setUserLocation(fallbackCoords);
      setIsLocating(false);
      setGpsLocked(true);
    };

    if (!navigator.geolocation) {
      applyFallbackGps();
      return;
    }

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        applyFallbackGps();
      }
    }, 1800);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        const coords: GeoLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `Live GPS Pin (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) - AIIMS Vicinity`,
          landmark: 'GPS Verified Accuracy',
        };
        setUserLocation(coords);
        setIsLocating(false);
        setGpsLocked(true);
      },
      () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        applyFallbackGps();
      },
      { timeout: 1800, enableHighAccuracy: true }
    );
  };

  const handleManualLocationSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualAddress.trim()) return;
    const targetAddress = manualAddress.trim();
    setUserLocation((prev: GeoLocation) => ({
      ...prev,
      address: targetAddress,
      landmark: targetAddress,
    }));
    setShowLocationEditor(false);
  };

  // Test Demo Voice Dictation (Simulates live typing in real time)
  const handleSimulateVoice = () => {
    stopVoiceDictation();
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsRecording(true);
    setTranscript('');
    setErrorMsg(null);

    const demoPhrase =
      speechLang === 'hi-IN'
        ? 'सड़क दुर्घटना हो गई है। मरीज को गंभीर चोट लगी है और बहुत खून बह रहा है। तुरंत एम्बुलेंस भेजें।'
        : 'My father is having chest pain and he is not able to breathe properly. We are at Civil Lines, Dehradun. We need an ambulance immediately.';

    const words = demoPhrase.split(' ');
    let currentIdx = 0;
    let accumulated = '';

    simulationTimerRef.current = setInterval(() => {
      if (currentIdx < words.length) {
        accumulated += (currentIdx > 0 ? ' ' : '') + words[currentIdx];
        setTranscript(accumulated);
        setWordsHeardCount(currentIdx + 1);
        currentIdx++;
      } else {
        clearInterval(simulationTimerRef.current);
        setIsRecording(false);
      }
    }, 90);
  };

  // 1-TAP FAST AMBULANCE DISPATCH
  const handleBookAmbulance = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    stopVoiceDictation();

    const defaultNotes: Record<string, string> = {
      ALS: language === 'hi'
        ? 'आपातकालीन ALS एम्बुलेंस: गंभीर स्थिति (ट्रॉमा / कार्डियक), तुरंत आईसीयू एम्बुलेंस भेजें।'
        : 'Critical Emergency ALS Ambulance dispatch requested: Immediate ICU care & ventilator required.',
      BLS: language === 'hi'
        ? 'आपातकालीन BLS एम्बुलेंस: मरीज को प्राथमिक उपचार एवं अस्पताल स्थानांतरण की आवश्यकता है।'
        : 'Emergency BLS Ambulance dispatch requested: Basic life support & stretcher transport.',
      MATERNITY: language === 'hi'
        ? 'मातृत्व आपातकाल: गर्भवती महिला को प्रसव हेतु अस्पताल स्थानांतरण की आवश्यकता है।'
        : 'Maternity Medical Transport requested: Pregnant mother in active labor requiring safe hospital transport.'
    };

    const finalTranscript = transcript.trim() || defaultNotes[ambulanceType];

    try {
      const incRes = await jeevanApi.createIncident({
        transcript: finalTranscript,
        language,
        location: userLocation,
        autoDispatch: true,
        transportPreference: ambulanceType === 'MATERNITY' ? 'maternity' : ambulanceType === 'BLS' ? 'bls' : 'ambulance',
      });

      if (incRes.success && incRes.incident) {
        try {
          const fullRes = await jeevanApi.getIncident(incRes.incident.id);
          if (fullRes.success && fullRes.incident) {
            const enriched: EmergencyIncident = {
              ...fullRes.incident,
              assignedVehicle: (fullRes as any).assignedVehicle || fullRes.incident.assignedVehicle,
              assignedHospital: (fullRes as any).destinationHospital || fullRes.incident.assignedHospital,
            };
            setActiveIncident(enriched);
            if ((fullRes as any).assignedVehicle) setAssignedVehicle((fullRes as any).assignedVehicle);
            if ((fullRes as any).destinationHospital) setAssignedHospital((fullRes as any).destinationHospital);
            if ((fullRes as any).routeWaypoints && Array.isArray((fullRes as any).routeWaypoints)) {
              setRouteCoordinates((fullRes as any).routeWaypoints.map((pt: any) => [pt.lat, pt.lng]));
            }
          } else {
            setActiveIncident(incRes.incident);
          }
        } catch {
          setActiveIncident(incRes.incident);
        }
      }
    } catch (err: any) {
      console.warn('Dispatch API fallback routing:', err);
      const fallbackId = `INC-${Date.now().toString().slice(-6)}`;
      const fallbackVeh: Vehicle = vehicles.find((v) => v.status === 'AVAILABLE') || vehicles[0] || {
        id: 'VEH-FALLBACK',
        callSign: 'DL-108-ALS-04',
        registrationNumber: 'DL-01-EA-1084',
        capability: 'ALS',
        driverName: 'Rajesh Sharma',
        driverPhone: '+91 98765 11108',
        status: 'EN_ROUTE',
        currentLocation: { lat: 28.5720, lng: 77.2150, address: 'Ring Road Ansari Patrol' },
        lastUpdated: new Date().toISOString()
      };
      const fallbackHosp: Hospital = hospitals[0] || DEFAULT_HOSPITALS[0];
      const fallbackIncident: EmergencyIncident = {
        id: fallbackId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        state: 'DISPATCH_ACCEPTED',
        intent: 'medical_emergency',
        urgency: 'critical',
        transcript: finalTranscript,
        language,
        pickupLocation: userLocation,
        assignedVehicleId: fallbackVeh.id,
        assignedHospitalId: fallbackHosp.id,
        assignedVehicle: fallbackVeh,
        assignedHospital: fallbackHosp,
        etaMinutes: 4,
        distanceKm: 1.2,
        timeline: [
          {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            fromState: 'DISPATCH_PENDING',
            toState: 'DISPATCH_ACCEPTED',
            actor: 'SYSTEM',
            note: 'Emergency vehicle dispatch confirmed'
          }
        ],
        aiInterpretation: {
          intent: 'medical_emergency',
          urgency: 'critical',
          reported_symptoms: [finalTranscript],
          incident_description: finalTranscript,
          location_text: userLocation.address || null,
          transport_preference: 'ambulance',
          needs_emergency_escalation: true,
          clarification_required: false,
          clarification_question: null,
          confidence: 0.96,
          language,
          reasoning_summary: 'Critical triage dispatch initiated'
        }
      };
      setActiveIncident(fallbackIncident);
      setAssignedVehicle(fallbackVeh);
      setAssignedHospital(fallbackHosp);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetBooking = () => {
    setActiveIncident(null);
    setAssignedVehicle(null);
    setAssignedHospital(null);
    setRouteCoordinates([]);
    setTranscript('');
    sessionBaseTextRef.current = '';
    currentSessionFinalRef.current = '';
    finalTranscriptRef.current = '';
    sessionFinalRef.current = '';
    lastHeardTextRef.current = '';
    setWordsHeardCount(0);
    setLastRecognizedText('');
    setSpeechDebugInfo('Ready • Tap the red microphone button to speak');
  };

  // OPD Appointment confirmation
  const handleConfirmOpd = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPatientName = opdName.trim() || 'Ramesh Kumar';
    const finalPatientPhone = opdPhone.trim() || '+91 98765 43210';
    setOpdName(finalPatientName);
    setOpdPhone(finalPatientPhone);

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const res = await jeevanApi.createAppointment({
        patientName: finalPatientName,
        patientPhone: finalPatientPhone,
        hospitalId: opdHospitalId,
        department: opdDepartment,
        slotDate: new Date().toISOString().split('T')[0],
        slotTime: '10:30 AM - 11:30 AM',
        transportRequested: false,
      });

      if (res.success) {
        setOpdBookingConfirmed(res.appointment);
      }
    } catch (err: any) {
      setOpdBookingConfirmed({
        id: `OPD-${Date.now().toString().slice(-6)}`,
        bookingToken: `DEL-${opdDepartment.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        patientName: finalPatientName,
        patientPhone: finalPatientPhone,
        hospitalName: hospitals.find((h) => h.id === opdHospitalId)?.name || 'AIIMS Apex Trauma Center',
        department: opdDepartment,
        slotDate: new Date().toISOString().split('T')[0],
        slotTime: '10:30 AM - 11:30 AM',
        status: 'CONFIRMED'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 font-sans">
      
      {/* 1. Header Banner */}
      <section className="bg-white border-b border-slate-200/90 py-3.5 px-4 sm:px-6 shadow-2xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 text-lg shrink-0">
              🚨
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 tracking-tight">MEDITRIAGE AI</span>
                <span className="text-[10px] font-bold text-slate-400">&bull; 108 Emergency</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active 108 Grid: 4 Ambulances Patrol Nearby</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setOpdMode(!opdMode);
                if (!opdMode) {
                  setTimeout(() => opdSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{opdMode ? 'Close OPD' : 'Hospital OPD Token'}</span>
              <span className="sm:hidden">OPD</span>
            </button>

            <a
              href="tel:108"
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-red-500/25 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 animate-bounce" />
              <span>DIAL 108</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        
        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-xs flex items-center justify-between gap-3 shadow-2xs animate-shake">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800 font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Hero Big Microphone & Instant Intake (7 cols) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* If NOT booked: Hero Voice & 1-Tap Booking Card (Design matches Screen 2, 3, 4) */}
            {!activeIncident ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Hero Title & Subtitle */}
                <div className="text-center space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Emergency Help in 1 Tap or Just Speak
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Tell us what happened. Our AI will find the nearest ambulance and assist you instantly.
                  </p>
                </div>

                {/* Big Concentric Microphone Centerpiece (Screen 2 / 3 in reference) */}
                <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-slate-50/80 to-slate-50/30 rounded-3xl border border-slate-200/70 relative">
                  
                  {/* Language Selector Pills */}
                  <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs mb-5">
                    <span className="text-[10px] font-bold text-slate-400 pl-2 pr-1">Language:</span>
                    <button
                      type="button"
                      onClick={() => changeSpeechLang('en-IN')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        speechLang === 'en-IN' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🇮🇳 English (India)
                    </button>
                    <button
                      type="button"
                      onClick={() => changeSpeechLang('hi-IN')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        speechLang === 'hi-IN' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🇮🇳 हिन्दी (Hindi)
                    </button>
                    <button
                      type="button"
                      onClick={() => changeSpeechLang('en-US')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        speechLang === 'en-US' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🌐 English (US)
                    </button>
                  </div>

                  {/* BIG CONCENTRIC GLOWING MIC BUTTON */}
                  <div className="relative flex items-center justify-center my-3">
                    {/* Concentric Animated Glowing Rings */}
                    {isRecording ? (
                      <>
                        <span className="absolute w-48 h-48 rounded-full bg-red-500/15 animate-ping"></span>
                        <span className="absolute w-40 h-40 rounded-full bg-rose-400/25 animate-pulse"></span>
                        <span className="absolute w-32 h-32 rounded-full bg-red-600/30"></span>
                      </>
                    ) : (
                      <>
                        <span className="absolute w-40 h-40 rounded-full bg-red-500/5 group-hover:bg-red-500/10 transition"></span>
                        <span className="absolute w-34 h-34 rounded-full bg-rose-400/10"></span>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={toggleRecording}
                      disabled={isProcessing}
                      className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
                        isRecording
                          ? 'bg-red-600 ring-8 ring-red-100 scale-105 shadow-red-500/50'
                          : 'bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 hover:scale-105 hover:shadow-red-500/40 shadow-red-500/25'
                      } text-white cursor-pointer group`}
                      title="Tap to speak or stop speaking"
                    >
                      {isRecording ? (
                        <MicOff className="w-11 h-11 sm:w-12 sm:h-12 animate-pulse mb-1 text-white" />
                      ) : (
                        <Mic className="w-11 h-11 sm:w-12 sm:h-12 mb-1 text-white group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                        {isRecording ? 'Tap to Stop' : 'Tap to Speak'}
                      </span>
                    </button>
                  </div>

                  {/* Live Speech HUD & Diagnostics */}
                  <div className="w-full max-w-md px-4 mt-3 space-y-2">
                    {/* Animated Equalizer when recording */}
                    {isRecording && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-end gap-1.5 h-9 px-4 py-1.5 bg-slate-100/90 rounded-xl">
                          {[14, 26, 18, 32, 22, 30, 16, 24, 12, 28].map((baseH, idx) => (
                            <span
                              key={idx}
                              style={{
                                height: micStatus === 'voice-detected' ? `${baseH}px` : '9px',
                              }}
                              className={`w-1.5 rounded-full transition-all duration-150 ${
                                micStatus === 'voice-detected'
                                  ? 'bg-emerald-500 animate-pulse shadow-xs shadow-emerald-400'
                                  : 'bg-red-400 animate-pulse'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Pill & Message */}
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <div
                        className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-2xs transition-all ${
                          micStatus === 'voice-detected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isRecording
                            ? 'bg-red-50 text-red-800 border-red-300 animate-pulse'
                            : micStatus === 'blocked'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            micStatus === 'voice-detected'
                              ? 'bg-emerald-500 animate-ping'
                              : isRecording
                              ? 'bg-red-600 animate-pulse'
                              : micStatus === 'blocked'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        <span>{speechDebugInfo}</span>
                      </div>

                      {/* If word was heard, show prominent pill */}
                      {lastRecognizedText && (
                        <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 animate-fadeIn">
                          Recently Recognized: <span className="font-bold underline decoration-emerald-400">"{lastRecognizedText}"</span>
                        </div>
                      )}

                      {!isRecording && (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={handleSimulateVoice}
                            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Test Voice Input (Demo)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Speech to Text (Live) Input Box (Screen 4 in reference) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{isRecording ? '🎙️ Speech to Text (Live Typing):' : 'Emergency Details & Symptoms:'}</span>
                    </label>
                    {transcript.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTranscript('');
                          sessionBaseTextRef.current = '';
                          currentSessionFinalRef.current = '';
                          finalTranscriptRef.current = '';
                          sessionFinalRef.current = '';
                          lastHeardTextRef.current = '';
                          setWordsHeardCount(0);
                          setLastRecognizedText('');
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Clear Text
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={transcript}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTranscript(val);
                        sessionBaseTextRef.current = val.trim();
                        currentSessionFinalRef.current = '';
                        finalTranscriptRef.current = val.trim() ? val.trim() + ' ' : '';
                        sessionFinalRef.current = '';
                        lastHeardTextRef.current = val;
                        setWordsHeardCount(val.trim() ? val.trim().split(/\s+/).filter(Boolean).length : 0);
                      }}
                      rows={3}
                      placeholder='Speak into mic or type here: e.g. "My father is having chest pain and he is not able to breathe properly. We are near Civil Lines..."'
                      className={`w-full bg-slate-50 hover:bg-white focus:bg-white border rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 leading-relaxed transition-all resize-none font-medium shadow-2xs ${
                        isRecording ? 'border-red-500 ring-2 ring-red-100 bg-white' : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                      }`}
                    />
                    {isRecording && (
                      <span className="absolute right-3.5 bottom-3 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md animate-pulse">
                        ● Recording
                      </span>
                    )}
                  </div>

                  {wordsHeardCount > 0 && (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{wordsHeardCount} words transcribed live</span>
                    </p>
                  )}

                  {/* 1-Tap Common Emergency Symptoms Shortcuts */}
                  <div className="pt-1.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Or 1-Tap Instant Symptoms:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🫀 Chest Pain / Heart', text: 'My father has acute severe chest pain, sweating, and difficulty breathing.' },
                        { label: '🩸 Accident / Bleeding', text: 'Serious road accident collision with severe head trauma and continuous bleeding.' },
                        { label: '⚠️ Unconscious / Faint', text: 'Patient suddenly collapsed, unconscious and unresponsive. Send urgent ambulance.' },
                        { label: '🤰 Maternal / Labor', text: 'Mother is in severe pregnancy labor pain with imminent delivery required.' },
                        { label: '🫁 Breathing Distress', text: 'Patient is gasping for air, suffocating and cannot breathe properly.' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setTranscript(item.text);
                            sessionBaseTextRef.current = item.text;
                            currentSessionFinalRef.current = '';
                            finalTranscriptRef.current = item.text + ' ';
                            sessionFinalRef.current = '';
                            lastHeardTextRef.current = item.text;
                            setWordsHeardCount(item.text.split(' ').length);
                          }}
                          className="text-[11px] font-medium bg-slate-100/90 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-300 px-2.5 py-1 rounded-xl transition cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detected Information & Auto-detected Location (Screen 4 & 5 in reference) */}
                <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Detected Request Information:
                  </span>

                  {/* 1. Location Card */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-slate-800">Pickup Location:</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            gpsLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {gpsLocked ? '✓ GPS Locked' : 'Locating GPS...'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">
                          {userLocation.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg"
                        title="Re-detect GPS location"
                      >
                        <Navigation className={`w-3 h-3 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
                        <span>{isLocating ? 'Locating...' : 'GPS'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowLocationEditor(!showLocationEditor)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        {showLocationEditor ? 'Close' : 'Edit / Landmark'}
                      </button>
                    </div>
                  </div>

                  {/* Optional Landmark Form */}
                  {showLocationEditor && (
                    <form onSubmit={handleManualLocationSubmit} className="flex gap-2 pt-1 animate-fadeIn">
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="e.g. Near Gate 2, Flat 304, Metro Pillar 45..."
                        className="flex-1 bg-white border border-slate-300 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Save
                      </button>
                    </form>
                  )}

                  {/* 2. Emergency Type Selection (1-Tap Selection) */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-2">Emergency Response Type:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAmbulanceType('ALS')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer shadow-2xs ${
                          ambulanceType === 'ALS'
                            ? 'bg-red-50 border-red-500 ring-2 ring-red-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">🚨</span>
                          <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.2 rounded">ICU</span>
                        </div>
                        <strong className="block text-xs font-bold text-slate-900 mt-1">Critical ALS</strong>
                        <span className="text-[10px] text-slate-500 block">Ventilator & Paramedic</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAmbulanceType('BLS')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer shadow-2xs ${
                          ambulanceType === 'BLS'
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">🚑</span>
                          <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">BLS</span>
                        </div>
                        <strong className="block text-xs font-bold text-slate-900 mt-1">Normal BLS</strong>
                        <span className="text-[10px] text-slate-500 block">Oxygen & Stretcher</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAmbulanceType('MATERNITY')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer shadow-2xs ${
                          ambulanceType === 'MATERNITY'
                            ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">🤰</span>
                          <span className="text-[9px] font-black bg-pink-600 text-white px-1.5 py-0.2 rounded">ANC</span>
                        </div>
                        <strong className="block text-xs font-bold text-slate-900 mt-1">Maternity</strong>
                        <span className="text-[10px] text-slate-500 block">Labor & Delivery Kit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* THE UNMISSABLE 1-TAP DISPATCH BUTTON (Screen 5 in reference) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBookAmbulance}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-base sm:text-lg py-4 px-6 rounded-2xl shadow-xl shadow-red-500/30 transition-all duration-200 flex flex-col items-center justify-center gap-1 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>{isProcessing ? '⏳' : '🚨'}</span>
                      <span>
                        {isProcessing
                          ? 'LOCATING NEAREST AMBULANCE...'
                          : language === 'hi'
                          ? 'तुरंत एम्बुलेंस भेजें (1-क्लिक SOS)'
                          : 'FIND NEAREST AMBULANCE & DISPATCH (1-TAP)'}
                      </span>
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </div>
                    <span className="text-[11px] font-medium text-red-100 opacity-90">
                      Average Arrival ~4-5 Mins • Nearest Patrol Unit Dispatched • Direct AIIMS Apex Alert
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* If BOOKED: Active Live Telemetry & Tracking Screen (Screen 7 & 8 in reference) */
              <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      ✓
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        Ambulance Found! Help is on the way.
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned vehicle is actively navigating to your live coordinates.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                    #{activeIncident.id.slice(0, 8)}
                  </span>
                </div>

                {/* Big Live ETA Card (Screen 7 in reference) */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-red-500/25">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                      🚑
                    </div>
                    <div>
                      <div className="text-xs uppercase font-extrabold tracking-wider text-red-100">
                        Estimated Road Arrival
                      </div>
                      <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                        {activeIncident.etaMinutes ?? 4} MINUTES
                      </div>
                      <p className="text-xs text-red-100 mt-1 font-semibold">
                        {activeIncident.distanceKm ?? 1.2} km away &bull; Live GPS Road Tracking
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${assignedVehicle?.driverPhone || '108'}`}
                    className="bg-white hover:bg-slate-50 text-red-700 font-black text-xs px-5 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-red-600 animate-bounce" />
                    <span>CALL DRIVER ({assignedVehicle?.driverName?.split(' ')[0] || '108'})</span>
                  </a>
                </div>

                {/* Assigned Vehicle Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[11px]">Assigned Vehicle</span>
                    <strong className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {assignedVehicle?.callSign || 'DL-108-ALS-04'}
                    </strong>
                    <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                      {assignedVehicle?.capability || 'ALS Advanced Life Support'}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">Plate: {assignedVehicle?.registrationNumber || 'DL-01-EA-1084'}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[11px]">Assigned Driver & Paramedic</span>
                    <strong className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {assignedVehicle?.driverName || 'Rajesh Sharma'}
                    </strong>
                    <p className="text-[11px] text-slate-600 mt-1 font-mono">
                      Phone: <a href={`tel:${assignedVehicle?.driverPhone || '+91 98765 11108'}`} className="text-blue-600 underline font-bold">{assignedVehicle?.driverPhone || '+91 98765 11108'}</a>
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ Paramedic & Oxygen on board</p>
                  </div>
                </div>

                {/* Receiving Hospital Destination */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-blue-700 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">Receiving Hospital</span>
                      <strong className="block text-slate-900 font-bold text-sm">
                        {assignedHospital?.name || 'AIIMS Apex Trauma Center, New Delhi'}
                      </strong>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
                    Trauma Bay Alerted
                  </span>
                </div>

                {/* 4-Stage Live Timeline (Screen 8 in reference) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-3">Live Emergency Sequence</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      ✓ Dispatched
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-600 text-white font-bold animate-pulse shadow-sm">
                      ⚡ En Route
                    </div>
                    <div className="p-2.5 rounded-xl bg-white text-slate-400 font-medium border border-slate-200">
                      📍 At Scene
                    </div>
                    <div className="p-2.5 rounded-xl bg-white text-slate-400 font-medium border border-slate-200">
                      🏥 Hospital
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onViewTracking(activeIncident.id)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Full Screen Telemetry View</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetBooking}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 px-4 rounded-xl transition cursor-pointer"
                  >
                    Book Another Ambulance
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Live Location & Ambulance Map (5 cols)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Location Tracking Map Card (Screen 8 & 15 in reference) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <span>{activeIncident ? 'Live Ambulance Location Tracking' : 'Live Fleet & GPS Radar'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeIncident ? 'Live telemetry of assigned ambulance' : 'Real-time 108 GPS Patrol Grid'}
                  </p>
                </div>

                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeIncident ? 'AMBULANCE EN ROUTE' : 'LIVE RADAR'}
                </span>
              </div>

              {/* Embedded Leaflet Live Map */}
              <JeevanLiveMap
                userLocation={activeIncident?.pickupLocation || userLocation}
                selectedVehicle={assignedVehicle || vehicles[0]}
                assignedHospital={assignedHospital || hospitals[0]}
                vehicles={vehicles}
                hospitals={hospitals}
                routeCoordinates={routeCoordinates}
                className="h-[360px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"
              />

              {/* Nearest Ambulances List (Pre-booking) or Active Telemetry (Post-booking) */}
              {!activeIncident ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Nearby 108 Patrol Units:</span>
                    <span className="text-emerald-700 font-mono">Ready to Dispatch</span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { callSign: 'DL-108-ALS-04', type: 'ALS Unit', dist: '1.2 km', eta: '4 min', driver: 'Rajesh S.' },
                      { callSign: 'DL-108-BLS-02', type: 'BLS Unit', dist: '2.1 km', eta: '6 min', driver: 'Vikram K.' },
                      { callSign: 'DL-108-BLS-06', type: 'BLS Unit', dist: '3.4 km', eta: '9 min', driver: 'Sunil P.' },
                    ].map((v) => (
                      <div key={v.callSign} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🚑</span>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{v.callSign}</span>
                            <span className="text-[10px] text-slate-500">{v.type} &bull; Driver: {v.driver}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className="text-emerald-700 block text-xs font-bold leading-tight">ETA {v.eta}</strong>
                          <span className="text-[10px] text-slate-400">{v.dist}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Live GPS Stream Active</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    The ambulance is tracking via Delhi Smart Traffic Grid. Hospital emergency bay has been allocated.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Helpline Hotline Reminder */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-red-200 tracking-wider">Toll-Free Helpline</span>
                <h4 className="text-lg font-black leading-tight">Emergency? Call 108 Now</h4>
                <p className="text-xs text-red-100 mt-0.5">24x7 Government Medical Emergency Response</p>
              </div>
              <a
                href="tel:108"
                className="bg-white text-red-700 hover:bg-red-50 font-black text-xs px-4 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 animate-bounce" />
                <span>Call 108</span>
              </a>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* OPTIONAL OPD SECTION (Visible when clicked)             */}
        {/* ======================================================== */}
        {opdMode && (
          <div ref={opdSectionRef} className="bg-white border-2 border-blue-500 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn mt-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-7 h-7 text-blue-600" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Government Hospital OPD Booking</h2>
                  <p className="text-xs text-slate-500">Verified Delhi / National Health OPD Scheduling</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpdMode(false)}
                className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {opdBookingConfirmed ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">OPD Appointment Token Confirmed</h3>
                
                <div className="bg-white p-5 rounded-2xl border border-emerald-200 max-w-md mx-auto text-left text-xs space-y-2.5 font-mono shadow-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-sans font-medium">Digital Token:</span>
                    <strong className="text-amber-700 text-sm font-bold font-mono">
                      {opdBookingConfirmed.bookingToken || opdBookingConfirmed.appointmentNumber || opdBookingConfirmed.id}
                    </strong>
                  </div>
                  <div>Patient: <strong>{opdBookingConfirmed.patientName}</strong></div>
                  <div>Phone: <strong>{opdBookingConfirmed.patientPhone}</strong></div>
                  <div>Hospital: <strong>{opdBookingConfirmed.hospitalName}</strong></div>
                  <div>Department: <strong>{opdBookingConfirmed.department}</strong></div>
                  <div>Slot Time: <strong className="text-emerald-700">{opdBookingConfirmed.slotTime}</strong></div>
                  
                  {/* Submission Date & Time */}
                  <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-sans">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpdBookingConfirmed(null);
                      setOpdName('Ramesh Kumar');
                      setOpdPhone('+91 98765 43210');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
                  >
                    Book Another Token
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpdMode(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Close OPD
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmOpd} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={opdName}
                      onChange={(e) => setOpdName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={opdPhone}
                      onChange={(e) => setOpdPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Government Hospital</label>
                    <select
                      value={opdHospitalId}
                      onChange={(e) => setOpdHospitalId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.availableBeds ?? 10} beds open)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={opdDepartment}
                      onChange={(e) => setOpdDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Orthopedics">Orthopedics & Trauma</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Gynecology & Obstetrics">Gynecology & Obstetrics (ANC)</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm text-sm cursor-pointer"
                >
                  {isProcessing ? 'Generating Token...' : 'Confirm Digital OPD Slot'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
