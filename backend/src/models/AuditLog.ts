import { Schema, model, Document, Types } from 'mongoose';


export interface AuditLogType {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  metadata: {
    duration: number;
    success: boolean;
    error?: string;
  };
  createdAt: Date;
}

export type IAuditLog = AuditLogType & Document;

const AuditLogSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ERROR'],
    set: (v: string) => v?.toUpperCase()
  },
  entity: {
    type: String,
    required: [true, 'Entity is required'],
    enum: ['USER', 'CLIENT', 'MATERIAL', 'BUDGET', 'TASK', 'SYSTEM'],
    set: (v: string) => v?.toUpperCase()
  },
  entityId: {
    type: String,
    required: false
  },
  changes: {
    before: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function(value: Record<string, any>) {
          // Ensure both before and after exist if one exists
          return !value || (this as any).changes?.after !== undefined;
        },
        message: 'Both before and after changes must be provided'
      }
    },
    after: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function(value: Record<string, any>) {
          return !value || (this as any).changes?.before !== undefined;
        },
        message: 'Both before and after changes must be provided'
      }
    }
  },
  ipAddress: {
    type: String,
    required: false,
    validate: {
      validator: function(value: string) {
        // Relax IP validation to accept IPv4 or IPv6, including IPv6-mapped IPv4 (::ffff:)
        return /^((\d{1,3}\.){3}\d{1,3}|([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::ffff:(\d{1,3}\.){3}\d{1,3})$/.test(value);
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: {
    type: String,
    required: false
  },
  metadata: {
    type: new Schema({
      duration: { type: Number, default: 0 },
      success: { type: Boolean, default: true },
      error: { type: String }
    }, { _id: false }),
    default: () => ({ duration: 0, success: true })
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to get formatted changes
AuditLogSchema.methods.getChanges = function() {
  if (!this.changes?.before || !this.changes?.after) return 'No changes recorded';
  
  const changes = Object.entries(this.changes.after)
    .filter(([key]) => this.changes.before[key] !== this.changes.after[key])
    .map(([key, value]) => ({
      field: key,
      before: this.changes.before[key],
      after: value
    }));

  return changes.length > 0 
    ? changes.map(change => `${change.field}: ${change.before} → ${change.after}`).join(', ') 
    : 'No changes recorded';
};

// Method to get formatted duration
AuditLogSchema.methods.getDuration = function() {
  const seconds = Math.round(this.metadata.duration / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Static method to create audit log
AuditLogSchema.statics.createLog = async function(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  ipAddress: string,
  userAgent: string,
  changes?: AuditLogType['changes'],
  metadata: Partial<AuditLogType['metadata']> = {}
) {
  const start = Date.now();
  
  try {
    const log = new this({
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress,
      userAgent,
      metadata: {
        duration: Date.now() - start,
        success: true,
        ...metadata
      }
    });
    
    await log.save();
    return log;
  } catch (error) {
    throw new Error(`Failed to create audit log: ${(error as Error).message}`);
  }
};

// Indexes
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
