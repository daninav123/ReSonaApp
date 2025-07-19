import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { check, validationResult } from 'express-validator';
import { authenticateJWT } from '../middleware/auth';
import { Permission, RESOURCES, ACTIONS } from '../models/Permission';
import { permissionGuard, createPermissionName } from '../middleware/permissions';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJWT);

// Obtener todos los permisos (requiere permiso de administración de usuarios)
router.get('/', permissionGuard(createPermissionName('USERS', 'ADMIN')), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await Permission.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    next(error);
  }
});

// Obtener un permiso por ID (requiere permiso de administración de usuarios)
router.get('/:id', permissionGuard(createPermissionName('USERS', 'ADMIN')), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID de permiso inválido'
      });
      return;
    }

    const permission = await Permission.findById(id);
    
    if (!permission) {
      res.status(404).json({
        success: false,
        message: 'Permiso no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(error);
  }
});

// Crear un nuevo permiso
router.post('/', [
  permissionGuard(createPermissionName('USERS', 'ADMIN')),
  check('name').notEmpty().withMessage('El nombre es requerido').trim()
    .matches(/^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+$/).withMessage('El formato debe ser "recurso:accion"'),
  check('description').optional().trim()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    // Validar el formato del nombre
    const parts = name.split(':');
    if (parts.length !== 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PERMISSION',
          message: 'Invalid permission name format',
          details: ['Permission name must be in format "resource:action"']
        }
      });
    }
    
    const [resource, action] = parts;
    if (!Object.values(RESOURCES).includes(resource as any) || !Object.values(ACTIONS).includes(action as any)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PERMISSION',
          message: 'Invalid resource or action in permission',
          details: [
            `Resource must be one of: ${Object.values(RESOURCES).join(', ')}`,
            `Action must be one of: ${Object.values(ACTIONS).join(', ')}`
          ]
        }
      });
    }

    // Verificar que no existe ya
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PERMISSION_EXISTS',
          message: 'Permission with this name already exists',
          details: [`A permission with name '${name}' already exists`]
        }
      });
    }

    const newPermission = new Permission({
      name,
      description
    });

    await newPermission.save();

    res.status(201).json({
      success: true,
      data: newPermission
    });
  } catch (error) {
    next(error);
  }
});

// Actualizar un permiso
router.put('/:id', [
  permissionGuard(createPermissionName('USERS', 'ADMIN')),
  check('description').optional().trim()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    // Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID de permiso inválido'
      });
      return;
    }

    // Verificar si el permiso existe
    const existingPermission = await Permission.findById(id);
    if (!existingPermission) {
      res.status(404).json({
        success: false,
        message: 'Permiso no encontrado'
      });
      return;
    }

    // Actualizar el permiso (solo la descripción)
    const updateData: Record<string, any> = {};
    if (description !== undefined) updateData.description = description;

    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Permiso actualizado exitosamente',
      data: updatedPermission
    });
  } catch (error) {
    next(error);
  }
});

// Eliminar un permiso (requiere permiso de administración de usuarios)
router.delete('/:id', permissionGuard(createPermissionName('USERS', 'ADMIN')), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID de permiso inválido'
      });
      return;
    }

    // Verificar si el permiso existe
    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({
        success: false,
        message: 'Permiso no encontrado'
      });
      return;
    }

    // Verificar si el permiso está siendo utilizado por algún rol
    // Importar el modelo Role directamente
    const { Role } = await import('../models/Role');
    const roles = await Role.find({ permissions: permission.name });
    
    if (roles.length > 0) {
      res.status(400).json({
        success: false,
        message: `No se puede eliminar el permiso porque está siendo utilizado por ${roles.length} rol(es)`,
        data: {
          roles: roles.map((r: any) => r.name)
        }
      });
      return;
    }

    // Eliminar el permiso
    await Permission.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Permiso eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// Obtener todos los recursos y acciones disponibles
router.get('/metadata/available', permissionGuard(createPermissionName('USERS', 'ADMIN')), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        resources: Object.values(RESOURCES),
        actions: Object.values(ACTIONS)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
