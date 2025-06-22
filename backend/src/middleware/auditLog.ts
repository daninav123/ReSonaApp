import AuditLog from '../models/AuditLog';
import { Request, Response, NextFunction } from 'express';

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
  ip
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ip?: string;
}) {
  try {
    await AuditLog.create({ userId, action, entity, entityId, details, ip });
  } catch (err) {
    // No lanzar error, solo loguear
    console.error('AuditLog error:', err);
  }
}

// Middleware para registrar acciones CRUD automáticamente (opcional, para rutas)
export function auditLogMiddleware(action: string, entity: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      // Solo registrar si la respuesta fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const userId = req.user?.userId || undefined;
        const entityId = req.params.id || undefined;
        await logAudit({
          userId,
          action,
          entity,
          entityId,
          details: { body: req.body },
          ip: req.ip
        });
      }
    });
    next();
  };
}
