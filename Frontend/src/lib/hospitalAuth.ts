import type { HospitalAccount, SubscriptionPlan, SubscriptionPlanTier } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'MONTHLY',
    name: '1 Month License',
    durationLabel: '1 Month',
    durationMonths: 1,
    price: 999,
    priceFormatted: '₹999',
    billingFrequency: 'billed monthly',
    features: [
      '4-level urgency triage protocol',
      'Emergency sound alert (5-10m)',
      'Unlimited patient registrations'
    ]
  },
  {
    id: 'HALF_YEARLY',
    name: '6 Months License',
    durationLabel: '6 Months',
    durationMonths: 6,
    price: 4999,
    priceFormatted: '₹4,999',
    billingFrequency: 'billed every 6 months',
    popular: true,
    savings: 'Save ~16%',
    features: [
      'All 1-Month features included',
      'Multi-workstation sync',
      'Clinician audit trail log'
    ]
  },
  {
    id: 'YEARLY',
    name: '1 Year License',
    durationLabel: '1 Year',
    durationMonths: 12,
    price: 8999,
    priceFormatted: '₹8,999',
    billingFrequency: 'billed annually',
    savings: 'Save ~25%',
    features: [
      'All 6-Month features included',
      'Hospital-wide deployment',
      '24/7 priority support'
    ]
  }
];

export const DEMO_HOSPITALS: Record<string, { hospital: HospitalAccount; passwordHash: string }> = {
  'HOSP-METRO-01': {
    hospital: {
      hospitalId: 'HOSP-METRO-01',
      hospitalName: 'Metro City Multi-Specialty Hospital',
      city: 'New Delhi',
      department: 'Emergency & Acute Trauma Care',
      staffId: 'DR-SHARMA-ER',
      staffName: 'Dr. A. Sharma, MD',
      staffRole: 'Chief Emergency Triage Officer',
      activePlan: 'YEARLY',
      planValidUntil: '2027-10-31',
      isAuthenticated: true
    },
    passwordHash: 'hospital123'
  },
  'HOSP-APOLLO-02': {
    hospital: {
      hospitalId: 'HOSP-APOLLO-02',
      hospitalName: 'Apollo Care Trauma Center',
      city: 'Dehradun',
      department: 'Urgent Care & Rapid Triage Unit',
      staffId: 'RN-PRIYA-04',
      staffName: 'Priya Joshi, RN',
      staffRole: 'Senior Triage Charge Nurse',
      activePlan: 'HALF_YEARLY',
      planValidUntil: '2027-04-15',
      isAuthenticated: true
    },
    passwordHash: 'hospital123'
  },
  'HOSP-CITY-03': {
    hospital: {
      hospitalId: 'HOSP-CITY-03',
      hospitalName: 'City Public Health Hospital',
      city: 'Haridwar',
      department: 'General Outpatient & Triage Wing',
      staffId: 'STAFF-VERMA-01',
      staffName: 'R. K. Verma',
      staffRole: 'Clinical Intake Coordinator',
      activePlan: 'MONTHLY',
      planValidUntil: '2026-11-23',
      isAuthenticated: true
    },
    passwordHash: 'hospital123'
  }
};

const AUTH_STORAGE_KEY = 'meditriage_hospital_session_v1';
const REGISTERED_HOSPITALS_KEY = 'meditriage_registered_hospitals_v1';

export interface HospitalRegistrationData {
  hospitalName: string;
  hospitalType: string;
  hospitalId: string;
  city: string;
  state: string;
  country: string;
  address: string;
  fullName: string;
  workEmail: string;
  password: string;
  adminRole: string;
  contactNumber: string;
  teamMembers?: string[];
  trialStartDate?: string;
  trialEndDate?: string;
}

export function getRegisteredHospitals(): Record<string, { hospital: HospitalAccount; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(REGISTERED_HOSPITALS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function registerHospitalTrial(data: HospitalRegistrationData): HospitalAccount {
  const normalizedId = data.hospitalId.trim().toUpperCase();
  
  const end = new Date();
  end.setDate(end.getDate() + 7);
  const trialEndDate = data.trialEndDate || end.toISOString().slice(0, 10);

  const account: HospitalAccount = {
    hospitalId: normalizedId,
    hospitalName: data.hospitalName.trim() || 'City General Hospital',
    city: data.city.trim() || 'Dehradun',
    department: 'Emergency & Triage Wing',
    staffId: data.workEmail.trim() || 'dr.sharma@cityhospital.org',
    staffName: data.fullName.trim() || 'Dr. Sharma',
    staffRole: data.adminRole || 'Administrator',
    activePlan: 'MONTHLY',
    planValidUntil: trialEndDate,
    isAuthenticated: true
  };

  const registered = getRegisteredHospitals();
  registered[normalizedId] = {
    hospital: account,
    passwordHash: data.password.trim() || 'hospital123'
  };
  localStorage.setItem(REGISTERED_HOSPITALS_KEY, JSON.stringify(registered));

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
  window.dispatchEvent(new Event('hospital_auth_changed'));
  return account;
}

export function getHospitalSession(): HospitalAccount | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loginHospital(hospitalId: string, staffId: string, password: string): { success: boolean; error?: string; session?: HospitalAccount } {
  const normalizedId = hospitalId.trim().toUpperCase();
  
  // 1. Check in custom registered hospitals
  const registered = getRegisteredHospitals();
  if (registered[normalizedId]) {
    const entry = registered[normalizedId];
    if (entry.passwordHash === password.trim()) {
      const session: HospitalAccount = {
        ...entry.hospital,
        staffId: staffId.trim() || entry.hospital.staffId,
        staffName: entry.hospital.staffName,
        isAuthenticated: true
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      window.dispatchEvent(new Event('hospital_auth_changed'));
      return { success: true, session };
    }
    return { success: false, error: 'Incorrect password for this registered hospital.' };
  }

  // 2. Check in DEMO_HOSPITALS
  const demoEntry = DEMO_HOSPITALS[normalizedId];
  if (!demoEntry) {
    // Also allow generic valid hospital ID if formatted like HOSP-XXXX
    if (normalizedId.startsWith('HOSP-') && (password === 'hospital123' || password.length >= 6)) {
      const genericSession: HospitalAccount = {
        hospitalId: normalizedId,
        hospitalName: `${normalizedId.replace('HOSP-', '')} General Hospital`,
        city: 'Authorized Facility',
        department: 'Emergency & Triage Wing',
        staffId: staffId.trim() || 'dr.sharma@cityhospital.org',
        staffName: staffId.includes('@') ? staffId.split('@')[0] : staffId || 'Dr. Sharma',
        staffRole: 'Administrator',
        activePlan: 'MONTHLY',
        planValidUntil: '2026-11-30',
        isAuthenticated: true
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(genericSession));
      window.dispatchEvent(new Event('hospital_auth_changed'));
      return { success: true, session: genericSession };
    }
    return { success: false, error: 'Invalid Hospital ID. Please check the code or start a 7-day free trial.' };
  }

  if (demoEntry.passwordHash !== password.trim()) {
    return { success: false, error: 'Incorrect password. Check your credentials.' };
  }

  const session: HospitalAccount = {
    ...demoEntry.hospital,
    staffId: staffId.trim() || demoEntry.hospital.staffId,
    isAuthenticated: true
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('hospital_auth_changed'));
  return { success: true, session };
}

export function logoutHospital(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('hospital_auth_changed'));
}

export function updateHospitalPlan(planId: SubscriptionPlanTier): HospitalAccount | null {
  const current = getHospitalSession();
  if (!current) return null;

  const monthsToAdd = planId === 'MONTHLY' ? 1 : planId === 'HALF_YEARLY' ? 6 : 12;
  const newDate = new Date();
  newDate.setMonth(newDate.getMonth() + monthsToAdd);

  const updated: HospitalAccount = {
    ...current,
    activePlan: planId,
    planValidUntil: newDate.toISOString().slice(0, 10)
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('hospital_auth_changed'));
  return updated;
}
