import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import AuditLog from '../models/AuditLog';

const router = Router();

// Solo CEO puede ver logs
const authorizeAdmin = (req: Request, res: Response, next: Function) => {
  if (req.user?.roles.includes('CEO')) return next();
  return res.status(403).json({ message: 'Forbidden' });
};

// GET /api/auditlogs?userId=&action=&entity=&limit=50
router.get('/', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, action, entity, limit = 50 } = req.query;
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ data: logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
