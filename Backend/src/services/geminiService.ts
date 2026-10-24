import type { IncidentIntent, IncidentUrgency, TransportPreference } from '../types/jeevan.js';

export interface GeminiInterpretation {
  intent: IncidentIntent;
  urgency: IncidentUrgency;
  reported_symptoms: string[];
  incident_description: string;
  location_text: string | null;
  transport_preference: TransportPreference;
  needs_emergency_escalation: boolean;
  clarification_required: boolean;
  clarification_question: string | null;
  confidence: number;
  language: 'en' | 'hi';
  reasoning_summary: string;
}

/**
 * Deterministic Safety Rule Engine (Always Active Fallback)
 * Ensures that even if the AI model is offline or has low confidence,
 * critical symptoms are ALWAYS escalated conservatively.
 */
export function deterministicSafetyEngine(text: string): GeminiInterpretation {
  const lower = text.toLowerCase();
  const symptoms: string[] = [];

  // 1. CRITICAL EMERGENCY KEYWORDS (Hindi & English)
  const criticalPatterns = [
    { pattern: /accident|road accident|crash|collision|दुर्घटना|टक्कर/i, symptom: 'Road Accident Trauma' },
    { pattern: /bleeding|bleed|blood|खून|रक्त/i, symptom: 'Severe Bleeding' },
    { pattern: /chest pain|heart attack|angina|सीने में दर्द|दौरा/i, symptom: 'Acute Chest Pain' },
    { pattern: /unconscious|fainted|passed out|not responding|बेहोश|चेतनाशून्य/i, symptom: 'Loss of Consciousness' },
    { pattern: /breath|choking|suffocating|cannot breathe|सांस लेने में तकलीफ|दम घुटना/i, symptom: 'Respiratory Distress' },
    { pattern: /collapse|collapsed|गिर गया/i, symptom: 'Acute Physical Collapse' },
    { pattern: /severe head injury|skull fracture|सिर पर चोट/i, symptom: 'Severe Head Injury' },
    { pattern: /paralysis|stroke|facial droop|लकवा/i, symptom: 'Suspected Stroke' },
    { pattern: /poison|snake bite|toxic|जहर|सांप का काटना/i, symptom: 'Poisoning / Envenomation' },
    { pattern: /burn|fire|जल गया/i, symptom: 'Severe Burn Trauma' }
  ];

  let isCritical = false;
  for (const item of criticalPatterns) {
    if (item.pattern.test(lower)) {
      symptoms.push(item.symptom);
      isCritical = true;
    }
  }

  // Detect language
  const isHindi = /[\u0900-\u097F]/.test(text) || /madad|chahiye|hospital|aspataal|dard|khoon/i.test(lower);
  const language = isHindi ? 'hi' : 'en';

  // Extract rough location references if mentioned
  let locationText: string | null = null;
  const locationMatch = text.match(/(?:near|at|opposite|behind|in front of|के पास|के सामने)\s+([A-Za-z0-9\u0900-\u097F\s,]+)/i);
  if (locationMatch && locationMatch[1]) {
    locationText = locationMatch[1].trim().slice(0, 80);
  }

  // 2. CHECK FOR CRITICAL EMERGENCY
  if (isCritical) {
    return {
      intent: 'medical_emergency',
      urgency: 'critical',
      reported_symptoms: symptoms,
      incident_description: text.trim(),
      location_text: locationText,
      transport_preference: 'ambulance',
      needs_emergency_escalation: true,
      clarification_required: false,
      clarification_question: null,
      confidence: 0.95,
      language,
      reasoning_summary: language === 'hi'
        ? 'आपातकालीन लक्षण पाए गए। तत्काल एम्बुलेंस प्रेषण प्रक्रिया शुरू की गई।'
        : 'Critical trauma or life-threatening symptoms detected. Immediate emergency ambulance dispatch triggered without registration barrier.'
    };
  }

  // 3. CHECK FOR MEDICAL TRANSPORT (E.G. ROUTINE PREGNANCY / DIALYSIS / MOBILITY)
  const isTransport = /pregnancy checkup|dialysis|wheelchair|routine checkup|transport to hospital|checkup transport|delivery checkup|जांच के लिए जाना/i.test(lower);
  if (isTransport) {
    const isUrgentLabour = /labor pain|water broke|heavy pain|bleeding/i.test(lower);
    return {
      intent: 'medical_transport',
      urgency: isUrgentLabour ? 'urgent' : 'routine',
      reported_symptoms: isUrgentLabour ? ['Active Labor Signs'] : ['Planned Medical Transport'],
      incident_description: text.trim(),
      location_text: locationText,
      transport_preference: isUrgentLabour ? 'ambulance' : 'medical_transport',
      needs_emergency_escalation: isUrgentLabour,
      clarification_required: false,
      clarification_question: null,
      confidence: 0.90,
      language,
      reasoning_summary: language === 'hi'
        ? 'नियमित चिकित्सा परिवहन अनुरोध। उपयुक्त वाहन चयन विकल्प उपलब्ध।'
        : 'Identified planned non-emergency medical transport. Routing to vehicle selection and scheduling.'
    };
  }

  // 4. CHECK FOR ROUTINE HOSPITAL APPOINTMENT / OPD
  const isAppointment = /appointment|book appointment|opd|district hospital|doctor consultation|पर्चा|अपॉइंटमेंट/i.test(lower);
  if (isAppointment) {
    return {
      intent: 'routine_appointment',
      urgency: 'routine',
      reported_symptoms: [],
      incident_description: text.trim(),
      location_text: locationText,
      transport_preference: 'unknown',
      needs_emergency_escalation: false,
      clarification_required: false,
      clarification_question: null,
      confidence: 0.88,
      language,
      reasoning_summary: language === 'hi'
        ? 'सरकारी अस्पताल ओपीडी परामर्श अपॉइंटमेंट अनुरोध।'
        : 'Government hospital outpatient consultation booking request.'
    };
  }

  // 5. UNCERTAIN / OTHER
  return {
    intent: 'other',
    urgency: 'uncertain',
    reported_symptoms: symptoms.length > 0 ? symptoms : ['Unspecified medical inquiry'],
    incident_description: text.trim(),
    location_text: locationText,
    transport_preference: 'unknown',
    needs_emergency_escalation: false,
    clarification_required: true,
    clarification_question: language === 'hi' 
      ? 'कृपया बताएं कि क्या यह कोई जीवन-घातक आपात स्थिति है, या आपको अस्पताल अपॉइंटमेंट चाहिए?' 
      : 'Could you clarify if you need an emergency ambulance or a routine hospital service?',
    confidence: 0.65,
    language,
    reasoning_summary: 'Ambiguous inquiry. Awaiting rapid clarification while maintaining safety hotline access.'
  };
}

/**
 * Main Gemini AI Interpretation function with graceful fallback.
 */
export async function interpretIncidentTranscript(rawText: string): Promise<GeminiInterpretation> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Zero latency fallback to deterministic safety policy
    return deterministicSafetyEngine(rawText);
  }

  try {
    const prompt = `You are the clinical intake parser for Jeevan AI, a government emergency and hospital dispatch platform.
Analyze the following patient/caller statement and return ONLY valid JSON matching this schema:
{
  "intent": "medical_emergency" | "medical_transport" | "routine_appointment" | "hospital_information" | "other",
  "urgency": "critical" | "urgent" | "routine" | "uncertain",
  "reported_symptoms": string[],
  "incident_description": string,
  "location_text": string or null,
  "transport_preference": "ambulance" | "medical_transport" | "taxi" | "unknown",
  "needs_emergency_escalation": boolean,
  "clarification_required": boolean,
  "clarification_question": string or null,
  "confidence": number between 0.0 and 1.0,
  "language": "en" or "hi",
  "reasoning_summary": string (user-safe short explanation)
}

RULES:
1. If the user mentions road accidents, heavy bleeding, chest pain, stroke, unconsciousness, severe injury, or collapse, set intent="medical_emergency", urgency="critical", needs_emergency_escalation=true, transport_preference="ambulance".
2. Pregnancy alone is NOT an emergency unless danger signs (bleeding, severe pain, water broke) are mentioned.
3. Be concise and prioritize immediate safety.

CALLER STATEMENT: "${rawText.replace(/"/g, '\\"')}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API call failed with status:', response.status);
      return deterministicSafetyEngine(rawText);
    }

    const data = (await response.json()) as any;
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return deterministicSafetyEngine(rawText);
    }

    const parsed: GeminiInterpretation = JSON.parse(candidateText);

    // Enforce safety boundary: If deterministic engine flags critical, NEVER allow model to downgrade it!
    const safetyCheck = deterministicSafetyEngine(rawText);
    if (safetyCheck.urgency === 'critical') {
      parsed.urgency = 'critical';
      parsed.intent = 'medical_emergency';
      parsed.needs_emergency_escalation = true;
      parsed.transport_preference = 'ambulance';
    }

    return parsed;
  } catch (err) {
    console.warn('Error during Gemini interpretation, using fallback engine:', err);
    return deterministicSafetyEngine(rawText);
  }
}
