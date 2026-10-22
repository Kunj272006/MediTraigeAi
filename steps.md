# MEDITRIAGE AI — End-to-End Project Implementation Blueprint (`steps.md`)

**Tagline:** Right Care, Right Time  
**Project Architecture:** React (Vite + TypeScript) + Tailwind CSS + shadcn/ui + Supabase (PostgreSQL, Auth, RLS, Storage, Realtime, Edge Functions) + Gemini API + Vercel  
**GitHub Repository:** [https://github.com/Kunj272006/MediTraigeAi](https://github.com/Kunj272006/MediTraigeAi)

---

## Table of Contents
1. [Project Overview & System Architecture](#1-project-overview--system-architecture)
2. [Target Directory & File Structure](#2-target-directory--file-structure)
3. [Phase 1: Project Initialization & Tooling Setup](#3-phase-1-project-initialization--tooling-setup)
4. [Phase 2: Database Modeling, Migrations & Row-Level Security (RLS)](#4-phase-2-database-modeling-migrations--row-level-security-rls)
5. [Phase 3: Design System, Brand Theme & Core Layouts](#5-phase-3-design-system-brand-theme--core-layouts)
6. [Phase 4: Four-Section Patient Registration Flow](#6-phase-4-four-section-patient-registration-flow)
7. [Phase 5: Secure Submission Pipeline, UHID Generation & Triage Engine](#7-phase-5-secure-submission-pipeline-uhid-generation--triage-engine)
8. [Phase 6: Patient Confirmation & Result Screen](#8-phase-6-patient-confirmation--result-screen)
9. [Phase 7: Authentication & Role-Based Access Control (RBAC)](#9-phase-7-authentication--role-based-access-control-rbac)
10. [Phase 8: Real-Time Hospital Staff Queue & Dashboard](#10-phase-8-real-time-hospital-staff-queue--dashboard)
11. [Phase 9: Priority Alert System & Clinician Override Workflow](#11-phase-9-priority-alert-system--clinician-override-workflow)
12. [Phase 10: Private Medical Document Management](#12-phase-10-private-medical-document-management)
13. [Phase 11: Optional Gemini AI Clinical Handover Summarization](#13-phase-11-optional-gemini-ai-clinical-handover-summarization)
14. [Phase 12: Quality Assurance, Automated Testing & Security Audit](#14-phase-12-quality-assurance-automated-testing--security-audit)
15. [Phase 13: Production Deployment & Verification Checklist](#15-phase-13-production-deployment--verification-checklist)

---

## 1. Project Overview & System Architecture

```
                          ┌──────────────────────────────────────────────┐
                          │         Client (Vite + React + TS)          │
                          │   Tailwind CSS + shadcn/ui + Lucide Icons    │
                          └──────────────┬───────────────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────────────┐
                 │ HTTPS (REST / Auth)   │ Supabase Realtime (WSS)       │ File Upload (Multipart)
                 ▼                       ▼                               ▼
       ┌───────────────────┐   ┌───────────────────┐           ┌───────────────────┐
       │ Supabase Auth     │   │ Live Queue &      │           │ Supabase Storage  │
       │ (JWT, RBAC)       │   │ Alert Events      │           │ (Private Buckets) │
       └─────────┬─────────┘   └─────────▲─────────┘           └─────────┬─────────┘
                 │                       │                               │
                 ▼                       │                               │
       ┌───────────────────┐             │                               │
       │ Edge Functions    ├─────────────┼───────────────────────────────┘
       │ - submit-encounter│             │
       │ - summarize-ai    │◄─── Gemini API (Strictly Server-Side)
       └─────────┬─────────┘
                 │
                 ▼
       ┌───────────────────────────────────────────┐
       │        PostgreSQL Database (Supabase)     │
       │  Tables + RLS Policies + Audit Log Triggers│
       └───────────────────────────────────────────┘
```

### Core Safety Rules
1. **Preliminary Triage Only:** The system does not diagnose or declare patients "safe".
2. **Missing Data Policy:** Missing measurements must be recorded as `NULL`/unknown, never inferred as normal.
3. **Emergency Priority:** Severe symptoms (chest pain, acute dyspnea) trigger immediate warning banners without waiting for form submission.
4. **Black Category Safeguard:** Deceased status can **never** be auto-assigned by rules or AI. Only an authorized clinician can assign Black after confirmation.

---

## 2. Target Directory & File Structure

```
meditriage-ai/
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── supabase/
│   ├── config.toml
│   ├── functions/
│   │   ├── submit-encounter/
│   │   │   └── index.ts
│   │   └── summarize-symptoms/
│   │       └── index.ts
│   └── migrations/
│       ├── 20261023000001_create_schema.sql
│       ├── 20261023000002_enable_rls.sql
│       └── 20261023000003_seed_mock_data.sql
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── BrandLogo.tsx
│   │   │   ├── EmergencyBanner.tsx
│   │   │   └── TriageBadge.tsx
│   │   ├── ui/               # shadcn/ui components (button, dialog, input, etc.)
│   │   ├── registration/
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SectionBasicDetails.tsx
│   │   │   ├── SectionVitals.tsx
│   │   │   ├── SectionSymptoms.tsx
│   │   │   ├── SectionMedicalHistory.tsx
│   │   │   └── DocumentUploader.tsx
│   │   └── dashboard/
│   │       ├── QueueTable.tsx
│   │       ├── QueueFilterBar.tsx
│   │       ├── PatientDetailModal.tsx
│   │       ├── ClinicianOverrideModal.tsx
│   │       ├── AlertNotificationBar.tsx
│   │       └── TriageAnalyticsChart.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AlertSoundContext.tsx
│   ├── hooks/
│   │   ├── usePatientQueue.ts
│   │   ├── useRealtimeAlerts.ts
│   │   └── useWebAudioAlert.ts
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── triageEngine.ts    # Deterministic hospital-approved rule evaluator
│   │   ├── validationSchemas.ts # Zod schemas
│   │   ├── uhidGenerator.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ResultPage.tsx
│   │   ├── StaffLoginPage.tsx
│   │   ├── StaffDashboardPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   ├── patientService.ts
│   │   ├── staffService.ts
│   │   └── storageService.ts
│   └── types/
│       ├── database.types.ts
│       └── triage.types.ts
└── tests/
    ├── unit/
    │   ├── triageEngine.test.ts
    │   └── validation.test.ts
    └── e2e/
        ├── patientRegistration.spec.ts
        └── staffDashboard.spec.ts
```

---

## 3. Phase 1: Project Initialization & Tooling Setup

### Step 1.1: Initialize Vite React TypeScript Project
Execute in your terminal:
```bash
npm create vite@latest meditriage-ai -- --template react-ts
cd meditriage-ai
```

### Step 1.2: Install Frontend Dependencies
```bash
# UI, Styling, Icons, Motion
npm install tailwindcss postcss autoprefixer clsx tailwind-merge lucide-react framer-motion

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Routing, State, Data Fetching & Utilities
npm install react-router-dom @tanstack/react-query date-fns recharts

# Backend Client
npm install @supabase/supabase-js

# Dev & Testing Dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/node eslint prettier eslint-config-prettier eslint-plugin-react-hooks
npx playwright install
```

### Step 1.3: Configure Tailwind CSS & shadcn/ui
1. Run `npx tailwindcss init -p`.
2. Configure `tailwind.config.ts` with brand palette:
   - Primary Dark: Navy Blue (`#0F172A`)
   - Accent: Hospital Teal (`#0D9488` / `#14B8A6`)
   - Triage Red: `#DC2626`
   - Triage Yellow: `#EAB308`
   - Triage Green: `#16A34A`
   - Clinician Black: `#18181B`
3. Setup `src/index.css` with CSS variables for seamless light/dark support and high contrast.

### Step 1.4: Environment Variables Setup
Create `.env.example` and `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=development
```

---

## 4. Phase 2: Database Modeling, Migrations & Row-Level Security (RLS)

### Step 2.1: Supabase CLI Initialization
```bash
npx supabase init
```

### Step 2.2: Define PostgreSQL Database Schema
Create migration `supabase/migrations/20261023000001_create_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'triage_staff');
CREATE TYPE triage_priority AS ENUM ('RED', 'YELLOW', 'GREEN', 'BLACK');
CREATE TYPE encounter_status AS ENUM ('waiting', 'under_assessment', 'admitted', 'referred', 'discharged');
CREATE TYPE alert_priority AS ENUM ('CRITICAL', 'URGENT', 'ROUTINE');

-- 1. Profiles Table (Hospital Staff)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'triage_staff',
    license_number TEXT,
    department TEXT DEFAULT 'Emergency Department',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uhid TEXT UNIQUE NOT NULL, -- Format: MT-YYYYMMDD-XXXX
    full_name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 130),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    contact_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Encounters Table (Visit sessions)
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_number TEXT UNIQUE NOT NULL, -- Format: ENC-XXXXXX
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    status encounter_status DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vital Signs Table (Allows NULL / Unmeasured)
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    systolic_bp INT CHECK (systolic_bp BETWEEN 40 AND 300),
    diastolic_bp INT CHECK (diastolic_bp BETWEEN 20 AND 200),
    oxygen_saturation NUMERIC(4, 1) CHECK (oxygen_saturation BETWEEN 40.0 AND 100.0),
    pulse_rate INT CHECK (pulse_rate BETWEEN 20 AND 250),
    blood_sugar NUMERIC(5, 1) CHECK (blood_sugar BETWEEN 10.0 AND 1000.0),
    is_bp_measured BOOLEAN DEFAULT TRUE,
    is_spo2_measured BOOLEAN DEFAULT TRUE,
    is_pulse_measured BOOLEAN DEFAULT TRUE,
    is_sugar_measured BOOLEAN DEFAULT TRUE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Symptoms Table
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    symptom_list TEXT[] NOT NULL,
    other_symptoms TEXT,
    duration TEXT NOT NULL CHECK (duration IN ('<24_hours', '1-2_days', '>2_days')),
    emergency_flag_triggered BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Medical History Table
CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    taking_medications TEXT NOT NULL CHECK (taking_medications IN ('Yes', 'No', 'Not sure')),
    medication_details TEXT,
    has_conditions_allergies TEXT NOT NULL CHECK (has_conditions_allergies IN ('Yes', 'No', 'Not sure')),
    condition_details TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Medical Documents Table
CREATE TABLE medical_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Triage Assessments Table
CREATE TABLE triage_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    category triage_priority NOT NULL,
    rule_version TEXT NOT NULL DEFAULT 'v1.0-ruleset',
    plain_language_summary TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    clinician_overridden BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    overridden_by UUID REFERENCES profiles(id),
    overridden_at TIMESTAMPTZ,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    priority alert_priority NOT NULL,
    message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES profiles(id),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs Table (Immutable log)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performed_by UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2.3: Configure Row-Level Security (RLS)
Create migration `supabase/migrations/20261023000002_enable_rls.sql`:
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is hospital staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'triage_staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff Read/Write policies
CREATE POLICY "Staff can view all patients" ON patients FOR SELECT USING (is_staff());
CREATE POLICY "Staff can view all encounters" ON encounters FOR ALL USING (is_staff());
CREATE POLICY "Staff can view vitals" ON vital_signs FOR ALL USING (is_staff());
CREATE POLICY "Staff can view symptoms" ON symptoms FOR ALL USING (is_staff());
CREATE POLICY "Staff can view history" ON medical_history FOR ALL USING (is_staff());
CREATE POLICY "Staff can view triage" ON triage_assessments FOR ALL USING (is_staff());
CREATE POLICY "Staff can view alerts" ON alerts FOR ALL USING (is_staff());

-- Patient Registration (Anon / Public Edge Function)
-- Public can only insert through Edge Function with service role OR dedicated anon insert policy
CREATE POLICY "Anon insert encounters" ON encounters FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert patients" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert vitals" ON vital_signs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert symptoms" ON symptoms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert history" ON medical_history FOR INSERT WITH CHECK (true);
```

---

## 5. Phase 3: Design System, Brand Theme & Core Layouts

### Step 3.1: Brand Guidelines Implementation
1. **Typography:** Use Inter or Outfit via Google Fonts for maximum legibility and healthcare precision.
2. **Logo Component (`BrandLogo.tsx`):**
   - Stylized `M` intersecting with a medical cross and care trajectory.
   - Clean dark-navy badge with teal accent line.
3. **Color Coding Tokens:**
   - Red (`#DC2626` / `bg-red-50 text-red-700 border-red-300`)
   - Yellow (`#EAB308` / `bg-amber-50 text-amber-800 border-amber-300`)
   - Green (`#16A34A` / `bg-emerald-50 text-emerald-800 border-emerald-300`)
   - Black (`#18181B` / `bg-zinc-900 text-white border-zinc-700`) — strictly clinician confirmed.

### Step 3.2: Common Layout Components
- `Header.tsx`: Shows MEDITRIAGE AI logo, tagline ("Right Care, Right Time"), Quick Emergency Help hotline (`108` / `112`), and Staff Portal link.
- `EmergencyBanner.tsx`: Sticky alert warning: *"If experiencing severe chest pain, extreme breathlessness, or collapse, proceed immediately to the nearest Emergency Room. Do not wait for form completion."*

---

## 6. Phase 4: Four-Section Patient Registration Flow

Build a high-speed (1.5 - 2.5 minute) registration wizard using `react-hook-form` and `zod`.

### Step 4.1: Define Zod Validation Schema (`src/lib/validationSchemas.ts`)
```typescript
import { z } from 'zod';

export const registrationSchema = z.object({
  // Section 1: Basic Details
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(0, 'Age cannot be negative').max(125, 'Invalid age'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  contactNumber: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),

  // Section 2: Vitals
  isBpMeasured: z.boolean(),
  systolicBp: z.coerce.number().optional().nullable(),
  diastolicBp: z.coerce.number().optional().nullable(),
  isSpo2Measured: z.boolean(),
  oxygenSaturation: z.coerce.number().optional().nullable(),
  isPulseMeasured: z.boolean(),
  pulseRate: z.coerce.number().optional().nullable(),
  isSugarMeasured: z.boolean(),
  bloodSugar: z.coerce.number().optional().nullable(),

  // Section 3: Symptoms & Duration
  symptoms: z.array(z.string()).min(1, 'Select at least one symptom'),
  otherSymptomsText: z.string().optional(),
  duration: z.enum(['<24_hours', '1-2_days', '>2_days']),

  // Section 4: Medical History
  takingMedications: z.enum(['Yes', 'No', 'Not sure']),
  medicationDetails: z.string().optional(),
  hasConditionsAllergies: z.enum(['Yes', 'No', 'Not sure']),
  conditionDetails: z.string().optional(),
  documentFiles: z.array(z.any()).optional()
}).refine((data) => {
  if (data.isBpMeasured && (!data.systolicBp || !data.diastolicBp)) {
    return false;
  }
  return true;
}, {
  message: 'Enter both Systolic and Diastolic values, or select "Not measured"',
  path: ['systolicBp']
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
```

### Step 4.2: Step-by-Step UI Components
1. **`ProgressBar.tsx`**: Dynamic indicator highlighting Step 1 of 4, Step 2 of 4, etc.
2. **`SectionBasicDetails.tsx`**: High-contrast, clean input fields with auto-focus and mobile telephone keyboard (`inputMode="tel"`).
3. **`SectionVitals.tsx`**:
   - Numeric inputs with units (`mmHg`, `%`, `bpm`, `mg/dL`).
   - Prominent toggle buttons: **"Measured"** vs. **"Not measured / I don't know"**.
   - If "Not measured" is chosen, clear value and disable field; record as `NULL`.
4. **`SectionSymptoms.tsx`**:
   - Checkbox cards: Fever, Cough, Headache, Difficulty breathing, Chest pain, Weakness/Dizziness, Other.
   - Dynamic appearance of emergency alert when "Chest pain" or "Difficulty breathing" is checked.
   - Radio buttons for duration: `< 24 hours`, `1–2 days`, `> 2 days`.
5. **`SectionMedicalHistory.tsx`**:
   - Conditional inputs: if `takingMedications === 'Yes'`, reveal textarea for names & dosages.
   - If `hasConditionsAllergies === 'Yes'`, reveal condition/allergy description.
   - `DocumentUploader.tsx`: Drag-and-drop file upload for prescriptions/lab reports (PDF, JPG, PNG, max 10MB).

---

## 7. Phase 5: Secure Submission Pipeline, UHID Generation & Triage Engine

### Step 5.1: Deterministic Triage Rule Engine (`src/lib/triageEngine.ts`)
Must execute in both client preview and server-side Edge Function:
```typescript
import { RegistrationFormData } from './validationSchemas';

export interface TriageResult {
  category: 'RED' | 'YELLOW' | 'GREEN';
  reason: string;
  recommendedAction: string;
  targetResponseTime: string;
}

export function evaluateTriageCategory(data: RegistrationFormData): TriageResult {
  // RED CONDITIONS (Emergency Priority)
  const isEmergencySymptom = data.symptoms.includes('Difficulty breathing') ||
                             data.symptoms.includes('Chest pain');
  const isHypoxic = data.isSpo2Measured && data.oxygenSaturation && data.oxygenSaturation < 92;
  const isSevereHypertension = data.isBpMeasured && data.systolicBp && data.systolicBp >= 180;
  const isSevereHypotension = data.isBpMeasured && data.systolicBp && data.systolicBp < 90;
  const isTachycardic = data.isPulseMeasured && data.pulseRate && data.pulseRate > 130;
  const isBradycardic = data.isPulseMeasured && data.pulseRate && data.pulseRate < 45;

  if (isEmergencySymptom || isHypoxic || isSevereHypertension || isSevereHypotension || isTachycardic || isBradycardic) {
    return {
      category: 'RED',
      reason: 'Critical vital sign disturbance or severe red-flag symptom detected.',
      recommendedAction: 'Immediate triage nurse evaluation and emergency physician bed assignment.',
      targetResponseTime: 'Immediate (Within 5-10 minutes)'
    };
  }

  // YELLOW CONDITIONS (Urgent Priority)
  const isModerateSpo2 = data.isSpo2Measured && data.oxygenSaturation && data.oxygenSaturation >= 92 && data.oxygenSaturation <= 94;
  const isHighFever = data.symptoms.includes('Fever') && data.duration === '>2_days';
  const isWeakness = data.symptoms.includes('Weakness or dizziness');
  const isElevatedBP = data.isBpMeasured && data.systolicBp && (data.systolicBp >= 150 || data.systolicBp <= 95);

  if (isModerateSpo2 || isHighFever || isWeakness || isElevatedBP) {
    return {
      category: 'YELLOW',
      reason: 'Potentially serious symptoms requiring prompt medical assessment.',
      recommendedAction: 'Priority triage evaluation, vital signs re-check, and physician examination.',
      targetResponseTime: 'Prompt (Within 30-60 minutes)'
    };
  }

  // GREEN CONDITIONS (Routine / Stable Priority)
  return {
    category: 'GREEN',
    reason: 'Mild, stable symptoms with no immediate red-flag indicators detected.',
    recommendedAction: 'Standard waiting queue for general outpatient/clinical consultation.',
    targetResponseTime: 'Standard (Within 2-3 hours)'
  };
}
```

### Step 5.2: Supabase Edge Function (`submit-encounter`)
Create `supabase/functions/submit-encounter/index.ts` to perform atomic database writes:
1. Prevent duplicate submissions using client idempotency keys.
2. Generate secure, non-predictable UHID: `MT-` + DateString + `-` + 4-digit cryptographically random alphanumeric string.
3. Generate Encounter ID: `ENC-` + 6-digit random string.
4. Execute `evaluateTriageCategory`.
5. Atomic Transaction:
   - Insert into `patients`
   - Insert into `encounters`
   - Insert into `vital_signs`
   - Insert into `symptoms`
   - Insert into `medical_history`
   - Insert into `triage_assessments`
   - If `category === 'RED'`, insert into `alerts` with `priority = 'CRITICAL'`
6. Return `{ success: true, uhid, encounterNumber, triageResult }`.

---

## 8. Phase 6: Patient Confirmation & Result Screen

### Step 6.1: Result Screen (`ResultPage.tsx`) Requirements
1. Render only after successful server confirmation.
2. Display:
   - MEDITRIAGE AI Brand Badge
   - Patient Name, Age, and Contact
   - **UHID** and **Encounter ID** with a "Copy" or "Save to Phone" button
   - Date and Timestamp of Submission
   - Prominent Triage Category Card:
     - **RED:** Urgent Red Card, Emergency Alert message, "Report to ED Desk Immediately".
     - **YELLOW:** Urgent Yellow Card, "Take a seat in Priority Waiting Area".
     - **GREEN:** Green Card, "Standard Registration Confirmed. Keep ticket handy".
   - Plain-Language Explanation of next clinical steps.
   - Important Notice: *"Preliminary triage — subject to clinical assessment by a licensed physician."*
   - Print / Download PDF receipt button for patient convenience.

---

## 9. Phase 7: Authentication & Role-Based Access Control (RBAC)

### Step 7.1: Staff Authentication Setup
1. Use Supabase Auth with email & password for hospital employees.
2. Setup Protected Routes using `React Router`:
   - `/staff/login`: Staff login portal.
   - `/staff/dashboard`: Accessible only if `profile.role IN ('admin', 'doctor', 'nurse', 'triage_staff')`.
   - Unauthorized attempts automatically redirect to `/staff/login`.
3. Audit Log Trigger: Record staff logins and session starts in `audit_logs`.

---

## 10. Phase 8: Real-Time Hospital Staff Queue & Dashboard

### Step 8.1: Patient Queue Component (`QueueTable.tsx`)
1. Fetches encounters via `@tanstack/react-query`.
2. Connects to **Supabase Realtime**:
   ```typescript
   supabase
     .channel('encounter-updates')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters' }, () => {
       queryClient.invalidateQueries({ queryKey: ['patient-queue'] });
     })
     .subscribe();
   ```
3. Columns:
   - UHID & Encounter ID
   - Patient Name & Age
   - Registration Time & Elapsed Waiting Time (formatted via `date-fns`)
   - Category Badge (`RED`, `YELLOW`, `GREEN`, `BLACK`)
   - Reported Symptoms & Key Vitals
   - Status Selector (`waiting`, `under_assessment`, `admitted`, `referred`, `discharged`)
   - Alert Status (Acknowledged / Active)
   - Quick Action button ("Open Full Record")

### Step 8.2: Queue Filter Bar (`QueueFilterBar.tsx`)
- Filter by Category (All, Red, Yellow, Green, Black)
- Filter by Status (Waiting, Under Assessment, Completed)
- Search by UHID or Patient Name
- Sort by Urgency (Red first) or Waiting Time (Longest first)

### Step 8.3: Dashboard Analytics (`TriageAnalyticsChart.tsx`)
- Implement Recharts bar & donut chart showing:
  - Total registered patients today
  - Breakdown by triage category (Red %, Yellow %, Green %)
  - Average waiting time before clinician assessment

---

## 11. Phase 9: Priority Alert System & Clinician Override Workflow

### Step 9.1: Staff Audible & Visual Alerts (`useWebAudioAlert.ts`)
- Use **Web Audio API** to generate synthetic high-frequency emergency double-beep for RED cases.
- In-browser user interaction safeguard: Render a "Sound Alerts Enabled / Disabled" toggle in the dashboard header to adhere to browser autoplay policies.
- Ensure audio alerts are never the sole signal; pair with high-visibility pulsing red headers in `AlertNotificationBar.tsx`.
- Staff must click **"Acknowledge Alert"** to silence recurring audio cues, recording their user ID and timestamp.

### Step 9.2: Clinician Override Modal (`ClinicianOverrideModal.tsx`)
- **Safety Rule:** Only authorized clinicians (Doctors) can override a triage category.
- Form inputs:
  - New Category (Red, Yellow, Green, or clinician-verified Black)
  - **Mandatory Justification Reason** (text area, minimum 20 characters)
- Submission:
  - Updates `triage_assessments.category`
  - Sets `clinician_overridden = TRUE`
  - Records `overridden_by`, `overridden_at`, and `override_reason`
  - Logs the override in `audit_logs` table.

---

## 12. Phase 10: Private Medical Document Management

### Step 10.1: Supabase Storage Configuration
1. Create private bucket: `patient-medical-documents`.
2. Storage Access Policies:
   - Patients can upload during registration (signed upload policy or Edge Function proxy).
   - Public read is **strictly disabled**.
   - Hospital staff with active JWT can generate signed read URLs (15-minute expiry).

### Step 10.2: Document Viewer Component
- Staff clicks "View Prescription / Lab Report" in `PatientDetailModal.tsx`.
- Fetches secure signed URL from `supabase.storage.from('patient-medical-documents').createSignedUrl(path, 900)`.
- Renders image preview or embedded PDF viewer in a modal dialog.

---

## 13. Phase 11: Optional Gemini AI Clinical Handover Summarization

### Step 13.1: Server-Side Gemini Edge Function (`summarize-symptoms`)
- API key `GEMINI_API_KEY` stored exclusively in Supabase Secrets.
- Called on-demand when a clinician clicks **"Generate AI Handover Summary"**.
- System Prompt:
  ```
  You are an AI Clinical Scribe assistant for hospital triage staff.
  Summarize the patient's reported symptoms, duration, vitals, and medical history into a concise 3-sentence clinical handover note.
  CRITICAL SAFETY RULES:
  1. DO NOT provide a medical diagnosis.
  2. DO NOT state that the patient is safe or healthy.
  3. Highlight any abnormal vital signs and severe red-flag symptoms.
  4. Always append: "Preliminary summary for clinician review only."
  ```
- Store result in `encounters.ai_summary` with audit logging.

---

## 14. Phase 12: Quality Assurance, Automated Testing & Security Audit

### Step 14.1: Unit & Integration Tests (Vitest)
- Test `triageEngine.test.ts`:
  - Verify hypoxic SpO2 (<92%) always produces RED.
  - Verify missing vitals are not converted to normal defaults.
  - Verify BLACK category cannot be generated by rules.
  - Verify typical mild flu symptoms produce GREEN.
- Test form validation schema with edge cases (boundary ages, invalid phone numbers).

### Step 14.2: End-to-End Tests (Playwright)
- `patientRegistration.spec.ts`:
  1. Complete 4-step registration on desktop and mobile viewports.
  2. Verify emergency banner shows up upon selecting "Chest pain".
  3. Submit form and verify transition to Result Page with UHID.
- `staffDashboard.spec.ts`:
  1. Login as triage nurse.
  2. Verify patient appears in queue.
  3. Filter by "RED" priority.
  4. Perform Clinician Override with reason.
  5. Confirm override appears in audit trail.

---

## 15. Phase 13: Production Deployment & Verification Checklist

### Step 15.1: Supabase Production Deployment
1. Link project: `npx supabase link --project-ref your-supabase-id`.
2. Push migrations: `npx supabase db push`.
3. Deploy Edge Functions:
   ```bash
   npx supabase functions deploy submit-encounter
   npx supabase functions deploy summarize-symptoms
   ```
4. Set secrets: `npx supabase secrets set GEMINI_API_KEY=your_key`.

### Step 15.2: Frontend Deployment on Vercel
1. Connect Git repository to Vercel.
2. Set build command: `npm run build`, output directory: `dist`.
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy and verify HTTPS certificate and responsive layout across mobile, tablet, and desktop.

### Step 15.3: Pre-Launch Acceptance Verification Checklist
- [ ] Four-section registration flow completes in under 2.5 minutes.
- [ ] Emergency warnings are displayed immediately without needing form submission.
- [ ] "Not measured" vitals are correctly stored as `NULL` without failing validation.
- [ ] Unique UHID (`MT-YYYYMMDD-XXXX`) and Encounter ID are generated.
- [ ] Result page shows preliminary triage status only after backend persistence.
- [ ] Staff dashboard updates in real-time when new submissions arrive.
- [ ] Audible alert plays for Red cases upon staff interaction.
- [ ] Clinician override enforces mandatory justification reason.
- [ ] Black status is never auto-assigned by system or AI.
- [ ] Storage bucket is private with signed URL access only.
- [ ] Role-based access control blocks unauthorized record access.
- [ ] Disclaimers clearly label all outputs as mock/preliminary triage.
