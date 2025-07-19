import { AuditLog } from '../types';
import { AuditLog as AuditLogModel } from '../models';

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public async logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    changes: {
      before: Record<string, any>;
      after: Record<string, any>;
    },
    req: Request
  ): Promise<void> {
    try {
      const auditLog: AuditLog = {
        userId,
        action,
        entity,
        entityId,
        changes,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        timestamp: new Date()
      };

      await AuditLogModel.create(auditLog);
    } catch (error) {
      console.error('Error logging audit:', error);
      // Don't throw error as we don't want to fail the main operation
    }
  }

  public async getAuditLogs(
    userId?: string,
    entity?: string,
    entityId?: string,
    action?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<AuditLog[]> {
    const query: any = {};

    if (userId) query.userId = userId;
    if (entity) query.entity = entity;
    if (entityId) query.entityId = entityId;
    if (action) query.action = action;

    if (startDate) {
      query.timestamp = { $gte: startDate };
    }

    if (endDate) {
      if (!query.timestamp) {
        query.timestamp = {};
      }
      query.timestamp.$lte = endDate;
    }

    return AuditLogModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  public async getUserActivity(userId: string, days: number = 30): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getAuditLogs(userId, undefined, undefined, undefined, startDate);
  }
}
