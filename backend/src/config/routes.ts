import { Request, Response, Router } from 'express';
import { roleGuard } from '../middleware/roles';
import { ROLES } from '../middleware/roles';
import { AuthService } from '../services/auth';
import { AuditService } from '../services/audit';
import authRouter from '../routes/auth';
import usersRouter from '../routes/users';
import clientsRouter from '../routes/clients';

export class RoutesConfig {
  private static instance: RoutesConfig;
  private readonly router = Router();

  private constructor() {
    this.setupRoutes();
  }

  public static getInstance(): RoutesConfig {
    if (!RoutesConfig.instance) {
      RoutesConfig.instance = new RoutesConfig();
    }
    return RoutesConfig.instance;
  }

  public getRouter(): Router {
    return this.router;
  }

  private setupRoutes(): void {
    // Public routes
    this.router.use('/api/auth', authRouter);

    // Protected routes with basic auth
    this.router.use('/api/clients', clientsRouter);

    // Protected routes with role-based access
    this.router.use(
      '/api/users',
      roleGuard(ROLES.ADMIN),
      usersRouter
    );

    // Audit logs route (only CEO can access)
    this.router.get(
      '/api/audit-logs',
      roleGuard(ROLES.CEO),
      async (req: Request, res: Response) => {
        try {
          const auditService = AuditService.getInstance();
          const logs = await auditService.getAuditLogs(
            req.query.userId as string,
            req.query.entity as string,
            req.query.entityId as string,
            req.query.action as string,
            req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            parseInt(req.query.limit as string) || 100
          );
          res.json({ success: true, data: logs });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Error fetching audit logs',
              details: [(error as Error).message]
            }
          });
        }
      }
    );

    // User activity route
    this.router.get(
      '/api/user-activity/:userId',
      roleGuard(ROLES.ADMIN),
      async (req: Request, res: Response) => {
        try {
          const auditService = AuditService.getInstance();
          const days = parseInt(req.query.days as string) || 30;
          const logs = await auditService.getUserActivity(req.params.userId, days);
          res.json({ success: true, data: logs });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Error fetching user activity',
              details: [(error as Error).message]
            }
          });
        }
      }
    );

    // Refresh token route
    this.router.post(
      '/api/auth/refresh',
      async (req: Request, res: Response) => {
        try {
          const authService = AuthService.getInstance();
          const newAccessToken = await authService.refreshAccessToken(req.body.refreshToken);
          res.json({ success: true, data: { accessToken: newAccessToken } });
        } catch (error) {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid refresh token',
              details: [(error as Error).message]
            }
          });
        }
      }
    );

    // Logout route
    this.router.post(
      '/api/auth/logout',
      async (req: Request, res: Response) => {
        try {
          const authService = AuthService.getInstance();
          await authService.logout(req.user?.id as string);
          res.json({ success: true });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Error during logout',
              details: [(error as Error).message]
            }
          });
        }
      }
    );
  }
}
