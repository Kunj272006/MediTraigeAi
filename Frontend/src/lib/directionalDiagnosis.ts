import type { TriageCategory, VitalsData } from '../types';

export interface MajorProblemDiagnosis {
  id: string;
  name: string;
  icd10Code: string;
  department: string;
  organSystem: string;
  severity: 'Critical / High Acuity' | 'Urgent / Moderate Acuity' | 'Mild / Primary Care';
  matchScore: number; // 0-100%
  whyMajorProblem: string;
  keySymptomsMatched: string[];
  recommendedFirstAid: string;
  recommendedDiagnostics: string[];
}

export interface DifferentialCondition {
  id: string;
  name: string;
  icd10Code?: string;
  department: string;
  matchScore: number;
  urgency: 'Critical' | 'Urgent' | 'Moderate' | 'Routine';
  matchingSymptoms: string[];
  clinicalRationale: string;
  keyDiagnosticTests: string[];
}

export interface DirectionalAssessmentResult {
  disclaimerNotice: string;
  targetConsultWindow: string;
  majorProblem: MajorProblemDiagnosis;
  differentialConditions: DifferentialCondition[];
  evaluatedSymptoms: string[];
}

interface DiseaseTemplate {
  name: string;
  icd10: string;
  department: string;
  organSystem: string;
  defaultSeverity: 'Critical / High Acuity' | 'Urgent / Moderate Acuity' | 'Mild / Primary Care';
  urgency: 'Critical' | 'Urgent' | 'Moderate' | 'Routine';
  triggerKeywords: string[];
  whyMajor: string;
  rationale: string;
  firstAid: string;
  diagnostics: string[];
  isBasicDisease: boolean;
}

const CLINICAL_DISEASE_REGISTRY: DiseaseTemplate[] = [
  // ----------------------------------------------------
  // 1. BASIC / COMMON EVERYDAY DISEASES
  // ----------------------------------------------------
  {
    name: 'Acute Viral Upper Respiratory Infection (Common Cold / Pharyngitis)',
    icd10: 'J06.9',
    department: 'General Medicine / Outpatient OPD',
    organSystem: 'Upper Respiratory Tract',
    defaultSeverity: 'Mild / Primary Care',
    urgency: 'Routine',
    triggerKeywords: ['cold', 'cough', 'runny nose', 'sneezing', 'sore throat', 'throat', 'congestion', 'mild fever', 'nasal', 'hoarseness'],
    whyMajor: 'Presenting symptoms of nasal congestion, sneezing, throat irritation, and dry/productive cough strongly match a localized viral upper respiratory tract infection.',
    rationale: 'Self-limiting viral inflammatory condition of the rhinopharyngeal mucosa without lower airway consolidation.',
    firstAid: 'Warm saline gargles, steam inhalation, adequate oral hydration, and paracetamol for throat discomfort.',
    diagnostics: ['Clinical Throat Examination', 'Throat Swab / Rapid Viral Screen (if persistent >5 days)', 'Complete Blood Count (CBC)'],
    isBasicDisease: true,
  },
  {
    name: 'Acute Viral Fever / Influenza (Flu)',
    icd10: 'J10.1',
    department: 'Internal Medicine / Family Medicine',
    organSystem: 'Systemic / Immune System',
    defaultSeverity: 'Urgent / Moderate Acuity',
    urgency: 'Moderate',
    triggerKeywords: ['fever', 'chills', 'body ache', 'myalgia', 'fatigue', 'weakness', 'headache', 'sweat', 'malaise', 'shivering'],
    whyMajor: 'High-grade fever paired with generalized muscular aches (myalgia), chills, and profound fatigue is the hallmark presentation of an acute systemic viral syndrome (such as Influenza, Dengue, or Viral Fever).',
    rationale: 'Systemic pyrogenic cytokine surge triggering thermoregulatory reset and generalized muscle inflammation.',
    firstAid: 'Rest in cool airy room, lukewarm sponge sponging if temp > 101°F, oral rehydration salts (ORS), and fever control.',
    diagnostics: ['Complete Blood Count (Platelets, TLC/DLC)', 'Rapid Dengue NS1 / Malarial Antigen (if endemic)', 'Serum Electrolytes'],
    isBasicDisease: true,
  },
  {
    name: 'Acute Gastroenteritis / Food Poisoning',
    icd10: 'A09',
    department: 'Gastroenterology / Outpatient Care',
    organSystem: 'Digestive System (Stomach & Intestines)',
    defaultSeverity: 'Urgent / Moderate Acuity',
    urgency: 'Moderate',
    triggerKeywords: ['vomiting', 'loose motions', 'diarrhea', 'nausea', 'stomach pain', 'cramps', 'abdominal pain', 'food', 'food poisoning', 'stool'],
    whyMajor: 'Simultaneous abdominal cramping, loose watery stools, and vomiting typically indicates acute infective or toxin-mediated gastrointestinal mucosal inflammation (Food Poisoning or Viral Gastroenteritis).',
    rationale: 'Enteric mucosal hypersecretion and rapid gut transit resulting from viral/bacterial enterotoxins.',
    firstAid: 'Strict Oral Rehydration Salts (ORS) solution intake in small sips, light electrolyte diet (boiled rice, curd, tender coconut water), anti-emetic as prescribed.',
    diagnostics: ['Stool Routine & Microscopy', 'Serum Electrolytes (Sodium, Potassium)', 'Blood Urea & Creatinine (Dehydration check)'],
    isBasicDisease: true,
  },
  {
    name: 'Gastroesophageal Reflux Disease (GERD) / Acid Peptic Gastritis',
    icd10: 'K21.9',
    department: 'Gastroenterology & Internal Medicine',
    organSystem: 'Upper Digestive (Esophagus & Stomach)',
    defaultSeverity: 'Mild / Primary Care',
    urgency: 'Routine',
    triggerKeywords: ['acidity', 'burning', 'heartburn', 'burping', 'gas', 'acid reflux', 'sour taste', 'chest burning', 'epigastric', 'indigestion'],
    whyMajor: 'Retrosternal or epigastric burning pain aggravated by food or recumbency, accompanied by sour belching, is typical for acid reflux and gastric mucosal hyperacidity rather than cardiac ischemia.',
    rationale: 'Transient lower esophageal sphincter relaxation allowing retrograde acidic gastric juice reflux into the esophagus.',
    firstAid: 'Sit upright, avoid caffeine/spicy foods, drink a glass of cold milk or water, antacid oral suspension.',
    diagnostics: ['Upper Gastrointestinal Endoscopy (OGD if persistent)', 'H. pylori Antigen Test', 'ECG (to definitively rule out atypical cardiac ischemia)'],
    isBasicDisease: true,
  },
  {
    name: 'Migraine / Tension-Type Cephalea (Severe Headache)',
    icd10: 'G43.9',
    department: 'Neurology & Primary Care',
    organSystem: 'Nervous System (Cerebral Vasculature)',
    defaultSeverity: 'Urgent / Moderate Acuity',
    urgency: 'Moderate',
    triggerKeywords: ['headache', 'head pain', 'migraine', 'throbbing', 'light sensitivity', 'photophobia', 'nausea with headache', 'forehead', 'temple'],
    whyMajor: 'Unilateral or bilateral throbbing head pain exacerbated by light and sound with accompanying nausea is characteristic of neurovascular Migraine or severe Tension-type Cephalea.',
    rationale: 'Trigeminovascular activation and neurogenic dural inflammation causing rhythmic throbbing cephalea.',
    firstAid: 'Rest in a quiet dark room, cold compress on forehead, adequate hydration, analgesia as directed by physician.',
    diagnostics: ['Clinical Neurological & Fundoscopic Examination', 'Blood Pressure Check', 'Neuro-imaging (CT/MRI only if thunderclap onset or neurological deficit)'],
    isBasicDisease: true,
  },
  {
    name: 'Acute Bronchial Asthma / Allergic Bronchospasm',
    icd10: 'J45.9',
    department: 'Pulmonology & Respiratory Medicine',
    organSystem: 'Lower Airways (Bronchi)',
    defaultSeverity: 'Urgent / Moderate Acuity',
    urgency: 'Urgent',
    triggerKeywords: ['wheezing', 'breathless', 'inhaler', 'asthma', 'chest tightness', 'shortness of breath', 'dust allergy', 'panting'],
    whyMajor: 'Expiratory whistling (wheezing) and episodic breathlessness with chest tightness points directly to reversible bronchial hyperreactivity and airway constriction.',
    rationale: 'Bronchial smooth muscle spasm, mucosal edema, and tenacious mucus plug accumulation obstructing expiratory airflow.',
    firstAid: 'Sit upright, administer rescue inhaled bronchodilator (Salbutamol inhaler with spacer), loosen tight clothing.',
    diagnostics: ['Peak Expiratory Flow Rate (PEFR)', 'Continuous Pulse Oximetry (SpO2)', 'Chest Radiograph PA View', 'Spirometry with Reversibility'],
    isBasicDisease: true,
  },
  {
    name: 'Urinary Tract Infection (UTI / Acute Cystitis)',
    icd10: 'N39.0',
    department: 'Urology / General Medicine',
    organSystem: 'Urinary System (Bladder & Urethra)',
    defaultSeverity: 'Mild / Primary Care',
    urgency: 'Routine',
    triggerKeywords: ['urine', 'burning urine', 'dysuria', 'frequent urination', 'lower abdominal pain', 'bladder', 'urinary', 'pelvic pain'],
    whyMajor: 'Painful, burning sensation during micturition (dysuria) coupled with increased urinary urgency and suprapubic discomfort strongly indicates bacterial cystitis/UTI.',
    rationale: 'Ascending coliform bacterial colonization of the bladder and urethral epithelium provoking local inflammatory hyperalgesia.',
    firstAid: 'Liberal water consumption (3–4 liters), urinary alkalinizer sachet, avoid holding urine.',
    diagnostics: ['Urine Routine & Microscopy (Pus cells / RBCs)', 'Urine Culture & Antibiotic Sensitivity', 'Kidney-Ureter-Bladder (KUB) Ultrasound if recurrent'],
    isBasicDisease: true,
  },
  {
    name: 'Acute Allergic Dermatitis / Urticaria (Skin Rash & Itching)',
    icd10: 'L50.9',
    department: 'Dermatology & Allergy Clinic',
    organSystem: 'Integumentary System (Skin)',
    defaultSeverity: 'Mild / Primary Care',
    urgency: 'Routine',
    triggerKeywords: ['rash', 'itching', 'skin', 'red spots', 'hives', 'allergy', 'wheals', 'bumps', 'swelling on skin'],
    whyMajor: 'Sudden onset erythematous pruritic wheals or papular rash without stridor indicates cutaneous mast cell histamine degranulation (Allergic Urticaria).',
    rationale: 'Type-1 hypersensitivity cutaneous release of histamine and leukotrienes causing dermal capillary leak and wheal formation.',
    firstAid: 'Apply soothing calamine lotion, cool bath, avoid scratching, oral anti-histaminic as prescribed.',
    diagnostics: ['Clinical Dermatological Assessment', 'Allergen Panel Testing (if recurrent)', 'Blood Absolute Eosinophil Count (AEC)'],
    isBasicDisease: true,
  },
  {
    name: 'Musculoskeletal Lumbar / Cervical Muscle Strain',
    icd10: 'M54.5',
    department: 'Orthopedics & Physical Medicine',
    organSystem: 'Musculoskeletal System',
    defaultSeverity: 'Mild / Primary Care',
    urgency: 'Routine',
    triggerKeywords: ['back pain', 'neck pain', 'joint pain', 'muscle pull', 'stiffness', 'twist', 'lifting', 'sprain', 'knee pain', 'shoulder'],
    whyMajor: 'Localized pain exacerbated by spinal flexion, physical loading, or sudden movement without neurological radiating numbness indicates acute myofascial ligamentous strain.',
    rationale: 'Micro-tears in paravertebral or peripheral muscle fibers accompanied by protective reflex muscle spasm.',
    firstAid: 'Ice pack for first 48 hours, ergonomic rest, avoid heavy lifting, gentle localized stretching.',
    diagnostics: ['Targeted Digital X-Ray (AP/Lateral)', 'Neurological Reflex & Straight Leg Raise (SLR) Test', 'Physical Therapy Assessment'],
    isBasicDisease: true,
  },

  // ----------------------------------------------------
  // 2. CRITICAL & HIGH-ACUITY EMERGENCY CONDITIONS
  // ----------------------------------------------------
  {
    name: 'Acute Coronary Syndrome (ACS / Myocardial Infarction)',
    icd10: 'I21.9',
    department: 'Cardiology & Emergency Resuscitation',
    organSystem: 'Cardiovascular System (Coronary Arteries)',
    defaultSeverity: 'Critical / High Acuity',
    urgency: 'Critical',
    triggerKeywords: ['chest pain', 'crushing chest', 'heart attack', 'angina', 'radiating pain', 'left arm pain', 'jaw pain', 'sweating', 'cardiac', 'tachycardia'],
    whyMajor: 'Heavy retrosternal crushing pain radiating to the left arm/jaw with diaphoresis and shortness of breath is a medical emergency indicating compromised coronary perfusion.',
    rationale: 'Acute plaque rupture and thrombotic occlusion of an epicardial coronary artery leading to transmural myocardial ischemia.',
    firstAid: 'Immediate rest in semi-Fowler position, chew 325mg Aspirin if no allergy/bleeding, call 108 ambulance immediately.',
    diagnostics: ['Immediate 12-Lead ECG (within 10 mins)', 'High-Sensitivity Troponin I/T serial assay', 'Bedside 2D-Echocardiogram', 'Coronary Angiography (CAG)'],
    isBasicDisease: false,
  },
  {
    name: 'Acute Pulmonary Embolism (PE)',
    icd10: 'I26.9',
    department: 'Pulmonology & Critical Care',
    organSystem: 'Cardiopulmonary (Pulmonary Arteries)',
    defaultSeverity: 'Critical / High Acuity',
    urgency: 'Critical',
    triggerKeywords: ['sudden breathlessness', 'pleuritic chest pain', 'hypoxia', 'spo2 drop', 'rapid breathing', 'dvt', 'swollen leg'],
    whyMajor: 'Abrupt onset breathlessness with pleuritic chest tightness, hypoxia, and unexplained tachycardia raises high suspicion for pulmonary arterial occlusion.',
    rationale: 'Dislodged deep venous thrombus occluding pulmonary arterial vasculature causing ventilation-perfusion mismatch and acute right heart strain.',
    firstAid: 'High-flow oxygen, maintain absolute bed rest, continuous vitals telemetry, emergency transport.',
    diagnostics: ['CT Pulmonary Angiogram (CTPA - Gold Standard)', 'Quantitative D-Dimer Assay', 'Bedside Echocardiogram (McConnell sign check)', 'Bilateral Lower Limb Venous Doppler'],
    isBasicDisease: false,
  },
  {
    name: 'Acute Hemorrhagic Shock / Poly-Trauma',
    icd10: 'R57.1',
    department: 'Trauma & Emergency Surgery',
    organSystem: 'Circulatory System / Vascular Integrity',
    defaultSeverity: 'Critical / High Acuity',
    urgency: 'Critical',
    triggerKeywords: ['bleeding', 'blood loss', 'accident', 'trauma', 'hemorrhage', 'deep wound', 'laceration', 'fracture', 'crush', 'fall'],
    whyMajor: 'Profuse active blood loss from traumatic injury poses an imminent threat of hypovolemic shock, requiring immediate pressure hemostasis and surgical intervention.',
    rationale: 'Rapid intravascular volume depletion exceeding compensatory vasoconstriction leading to cellular hypoxia and hypoperfusion.',
    firstAid: 'Apply continuous firm direct pressure with clean dressing, elevate injured limb if not fractured, keep warm, emergency transport.',
    diagnostics: ['eFAST Ultrasound in Trauma Bay', 'Blood Grouping & Cross-matching 4 Units PRBC', 'Serial Hemoglobin & Coagulation Profile (PT/INR)', 'Whole Body Polytrauma CT'],
    isBasicDisease: false,
  },
  {
    name: 'Acute Cerebrovascular Stroke (CVA / Infarction)',
    icd10: 'I63.9',
    department: 'Neurology & Stroke Resuscitation',
    organSystem: 'Central Nervous System (Brain)',
    defaultSeverity: 'Critical / High Acuity',
    urgency: 'Critical',
    triggerKeywords: ['facial droop', 'arm weakness', 'speech difficulty', 'slurred speech', 'paralysis', 'one side weakness', 'confusion', 'collapse', 'sudden severe headache'],
    whyMajor: 'Sudden onset facial asymmetry, arm drift, or slurred speech (FAST criteria) is an acute neurological emergency requiring urgent evaluation for thrombolytic reperfusion.',
    rationale: 'Focal cerebral ischemia from thromboembolic arterial occlusion leading to rapid neuronal apoptosis.',
    firstAid: 'Check time of onset, keep patient flat on one side (recovery position) if vomiting, do NOT give food, water, or aspirin, transport immediately to stroke center.',
    diagnostics: ['Emergency Non-Contrast Brain CT / MRI DWI', 'Blood Glucose Check (rule out hypoglycemia)', 'NIH Stroke Scale (NIHSS)', 'CT Angiography of Head and Neck'],
    isBasicDisease: false,
  },
  {
    name: 'Severe Lower Respiratory Tract Infection (Pneumonia / Sepsis)',
    icd10: 'J18.9',
    department: 'Pulmonology & Critical Care',
    organSystem: 'Lower Respiratory Tract (Lung Parenchyma)',
    defaultSeverity: 'Urgent / Moderate Acuity',
    urgency: 'Urgent',
    triggerKeywords: ['high fever', 'cough with phlegm', 'yellow sputum', 'chest pain while breathing', 'chills', 'hypoxia', 'rapid pulse'],
    whyMajor: 'Persistent high fever, purulent sputum, and pleuritic pain indicates microbial infection of the alveolar tissue with consolidation and potential systemic sepsis.',
    rationale: 'Bacterial or viral alveolar exudative consolidation impairing gas diffusion and invoking systemic inflammatory response.',
    firstAid: 'Oxygen supplementation if SpO2 < 93%, paracetamol for pyrexia, oral fluids, prompt medical evaluation.',
    diagnostics: ['Chest Radiograph (PA/Lateral Views)', 'Complete Blood Count (CBC) with Differential', 'Blood & Sputum Gram Stain & Cultures', 'Serum C-Reactive Protein (CRP) & Procalcitonin'],
    isBasicDisease: false,
  },
  {
    name: 'Acute Appendicitis / Acute Peritoneal Abdomen',
    icd10: 'K35.8',
    department: 'General Surgery & Acute Care',
    organSystem: 'Digestive System (Appendix / Peritoneum)',
    defaultSeverity: 'Urgent / Moderate Acuity',
    urgency: 'Urgent',
    triggerKeywords: ['right lower abdomen', 'belly pain', 'sharp stomach pain', 'rebound pain', 'fever with vomiting', 'severe stomach cramp'],
    whyMajor: 'Periumbilical pain shifting to the right lower quadrant (McBurney point) with tenderness and vomiting is characteristic of acute appendiceal inflammation requiring surgical assessment.',
    rationale: 'Luminal obstruction of the vermiform appendix leading to ischemia, bacterial invasion, and peritoneal irritation.',
    firstAid: 'Keep patient fasting (NPO - nothing by mouth for potential surgery), avoid hot fermentation or pain killers that mask signs, immediate surgical consult.',
    diagnostics: ['High-Resolution Ultrasound of Right Iliac Fossa', 'Contrast-Enhanced Abdominal CT Scan', 'Complete Blood Count (Leukocytosis check)', 'Serum Electrolytes'],
    isBasicDisease: false,
  },
];

/**
 * Intelligent Symptom Matcher: Evaluates presenting symptoms and pinpoints:
 * 1. The MAJOR / PRIMARY SUSPECTED PROBLEM
 * 2. Secondary & Differential Possibilities
 * 3. Color-coded doctor consultation timeframe
 */
export function evaluateDirectionalDiagnoses(
  symptomsList: string[],
  otherText = '',
  vitals?: VitalsData,
  category: TriageCategory = 'RED'
): DirectionalAssessmentResult {
  const combinedTokens = [
    ...symptomsList.map((s) => s.toLowerCase()),
    ...otherText.toLowerCase().split(/[\s,;.+]+/),
  ].filter(Boolean);

  // Consider vitals flags
  if (vitals?.heartRate && vitals.heartRate > 100) combinedTokens.push('tachycardia', 'rapid pulse', 'heart');
  if (vitals?.oxygenSaturation && vitals.oxygenSaturation < 92) combinedTokens.push('hypoxia', 'spo2 drop', 'breathless');
  if (vitals?.systolicBp && vitals.systolicBp < 90) combinedTokens.push('shock', 'hypotension', 'dizziness');
  if (vitals?.temperature && vitals.temperature > 38.3) combinedTokens.push('fever', 'high fever');

  // Fallback defaults if zero symptoms specified
  if (combinedTokens.length === 0) {
    if (category === 'RED') {
      combinedTokens.push('chest pain', 'crushing chest', 'sweating', 'breathless');
    } else if (category === 'YELLOW') {
      combinedTokens.push('fever', 'chills', 'body ache', 'vomiting');
    } else {
      combinedTokens.push('cold', 'cough', 'runny nose', 'throat');
    }
  }

  // Score all diseases in registry
  const scored = CLINICAL_DISEASE_REGISTRY.map((disease) => {
    let matchPoints = 0;
    const matchedKeywords: string[] = [];

    disease.triggerKeywords.forEach((kw) => {
      const kwLower = kw.toLowerCase();
      // Check full phrase or word matches
      const hasMatch = combinedTokens.some(
        (token) => token.includes(kwLower) || kwLower.includes(token)
      );

      if (hasMatch) {
        matchPoints += 22;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
    });

    // Baseline boost based on category appropriateness
    let categoryWeight = 10;
    if (category === 'RED' && disease.urgency === 'Critical') categoryWeight = 40;
    if (category === 'YELLOW' && disease.urgency === 'Urgent') categoryWeight = 35;
    if (category === 'GREEN' && (disease.urgency === 'Moderate' || disease.urgency === 'Routine')) {
      categoryWeight = 35;
    }

    // High fidelity matching score
    const finalScore = Math.min(96, Math.max(18, categoryWeight + matchPoints));

    return {
      template: disease,
      score: finalScore,
      matchedKeywords,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Top result = The MAJOR PROBLEM
  const topCandidate = scored[0];
  const majorProblem: MajorProblemDiagnosis = {
    id: topCandidate.template.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: topCandidate.template.name,
    icd10Code: topCandidate.template.icd10,
    department: topCandidate.template.department,
    organSystem: topCandidate.template.organSystem,
    severity: topCandidate.template.defaultSeverity,
    matchScore: topCandidate.score,
    whyMajorProblem: topCandidate.template.whyMajor,
    keySymptomsMatched:
      topCandidate.matchedKeywords.length > 0
        ? topCandidate.matchedKeywords
        : symptomsList.slice(0, 3),
    recommendedFirstAid: topCandidate.template.firstAid,
    recommendedDiagnostics: topCandidate.template.diagnostics,
  };

  // Remaining results = Secondary & Differential Conditions (pick top 2-3)
  const differentialConditions: DifferentialCondition[] = scored.slice(1, 4).map((item) => ({
    id: item.template.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: item.template.name,
    icd10Code: item.template.icd10,
    department: item.template.department,
    matchScore: Math.max(25, item.score - 8),
    urgency: item.template.urgency,
    matchingSymptoms:
      item.matchedKeywords.length > 0
        ? item.matchedKeywords
        : [item.template.triggerKeywords[0]],
    clinicalRationale: item.template.rationale,
    keyDiagnosticTests: item.template.diagnostics,
  }));

  // Target consultation window based on triage color
  let targetWindow = '5–10 minutes';
  let disclaimerNotice = '';

  if (category === 'RED') {
    targetWindow = '5–10 minutes (Immediate Resuscitation)';
    disclaimerNotice =
      'This is only a directional diagnosis. Consult your doctor / transfer to emergency resuscitation physician within 5–10 minutes.';
  } else if (category === 'YELLOW') {
    targetWindow = '30–60 minutes (Urgent Assessment)';
    disclaimerNotice =
      'This is only a directional diagnosis. Consult your doctor within 30–60 minutes.';
  } else if (category === 'GREEN') {
    targetWindow = '2–4 hours (Routine Outpatient Window)';
    disclaimerNotice =
      'This is only a directional diagnosis. Consult your doctor within 2–4 hours.';
  } else {
    targetWindow = 'Deceased / Protocol Window';
    disclaimerNotice =
      'This is only a directional evaluation. Immediate attending physician verification protocol.';
  }

  return {
    disclaimerNotice,
    targetConsultWindow: targetWindow,
    majorProblem,
    differentialConditions,
    evaluatedSymptoms: symptomsList.length > 0 ? symptomsList : ['Intake Presentation'],
  };
}
