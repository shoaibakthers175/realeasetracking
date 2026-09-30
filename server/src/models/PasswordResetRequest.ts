import mongoose, { Document, Schema, Types } from 'mongoose';

export type ResetRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface IPasswordResetRequest extends Document {
  user: Types.ObjectId;
  email: string;
  userName: string;
  userRole: string;
  reason?: string;
  status: ResetRequestStatus;
  resetToken?: string;
  hashedToken?: string;
  tokenExpire?: Date;
  requestedAt: Date;
  approvedBy?: Types.ObjectId;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetRequestSchema = new Schema<IPasswordResetRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      default: 'QA_ENGINEER',
    },
    reason: {
      type: String,
      default: 'User forgot login password',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
    },
    resetToken: {
      type: String,
    },
    hashedToken: {
      type: String,
    },
    tokenExpire: {
      type: Date,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedByName: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordResetRequest = mongoose.model<IPasswordResetRequest>(
  'PasswordResetRequest',
  PasswordResetRequestSchema
);
