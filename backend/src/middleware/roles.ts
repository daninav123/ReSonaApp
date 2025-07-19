import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';

export const ROLES = {
  CEO: 'CEO',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;

export type Role = keyof typeof ROLES;

export const roleHierarchy: Record<Role, Role[]> = {
  CEO: [ROLES.CEO, ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  ADMIN: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  MANAGER: [ROLES.MANAGER, ROLES.USER],
  USER: [ROLES.USER]
};

export const hasRole = (userRoles: readonly string[], requiredRole: Role): boolean => {
  return userRoles.some(userRole => 
    roleHierarchy[userRole as Role]?.includes(requiredRole)
  );
};

export const roleGuard = (requiredRole: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as Partial<JwtPayload> & { roles?: string[] };
      if (!user || !user.roles) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            details: ['User not authenticated']
          }
        });
      }

      if (!hasRole(user.roles as string[], requiredRole)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            details: [`Role ${requiredRole} required`] 
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
