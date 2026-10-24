import type { Request, Response } from 'express';
import { db } from '../db/index.js';

export const getAuditLogs = (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ auditLogs: logs, count: logs.length });
};
