import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { HospitalAccount } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  hospital?: HospitalAccount;
}

export function requireHospitalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as HospitalAccount;
    req.hospital = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Session token has expired or is invalid.' });
  }
}
