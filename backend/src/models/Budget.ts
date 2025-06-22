import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IBudgetItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface IBudgetHistory {
  status: string;
  date: Date;
  byUser: Types.ObjectId;
}

export interface IBudget extends Document {
  client: Types.ObjectId;
  title: string;
  amount: number;
  status: 'pending' | 'active' | 'warning';
  date: Date;
  createdBy: Types.ObjectId;
  items: IBudgetItem[];
  history: IBudgetHistory[];
  notes?: string;
  acceptedAt?: Date;
  openedAt?: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'active', 'warning'], default: 'pending' },
  date: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    description: String,
    qty: Number,
    unitPrice: Number
  }],
  history: [{
    status: String,
    date: Date,
    byUser: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  notes: String,
  acceptedAt: Date,
  openedAt: Date,
}, { timestamps: true });

export default (mongoose.models.Budget as mongoose.Model<IBudget>) || model<IBudget>('Budget', BudgetSchema);
