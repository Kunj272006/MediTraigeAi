# MEDITRIAGE AI --- Project Idea & Build Specification

**Tagline:** Right Care, Right Time\
**Project type:** AI-assisted healthcare triage and patient-registration
platform\
**Primary goal:** Reduce patient registration time, help healthcare
staff identify potentially urgent cases, organize medical records, and
support faster initial assessment.

> **Critical safety principle:** MEDITRIAGE AI provides preliminary
> triage support only. It must not diagnose patients, independently
> declare a patient safe, or replace a qualified healthcare
> professional. Clinical triage rules must be approved and validated by
> the hospital before real-world use.

## 1. Product Vision

Build a modern, responsive healthcare platform that lets a patient
submit essential personal details, available vital signs, current
symptoms, relevant medical history, and optional medical documents in
approximately **1.5--2.5 minutes** when information is readily
available.

After successful submission, the platform should create a
patient/encounter record, generate a unique identification number, and
show a preliminary urgency category with plain-language next steps.
Authorized hospital staff should be able to view and manage a
prioritized patient queue.

## 2. Brand and Visual Direction

-   Product name: **MEDITRIAGE AI**
-   Tagline: **Right Care, Right Time**
-   Style: modern, professional, trustworthy, minimal, accessible
    healthcare technology.
-   Base: clean white backgrounds, dark navy blue typography, and teal
    accents.
-   Use red, yellow, and green for clearly labelled urgency indicators.
    Black is reserved for a clinician-confirmed deceased status and must
    never be assigned automatically.
-   Logo direction: a distinctive, simple healthcare-tech mark that can
    work as a favicon, app icon, dashboard logo, and wordmark. Explore a
    stylized "M" combined subtly with a medical cross, person/patient
    symbol, or care pathway. Avoid overly complex medical clip-art and
    avoid copying existing brand logos.
-   Typography should be highly legible. Use consistent spacing, clear
    hierarchy, large touch targets, and accessible contrast.
-   Design for desktop, tablet, and mobile.
-   Show progress through the patient registration flow and identify
    required versus optional fields.
-   Keep the interface calm and professional. Do not use excessive
    gradients, glowing effects, decorative animation, or generic-looking
    buttons.

## 3. Main User Roles

1.  **Patient:** completes registration, shares symptoms and available
    information, uploads optional records, and sees their submission
    confirmation and preliminary next steps.
2.  **Nurse/triage staff:** reviews the queue, sees urgency alerts,
    acknowledges alerts, and updates workflow status.
3.  **Doctor/authorized clinician:** reviews patient information,
    assesses the patient, and can override a preliminary category with a
    recorded reason.
4.  **Administrator:** manages authorized accounts, roles,
    configuration, and audit review.

Use role-based access control. Do not expose records or clinical notes
to unauthorized users.

## 4. Patient Registration Flow

Use four clear sections with validation and a visible progress
indicator.

### Section 1 --- Basic Patient Details

Collect: - Full name - Age - Contact number - Gender

Validate age and phone number appropriately. Collect only information
necessary for patient care.

### Section 2 --- Current Health Measurements

Collect, where available: - Blood pressure: systolic and diastolic
values in mmHg - Oxygen saturation (SpO₂) in percent - Pulse rate in
beats per minute - Blood sugar in mg/dL, when available or relevant

For each measurement: - Show the unit beside the field. - Validate
numeric input and reasonable data-entry boundaries. - Offer **"Not
measured"** or **"I don't know"**. - Never force a patient to guess. -
Never interpret missing measurements as normal. - Never delay emergency
help because a measurement is unavailable.

### Section 3 --- Symptoms and Duration

Ask: **"What symptoms are you experiencing right now?"**

Allow multiple selections: - Fever - Cough - Headache - Difficulty
breathing - Chest pain - Weakness or dizziness - Other symptoms

If "Other symptoms" is selected, reveal a text field.

Ask how long symptoms have been present: - Less than 24 hours - 1--2
days - More than 2 days

Display a prominent emergency warning for symptoms that may require
immediate attention, especially severe breathing difficulty, chest pain,
unconsciousness, or other emergency warning signs. Tell patients to seek
emergency help immediately when indicated; do not make them wait for
form submission or an online result.

### Section 4 --- Relevant Medical History

Ask: **"Are you currently taking any medicines?"** - Yes - No - Not sure

If Yes, show fields for medicine names and doses, if known, plus an
optional prescription/current medication-list upload.

Ask: **"Do you have any known medical conditions or allergies?"** -
Yes - No - Not sure

If Yes, show fields for known conditions and allergies/previous
reactions, plus an optional upload for relevant medical reports or
prescriptions.

Support PDF, JPG, and PNG uploads subject to secure storage and
file-size limits. Uploads must be optional and must not block emergency
assessment. Show upload progress and clear error states.

## 5. Submission and Patient Result

On submission: 1. Validate fields on the client and server. 2. Prevent
accidental duplicate submissions. 3. Create a patient record and a
separate encounter record for the visit. 4. Generate a unique,
non-predictable UHID and encounter ID. 5. Record submission date and
time. 6. Evaluate available information only through a configured,
clinically approved triage protocol. 7. Store the result securely and
make it accessible to authorized staff. 8. Show confirmation only after
the backend confirms successful storage.

The patient result page should display: - MEDITRIAGE AI branding -
Patient name - UHID - Submission date and time - Preliminary triage
category - Plain-language explanation - Recommended next steps -
Instructions for seeking emergency help

Clearly label the result **"Preliminary triage --- subject to clinical
assessment."** For emergency cases, prominently direct the patient to
obtain immediate medical assistance rather than waiting for an online
result or appointment. Never expose internal clinical notes, other
patients' data, or sensitive documents on a public result page.

## 6. Triage Categories and Safety Rules

The project uses these four categories:

### RED --- Emergency / Immediate Priority

-   Indicates a potentially life-threatening condition or an emergency
    under the approved protocol.
-   Show a high-priority visual alert and an audible alert for
    authorized clinical staff.
-   Direct the patient to immediate emergency assessment.
-   Any proposed response target such as 5--10 minutes is a
    project-specific operational target, not a universal medical
    standard.

### YELLOW --- Urgent / High Priority

-   Indicates a potentially serious condition requiring prompt
    assessment.
-   Show the assessment timeframe specified by the hospital's approved
    protocol.
-   A proposed 30--60 minute target may be used only where clinically
    appropriate and approved.

### GREEN --- Lower Priority / Stable

-   Means lower priority under the approved protocol; it does **not**
    guarantee the patient is healthy.
-   A proposed target of within 3 hours may be used only where
    clinically appropriate and approved.
-   Tell patients to seek help if symptoms worsen.

### BLACK --- Death / Deceased

-   Never assign automatically through the website, AI, or missing data.
-   Record only through an appropriately authorized healthcare
    professional following applicable clinical and legal procedures.
-   Never use Black for missing information, unconsciousness, critical
    illness, or an unresponsive patient whose status has not been
    professionally established.

### Mandatory safeguards

-   Do not assign a category based on a single symptom or measurement
    alone.
-   Missing information must remain missing/unknown; do not infer
    normality.
-   Use an approved, clinically validated rules engine that considers
    relevant symptoms, vital signs, patient context, and missing data.
-   AI may organize information and summarize symptoms, but must not
    invent diagnoses or claim certainty.
-   Require clinician oversight, a clinician override with a reason, and
    an audit trail.
-   Do not present a prototype's mock triage logic as clinically
    validated.

## 7. Hospital Staff Dashboard

Create a responsive dashboard with a sortable patient queue.

Each row should show: - UHID and encounter ID - Patient name and age -
Registration time - Preliminary triage category - Reported symptoms -
Available vital signs - Workflow status: waiting, under assessment,
admitted, referred, or discharged - Alert acknowledgement status

Include filters for Red, Yellow, Green, and clinician-confirmed Black
records. Sort by urgency and waiting time according to the configured
hospital protocol.

Authorized clinicians should be able to: - Open a patient's record -
Review current and previous encounter details, where available - Update
workflow status - Override a preliminary triage result with a mandatory
reason - Acknowledge alerts

Record overrides, alert creation, alert acknowledgement, record access,
and modifications in audit logs.

## 8. Alert Behaviour

-   Red: highest-priority visual alert and urgent staff beep.
-   Yellow: distinct priority notification.
-   Green: routine notification.
-   Black: separate staff-only notification for clinician-confirmed
    status.

Allow authorized staff to acknowledge alerts. Record alert time,
acknowledgement time, and escalation status. Alerts must remain visible
as well as audible; sound cannot be the only notification method.
Provide configurable sound/volume settings and avoid unnecessary alarms.
Browser audio may require staff to enable sound through an explicit
interaction; do not rely on a patient's browser to autoplay audio.

## 9. UHID, Records, and Security

-   Generate unique, non-predictable patient UHIDs and separate
    encounter IDs.
-   Prevent duplicate records where possible without incorrectly merging
    different people.
-   Permit authorized staff to search and retrieve records.
-   Support prior visits, vital signs, symptoms, prescriptions, and
    uploaded reports where implemented.
-   Provide patient access only through verified authentication.
-   Never grant access solely because someone knows a UHID.
-   Apply role-based access for patients, doctors, nurses, and
    administrators.
-   Secure data in transit and at rest.
-   Validate uploads, enforce size/type limits, and store files
    securely.
-   Keep credentials and secret keys on the server, never in frontend
    code.
-   Maintain audit logs and appropriate retention/deletion policies.
-   Design for applicable Indian data-protection requirements and
    hospital policies.
-   Use fictional/mock patient data in public demos. Do not use real
    patient information in a public prototype.

## 10. Suggested Technical Architecture

Choose a modern frontend framework, secure backend, and database with
authentication and access control. Keep the architecture modular:

-   **Frontend:** responsive patient registration, result page, staff
    dashboard, form validation, accessible components.
-   **Backend/API:** authentication, authorization, validation,
    patient/encounter creation, triage-protocol integration, alert
    management, audit logging.
-   **Database:** patient records, encounters, vital signs, symptoms,
    medical history, triage results, alert events, user roles, audit
    events.
-   **File storage:** private object/file storage for uploaded medical
    documents, with authorized access only.
-   **Triage rules engine:** separately configured and versioned; do not
    bury unapproved medical rules in UI code.
-   **Notifications:** configurable staff-facing visual and audio
    alerts.

Keep frontend and backend responsibilities separate. Never put secret
keys or privileged database credentials in client-side code.

## 11. Prototype Scope and Build Order

Build a working prototype first, using realistic but fictional sample
data.

1.  Create the MEDITRIAGE AI brand mark/wordmark and responsive design
    system.
2.  Build the four-section registration flow with conditional fields,
    progress, validation, and optional uploads.
3.  Build backend submission handling and duplicate-submit protection.
4.  Generate a unique UHID and encounter ID; record the submission
    timestamp.
5.  Build the result/confirmation page.
6.  Build the staff dashboard, patient queue, filters, statuses, and
    alert acknowledgement.
7.  Add role-based authentication and secure record access.
8.  Add audit logging and clinician override workflow.
9.  Integrate only approved triage protocols; until then, clearly mark
    demo results as mock/non-clinical.
10. Test responsive layouts, validation, upload failures, authorization,
    duplicate submissions, and emergency-warning visibility.

## 12. Acceptance Criteria

The prototype is ready for demonstration when: - The registration flow
has all four sections and conditional questions. - Patients can mark
readings as unavailable without guessing. - Emergency warnings are
visible and do not require form submission. - Uploads are optional and
errors are handled clearly. - A successful submission creates a unique
UHID and encounter ID. - The result page confirms storage only after
backend success. - The staff dashboard shows mock records, categories,
symptoms, vital signs, statuses, and alert acknowledgement. - Role
restrictions prevent unauthorized access to records. - Clinician
overrides require a reason and are audited. - Black status cannot be
automatically assigned. - The UI works on mobile, tablet, and desktop. -
Mock clinical results are not misrepresented as validated medical
advice.

## 13. Important Limitations to Document

Clearly disclose any feature that still needs external services,
clinical approval, or further implementation. A prototype must not claim
real clinical validity, secure production readiness, live notifications,
authentication, database persistence, or file security unless those
features are actually implemented and tested.

If a Google Form is used as a temporary alternative, document its
limitations: a standard Google Form alone cannot reliably provide the
complete real-time clinical dashboard, secure patient portal, emergency
alert workflow, or secure record retrieval described above.

## Core Mission

**MEDITRIAGE AI --- Right Care, Right Time.**\
Help patients share the right information quickly and help authorized
healthcare teams recognize urgency sooner, while keeping clinical
decisions under qualified human oversight.
