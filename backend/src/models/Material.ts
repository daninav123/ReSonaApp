import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  name: string;
  description: string;
  quantity: number;
  quantityReserved: number;
  unit: string;
  price: number;
  supplier: string;
  code: string;
  category: string;
  history: Array<{
    date: Date;
    action: 'IN' | 'OUT';
    quantity: number;
    user: mongoose.Types.ObjectId;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: function(this: IMaterial) {
        return this.quantity >= this.quantityReserved;
      },
      message: 'Quantity cannot be less than quantity reserved'
    }
  },
  quantityReserved: {
    type: Number,
    default: 0,
    min: [0, 'Quantity reserved cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'm', 'un', 'l', 'm2', 'm3'],
    default: 'un'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    trim: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'Code must contain only uppercase letters, numbers, and hyphens']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  history: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    action: {
      type: String,
      required: true,
      enum: ['IN', 'OUT']
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    note: {
      type: String,
      trim: true
    }
  }],
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

// Pre-save hook to update quantity when history changes
materialSchema.pre('save', function(next) {
  if (this.isModified('history')) {
    const totalReserved = this.history
      .filter(item => item.action === 'OUT')
      .reduce((sum, item) => sum + item.quantity, 0);
    this.quantityReserved = totalReserved;
  }
  next();
});

// Static method to update quantity
materialSchema.statics.updateQuantity = async function(
  id: string,
  quantity: number,
  action: 'IN' | 'OUT',
  userId: string,
  note?: string
) {
  const material = await this.findById(id);
  if (!material) {
    throw new Error('Material not found');
  }

  const newHistoryItem = {
    action,
    quantity,
    user: userId,
    note
  };

  material.history.push(newHistoryItem);
  await material.save();

  return material;
};

export const Material = mongoose.model<IMaterial>('Material', materialSchema);
