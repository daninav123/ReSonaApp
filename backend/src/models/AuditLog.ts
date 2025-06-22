import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ip?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String },
  details: { type: Schema.Types.Mixed },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default model<IAuditLog>('AuditLog', AuditLogSchema);
