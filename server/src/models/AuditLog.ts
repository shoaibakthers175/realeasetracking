import mongoose, { Document, Schema, Types } from 'mongoose';

export type AuditEvent =
  | 'CREATE_RELEASE'
  | 'UPDATE_RELEASE'
  | 'MARK_RELEASE_LIVE'
  | 'ROLLBACK_RELEASE'
  | 'DELETE_RELEASE'
  | 'CREATE_BUG'
  | 'UPDATE_BUG'
  | 'DELETE_BUG'
  | 'CREATE_LEAD'
  | 'UPDATE_LEAD'
  | 'UPLOAD_REPORT'
  | 'CREATE_FEATURE'
  | 'UPDATE_FEATURE'
  | 'DELETE_FEATURE'
  | 'CREATE_UNIVERSITY'
  | 'UPDATE_UNIVERSITY'
  | 'DELETE_UNIVERSITY'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'LOGIN'
  | 'LOGOUT';

export interface IAuditLog extends Document {
  event: AuditEvent;
  performedBy?: Types.ObjectId;
  userName: string;
  userRole: string;
  entityType: 'Release' | 'University' | 'Feature' | 'BugTicket' | 'SanityReport' | 'Lead' | 'User' | 'System';
  entityId?: Types.ObjectId | string;
  entityTitle?: string;
  details?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
      default: 'System',
    },
    userRole: {
      type: String,
      default: 'QA_ENGINEER',
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: Schema.Types.Mixed,
    },
    entityTitle: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
