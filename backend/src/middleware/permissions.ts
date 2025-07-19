import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { RESOURCES, ACTIONS, Permission as PermissionModel } from '../models/Permission';

// Función para verificar si el usuario tiene un permiso específico
export const hasPermission = async (userId: string, permissionName: string): Promise<boolean> => {
  try {
    // Obtener el usuario con sus roles
    const user = await User.findById(userId).lean();
    if (!user) return false;

    // Si el usuario tiene el rol de CEO, conceder todos los permisos
    if (user.roles && user.roles.includes('CEO')) return true;

    // Obtener todos los roles del usuario
    const userRoles = await Role.find({ name: { $in: user.roles || [] } }).lean();
    
    // Verificar si alguno de los roles tiene el permiso requerido
    return userRoles.some(role => role.permissions && role.permissions.includes(permissionName));
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Middleware para verificar permisos
export const permissionGuard = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as Partial<JwtPayload> & { id?: string };
      
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            details: ['User not authenticated']
          }
        });
      }

      const hasAccess = await hasPermission(user.id, requiredPermission);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            details: [`Permission ${requiredPermission} required`]
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware para requerir múltiples permisos (debe tener todos)
export const requireAllPermissions = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as Partial<JwtPayload> & { id?: string };
      
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            details: ['User not authenticated']
          }
        });
      }

      // Si el usuario es CEO, tiene todos los permisos
      const userData = await User.findById(user.id).lean();
      if (userData && userData.roles && userData.roles.includes('CEO')) {
        return next();
      }

      // Verificar cada permiso
      const permissionPromises = permissions.map(perm => hasPermission(user.id, perm));
      const results = await Promise.all(permissionPromises);
      
      // El usuario debe tener todos los permisos
      if (results.every(Boolean)) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          details: ['Multiple permissions required']
        }
      });
    } catch (error) {
      next(error);
    }
  };
};

// Middleware para requerir algún permiso (al menos uno)
export const requireAnyPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as Partial<JwtPayload> & { id?: string };
      
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            details: ['User not authenticated']
          }
        });
      }

      // Si el usuario es CEO, tiene todos los permisos
      const userData = await User.findById(user.id).lean();
      if (userData && userData.roles && userData.roles.includes('CEO')) {
        return next();
      }

      // Verificar cada permiso
      const permissionPromises = permissions.map(perm => hasPermission(user.id, perm));
      const results = await Promise.all(permissionPromises);
      
      // El usuario debe tener al menos un permiso
      if (results.some(Boolean)) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          details: ['At least one permission required']
        }
      });
    } catch (error) {
      next(error);
    }
  };
};

// Helper para crear nombres de permisos
export const createPermissionName = (resource: keyof typeof RESOURCES, action: keyof typeof ACTIONS): string => {
  return `${RESOURCES[resource]}:${ACTIONS[action]}`;
};

// Exportar constantes para facilitar el uso
export { RESOURCES, ACTIONS };
