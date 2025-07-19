import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';

export interface IQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate?: number;
  totalBeforeTax: number;
  totalTax: number;
  total: number;
}

export interface IQuote extends Document {
  quoteNumber: string;
  client: mongoose.Types.ObjectId;
  event?: mongoose.Types.ObjectId;
  issueDate: Date;
  validUntil: Date;
  items: IQuoteItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  termsAndConditions?: string;
  convertedToInvoice?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteItemSchema = new Schema<IQuoteItem>(
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

const QuoteSchema = new Schema<IQuote>(
  {
    quoteNumber: {
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
    validUntil: {
      type: Date,
      required: true,
    },
    items: {
      type: [QuoteItemSchema],
      required: true,
      validate: [
        {
          validator: (items: IQuoteItem[]) => items.length > 0,
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
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'draft',
    },
    termsAndConditions: {
      type: String,
    },
    convertedToInvoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
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

// Middleware para generar automáticamente el número de presupuesto
QuoteSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Formato: QUOTE-YYYYMMDD-XXXX (donde XXXX es un número secuencial)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Encontrar el último presupuesto con el prefijo de hoy
    const prefix = `QUOTE-${dateStr}-`;
    const lastQuote = await this.constructor.findOne(
      { quoteNumber: new RegExp(`^${prefix}`) },
      { quoteNumber: 1 },
      { sort: { quoteNumber: -1 } }
    );
    
    let sequenceNumber = 1;
    if (lastQuote) {
      const lastSequence = parseInt(lastQuote.quoteNumber.split('-')[2], 10);
      sequenceNumber = lastSequence + 1;
    }
    
    // Crear el nuevo número de presupuesto
    this.quoteNumber = `${prefix}${sequenceNumber.toString().padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Índices para mejorar el rendimiento de las consultas
QuoteSchema.index({ client: 1 });
QuoteSchema.index({ event: 1 });
QuoteSchema.index({ status: 1 });
QuoteSchema.index({ issueDate: -1 });
QuoteSchema.index({ validUntil: 1 });
QuoteSchema.index({ convertedToInvoice: 1 });

// Validación personalizada para asegurar que la fecha de validez sea mayor que la fecha de emisión
QuoteSchema.path('validUntil').validate(function (value) {
  return value > this.issueDate;
}, 'La fecha de validez debe ser posterior a la fecha de emisión');

const Quote = model<IQuote>('Quote', QuoteSchema);

export default Quote;
