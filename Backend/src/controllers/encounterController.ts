import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { evaluateTriage, generateUHID, generateEncounterNumber } from '../services/triageEngine.js';
import type { EncounterRecord, EncounterStatus, TriageCategory } from '../types/index.js';

export const getEncounters = (req: Request, res: Response) => {
  const { category, query } = req.query as { category?: string; query?: string };
  const list = db.getEncounters(category, query);
  res.json({ encounters: list, count: list.length });
};

export const getEncounterById = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const encounter = db.getEncounterById(id);

  if (!encounter) {
    res.status(404).json({ error: 'Patient encounter not found.' });
    return;
  }

  res.json({ encounter });
};

export const createEncounter = (req: Request, res: Response) => {
  const { patient, vitals, symptoms, history } = req.body;

  if (!patient || !patient.fullName) {
    res.status(400).json({ error: 'Patient full name and personal details are required.' });
    return;
  }

  // 1. Run server-side triage evaluation
  const evaluated = evaluateTriage(vitals || {}, symptoms || {});

  // 2. Generate UHID and Encounter ID
  const uhid = generateUHID();
  const encounterNumber = generateEncounterNumber();
  const id = `enc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newRecord: EncounterRecord = {
    id,
    uhid,
    encounterNumber,
    patientName: patient.fullName.trim(),
    age: Number(patient.age) || 25,
    gender: patient.gender || 'Not specified',
    contactNumber: patient.contactNumber || '',
    location: patient.location || 'Local Community Care',
    category: evaluated.category,
    triageLabel: evaluated.triageLabel,
    plainLanguageSummary: evaluated.plainLanguageSummary,
    recommendedAction: evaluated.recommendedAction,
    waitTimeMinutes: 0,
    status: 'Waiting',
    createdAt: new Date().toISOString(),
    vitals: vitals || {
      isBpMeasured: false,
      systolicBp: null,
      diastolicBp: null,
      isHeartRateMeasured: false,
      heartRate: null,
      isTempMeasured: false,
      temperature: null,
      isSpo2Measured: false,
      oxygenSaturation: null,
      isRespRateMeasured: false,
      respiratoryRate: null,
      isSugarMeasured: false,
      bloodSugar: null
    },
    symptoms: symptoms || {
      selectedSymptoms: [],
      otherSymptomsText: '',
      duration: '<24_hours',
      severity: 'Moderate',
      additionalDetails: ''
    },
    history: history || {
      conditions: [],
      medications: [],
      noMedications: true,
      allergies: [],
      noAllergies: true,
      uploadedDocuments: []
    }
  };

  const saved = db.addEncounter(newRecord);
  res.status(201).json({ success: true, encounter: saved });
};

export const overrideTriage = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { category, reason, overriddenBy } = req.body as {
    category: TriageCategory;
    reason: string;
    overriddenBy?: string;
  };

  if (!category || !['RED', 'YELLOW', 'GREEN', 'BLACK'].includes(category)) {
    res.status(400).json({ error: 'Invalid triage priority category.' });
    return;
  }

  if (!reason || !reason.trim()) {
    res.status(400).json({ error: 'Clinical justification reason is mandatory to override triage priority.' });
    return;
  }

  const triageLabels: Record<TriageCategory, EncounterRecord['triageLabel']> = {
    RED: 'Emergency',
    YELLOW: 'Urgent',
    GREEN: 'Lower urgency',
    BLACK: 'Deceased'
  };

  const updated = db.updateEncounter(id, {
    category,
    triageLabel: triageLabels[category],
    clinicianOverridden: true,
    overrideReason: reason.trim(),
    overriddenBy: overriddenBy || 'Attending Physician (Reg #MC-ER-449)',
    overriddenAt: new Date().toISOString()
  });

  if (!updated) {
    res.status(404).json({ error: 'Encounter not found.' });
    return;
  }

  res.json({ success: true, encounter: updated });
};

export const updateStatus = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body as { status: EncounterStatus };

  if (!status || !['Waiting', 'In Consult', 'Being Seen', 'Completed', 'Transferred'].includes(status)) {
    res.status(400).json({ error: 'Invalid encounter status.' });
    return;
  }

  const updated = db.updateEncounter(id, { status });

  if (!updated) {
    res.status(404).json({ error: 'Encounter not found.' });
    return;
  }

  res.json({ success: true, encounter: updated });
};

export const getStats = (req: Request, res: Response) => {
  const encounters = db.getEncounters();

  const total = encounters.length;
  const red = encounters.filter((e) => e.category === 'RED').length;
  const yellow = encounters.filter((e) => e.category === 'YELLOW').length;
  const green = encounters.filter((e) => e.category === 'GREEN').length;
  const black = encounters.filter((e) => e.category === 'BLACK').length;

  res.json({
    total,
    red,
    yellow,
    green,
    black,
    hasEmergency: red > 0
  });
};
