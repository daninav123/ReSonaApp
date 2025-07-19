import mongoose from 'mongoose';

// Esquema para elementos de checklist
const checklistItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  checked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Esquema para archivos adjuntos
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Esquema para integración con calendarios externos
const externalCalendarSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['google', 'microsoft', 'apple'],
    required: true
  },
  externalId: {
    type: String,
    required: true
  },
  externalUrl: {
    type: String
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
});

// Esquema principal de evento
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  checklist: [checklistItemSchema],
  files: [fileSchema],
  externalCalendars: [externalCalendarSchema],
  isAllDay: {
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
}, { timestamps: true });

// Índices para mejorar el rendimiento de las consultas
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ client: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ 'assignedTo': 1 });
eventSchema.index({ status: 1 });

// Interfaz para el documento Event
export interface IEvent extends mongoose.Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  client?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  status: 'draft' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  checklist: Array<{
    text: string;
    checked: boolean;
    createdAt: Date;
  }>;
  files: Array<{
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url?: string;
    uploadedAt: Date;
  }>;
  externalCalendars: Array<{
    provider: 'google' | 'microsoft' | 'apple';
    externalId: string;
    externalUrl?: string;
    lastSynced: Date;
  }>;
  isAllDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Middleware pre-save para actualizar el campo updatedAt
eventSchema.pre('save', function(this: IEvent, next) {
  this.updatedAt = new Date();
  next();
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
