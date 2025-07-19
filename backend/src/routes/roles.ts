import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { check, validationResult } from 'express-validator';
import { permissionGuard, createPermissionName, RESOURCES, ACTIONS } from '../middleware/permissions';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJWT);

// Obtener todos los roles (requiere permiso de administración de usuarios)
router.get('/', permissionGuard(createPermissionName('USERS', 'ADMIN')), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
});

// Obtener un rol específico por ID
router.get('/:id', permissionGuard(createPermissionName('USERS', 'ADMIN')), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID de rol inválido'
      });
      return;
    }

    const role = await Role.findById(id);
    
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
});

// Crear un nuevo rol
router.post('/', [
  permissionGuard(createPermissionName('USERS', 'ADMIN')),
  check('name').notEmpty().withMessage('El nombre es requerido').trim(),
  check('description').optional().trim(),
  check('permissions').isArray().withMessage('Los permisos deben ser un array'),
  check('isSystemRole').optional().isBoolean().withMessage('isSystemRole debe ser un booleano')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { name, description, permissions, isSystemRole } = req.body;
    
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      res.status(400).json({
        success: false,
        message: `Ya existe un rol con el nombre '${name}'`
      });
      return;
    }

    if (permissions && permissions.length > 0) {
      const existingPermissions = await Permission.find({ name: { $in: permissions } });
      const existingPermissionNames = existingPermissions.map((p: any) => p.name);
      const invalidPermissions = permissions.filter((p: string) => !existingPermissionNames.includes(p));
      
      if (invalidPermissions.length > 0) {
        res.status(400).json({
          success: false,
          message: `Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`
        });
        return;
      }
    }

    const newRole = new Role({
      name,
      description,
      permissions: permissions || [],
      isSystemRole: isSystemRole || false
    });

    await newRole.save();

    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: newRole
    });
  } catch (error) {
    next(error);
  }
});

// Actualizar un rol
router.put('/:id', [
  permissionGuard(createPermissionName('USERS', 'ADMIN')),
  check('name').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
  check('description').optional().trim(),
  check('permissions').optional().isArray().withMessage('Los permisos deben ser un array'),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID de rol inválido'
      });
      return;
    }

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
      return;
    }

    if (existingRole.isSystemRole) {
      res.status(403).json({
        success: false,
        message: 'No se pueden modificar roles del sistema'
      });
      return;
    }

    if (name && name !== existingRole.name) {
      const roleWithSameName = await Role.findOne({ name, _id: { $ne: id } });
      if (roleWithSameName) {
        res.status(400).json({
          success: false,
          message: `Ya existe un rol con el nombre '${name}'`
        });
        return;
      }
    }

    if (permissions && permissions.length > 0) {
      const existingPermissions = await Permission.find({ name: { $in: permissions } });
      const existingPermissionNames = existingPermissions.map((p: any) => p.name);
      const invalidPermissions = permissions.filter((p: string) => !existingPermissionNames.includes(p));
      
      if (invalidPermissions.length > 0) {
        res.status(400).json({
          success: false,
          message: `Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`
        });
        return;
      }
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions) updateData.permissions = permissions;

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: updatedRole
    });
  } catch (error) {
    next(error);
  }
});

// Eliminar un rol
router.delete('/:id', permissionGuard(createPermissionName('USERS', 'ADMIN')), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID de rol inválido'
      });
      return;
    }

    // Verificar si el rol existe
    const role = await Role.findById(id);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
      return;
    }

    // Verificar si es un rol del sistema
    if (role.isSystemRole) {
      res.status(403).json({
        success: false,
        message: 'No se pueden eliminar roles del sistema'
      });
      return;
    }

    // Eliminar el rol
    await Role.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
