import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAttachment extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  uploadedBy?: Types.ObjectId;
  entityType?: 'SanityReport' | 'Release' | 'BugTicket' | 'Lead' | 'Other';
  entityId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    entityType: {
      type: String,
      enum: ['SanityReport', 'Release', 'BugTicket', 'Lead', 'Other'],
      default: 'SanityReport',
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

export const Attachment = mongoose.model<IAttachment>('Attachment', AttachmentSchema);
