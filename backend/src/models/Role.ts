import mongoose, { Schema, Document } from 'mongoose';
import { Permission } from './Permission';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[]; // Almacena los IDs de los permisos o nombres de permisos
  isSystemRole: boolean; // Indica si es un rol del sistema que no se puede modificar
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Role name must be at least 2 characters long'],
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: [{
    type: String,
    validate: {
      validator: async function(value: string) {
        // Verificar que el permiso existe en la base de datos o es un formato válido
        try {
          const permissionExists = await Permission.exists({ name: value });
          return !!permissionExists;
        } catch (error) {
          return false;
        }
      },
      message: 'Permission does not exist'
    }
  }],
  isSystemRole: {
    type: Boolean,
    default: false
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

// Índices para búsqueda eficiente
roleSchema.index({ name: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);
