import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate?: number;
  totalBeforeTax: number;
  totalTax: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  client: mongoose.Types.ObjectId;
  event?: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially-paid';
  paymentTerms?: string;
  paymentMethod?: string;
  paymentDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discountRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBeforeTax: {
      type: Number,
      required: true,
      min: 0,
    },
    totalTax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: {
      type: [InvoiceItemSchema],
      required: true,
      validate: [
        {
          validator: (items: IInvoiceItem[]) => items.length > 0,
          message: 'Al menos un ítem es requerido',
        },
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxTotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discountTotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially-paid'],
      default: 'draft',
    },
    paymentTerms: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para generar automáticamente el número de factura
InvoiceSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Formato: INV-YYYYMMDD-XXXX (donde XXXX es un número secuencial)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Encontrar la última factura con el prefijo de hoy
    const prefix = `INV-${dateStr}-`;
    const lastInvoice = await this.constructor.findOne(
      { invoiceNumber: new RegExp(`^${prefix}`) },
      { invoiceNumber: 1 },
      { sort: { invoiceNumber: -1 } }
    );
    
    let sequenceNumber = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
      sequenceNumber = lastSequence + 1;
    }
    
    // Crear el nuevo número de factura
    this.invoiceNumber = `${prefix}${sequenceNumber.toString().padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Índices para mejorar el rendimiento de las consultas
InvoiceSchema.index({ client: 1 });
InvoiceSchema.index({ event: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ issueDate: -1 });
InvoiceSchema.index({ dueDate: 1 });

// Validación personalizada para asegurar que la fecha de vencimiento sea mayor que la fecha de emisión
InvoiceSchema.path('dueDate').validate(function (value) {
  return value > this.issueDate;
}, 'La fecha de vencimiento debe ser posterior a la fecha de emisión');

const Invoice = model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
