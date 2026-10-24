import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { config } from '../config.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { HospitalAccount, SubscriptionPlanTier } from '../types/index.js';

export const login = (req: Request, res: Response) => {
  const { hospitalId, staffId, password } = req.body;

  if (!hospitalId || !password) {
    res.status(400).json({ error: 'Hospital ID and password are required.' });
    return;
  }

  const normalizedId = hospitalId.trim().toUpperCase();
  let hospital = db.getHospital(normalizedId);

  // If not found in seed demo list, support dynamic HOSP-XXXX registration
  if (!hospital) {
    if (normalizedId.startsWith('HOSP-') && password === 'hospital123') {
      const dynamicSession: HospitalAccount = {
        hospitalId: normalizedId,
        hospitalName: `${normalizedId.replace('HOSP-', '')} Hospital Network`,
        city: 'Authorized Facility',
        department: 'Emergency & Triage Wing',
        staffId: staffId?.trim() || 'STAFF-AUTH-01',
        staffName: staffId?.includes('@') ? staffId.split('@')[0] : staffId || 'Staff Officer',
        staffRole: 'Clinical Triage Specialist',
        activePlan: 'MONTHLY',
        planValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        passwordHash: 'hospital123'
      };
      hospital = db.registerGenericHospital(dynamicSession);
    } else {
      res.status(401).json({ error: 'Invalid Hospital ID. Please check your credentials.' });
      return;
    }
  }

  if (hospital.passwordHash && hospital.passwordHash !== password.trim()) {
    res.status(401).json({ error: 'Incorrect hospital credentials or security token.' });
    return;
  }

  const sessionData: HospitalAccount = {
    ...hospital,
    staffId: staffId?.trim() || hospital.staffId
  };
  delete sessionData.passwordHash;

  const token = jwt.sign(sessionData, config.jwtSecret, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    session: sessionData
  });
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.hospital) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const current = db.getHospital(req.hospital.hospitalId) || req.hospital;
  const safeSession = { ...current };
  delete safeSession.passwordHash;
  res.json({ session: safeSession });
};

export const upgradePlan = (req: AuthenticatedRequest, res: Response) => {
  const { planTier } = req.body as { planTier: SubscriptionPlanTier };

  if (!planTier || !['MONTHLY', 'HALF_YEARLY', 'YEARLY'].includes(planTier)) {
    res.status(400).json({ error: 'Invalid subscription plan tier.' });
    return;
  }

  const hospitalId = req.hospital?.hospitalId || 'HOSP-METRO-01';
  const updated = db.updateHospitalPlan(hospitalId, planTier);

  if (!updated) {
    res.status(404).json({ error: 'Hospital record not found.' });
    return;
  }

  const safeSession = { ...updated };
  delete safeSession.passwordHash;
  res.json({ success: true, session: safeSession });
};
