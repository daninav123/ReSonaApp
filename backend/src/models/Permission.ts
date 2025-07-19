import mongoose, { Schema, Document } from 'mongoose';

// Define los diferentes recursos/entidades del sistema
export const RESOURCES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  MATERIALS: 'materials',
  BUDGETS: 'budgets',
  TASKS: 'tasks',
  CLIENTS: 'clients',
  EVENTS: 'events',
  PROVIDERS: 'providers',
  SETTINGS: 'settings',
  REPORTS: 'reports',
} as const;

export type ResourceType = keyof typeof RESOURCES;

// Define las acciones posibles sobre los recursos
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  ADMIN: 'admin',   // Acceso administrativo completo a la funcionalidad
  APPROVE: 'approve', // Aprobar/rechazar elementos que requieren aprobación
  ASSIGN: 'assign',   // Asignar tareas/responsabilidades a otros
} as const;

export type ActionType = keyof typeof ACTIONS;

// Combinación de recurso y acción (ej: "users:create", "tasks:assign")
export type Permission = `${ResourceType}:${ActionType}`;

// Interfaz para el documento de Permission
export interface IPermission extends Document {
  name: Permission;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    validate: {
      validator: function(value: string) {
        // Valida que el formato sea "recurso:acción"
        const parts = value.split(':');
        if (parts.length !== 2) return false;
        
        const [resource, action] = parts;
        return (
          Object.values(RESOURCES).includes(resource as any) && 
          Object.values(ACTIONS).includes(action as any)
        );
      },
      message: 'Permission must be in format "resource:action"'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
