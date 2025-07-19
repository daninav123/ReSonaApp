import mongoose, { Schema, Document } from 'mongoose';

export interface IProvider extends Document {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  taxId: string;
  category: string[];
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  paymentTerms: string;
  notes: string;
  products: Array<{
    name: string;
    code: string;
    price: number;
    description?: string;
    category?: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadDate: Date;
  }>;
  history: Array<{
    date: Date;
    action: string;
    description: string;
    user: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nombre del proveedor es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    index: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Persona de contacto es obligatoria'],
    trim: true,
    maxlength: [100, 'El nombre de contacto no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email es obligatorio'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Teléfono es obligatorio'],
    trim: true,
    match: [/^[0-9+\s()-]+$/, 'Por favor ingrese un número de teléfono válido']
  },
  address: {
    type: String,
    required: [true, 'Dirección es obligatoria'],
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/, 'Por favor ingrese una URL válida']
  },
  taxId: {
    type: String,
    required: [true, 'CIF/NIF es obligatorio'],
    trim: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9]{9}$/, 'CIF/NIF debe tener el formato correcto']
  },
  category: [{
    type: String,
    required: [true, 'Categoría es obligatoria'],
    trim: true
  }],
  rating: {
    type: Number,
    min: [0, 'La valoración no puede ser menor a 0'],
    max: [5, 'La valoración no puede ser mayor a 5'],
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  paymentTerms: {
    type: String,
    trim: true,
    maxlength: [100, 'Los términos de pago no pueden exceder 100 caracteres']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  products: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo']
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }]
}, { timestamps: true });

// Índices para optimizar búsquedas comunes
providerSchema.index({ name: 'text', email: 1, status: 1, category: 1 });

// Método estático para búsqueda por categoría
providerSchema.statics.findByCategory = function(category: string) {
  return this.find({ category: { $regex: new RegExp(category, 'i') } });
};

// Método estático para búsqueda por estado
providerSchema.statics.findByStatus = function(status: 'active' | 'inactive' | 'pending') {
  return this.find({ status });
};

// Método de instancia para añadir un producto
providerSchema.methods.addProduct = function(product: {
  name: string;
  code: string;
  price: number;
  description?: string;
  category?: string;
}) {
  this.products.push(product);
  return this.save();
};

// Método de instancia para registrar una actividad en el historial
providerSchema.methods.addHistoryEntry = function(
  action: string,
  description: string,
  userId: mongoose.Types.ObjectId
) {
  this.history.push({
    date: new Date(),
    action,
    description,
    user: userId
  });
  return this.save();
};

export const Provider = mongoose.model<IProvider>('Provider', providerSchema);
