import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReleaseType =
  | 'FEATURE'
  | 'ENHANCEMENT'
  | 'BUG_FIX'
  | 'HOTFIX'
  | 'CONFIGURATION_CHANGE'
  | 'CONTENT_CHANGE'
  | 'MIGRATION'
  | 'OTHER';

export type ReleaseEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
export type ReleaseStatus = 'DRAFT' | 'IN_PROGRESS' | 'LIVE' | 'ROLLED_BACK' | 'CANCELLED';

export interface IRelease extends Document {
  university: Types.ObjectId;
  feature: Types.ObjectId;
  title: string;
  description?: string;
  releaseType: ReleaseType;
  environment: ReleaseEnvironment;
  releaseDate: Date;
  releaseTime: string;
  status: ReleaseStatus;
  releasedBy?: Types.ObjectId | string;
  deployedBy?: string;
  version?: string;
  bugTickets: Types.ObjectId[];
  sanityReports: Types.ObjectId[];
  leads: Types.ObjectId[];
  attachments: Array<{
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
  }>;
  rolledBackAt?: Date;
  rollbackReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReleaseSchema = new Schema<IRelease>(
  {
    university: {
      type: Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University is required'],
      index: true,
    },
    feature: {
      type: Schema.Types.ObjectId,
      ref: 'Feature',
      required: [true, 'Feature is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Release title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    releaseType: {
      type: String,
      enum: [
        'FEATURE',
        'ENHANCEMENT',
        'BUG_FIX',
        'HOTFIX',
        'CONFIGURATION_CHANGE',
        'CONTENT_CHANGE',
        'MIGRATION',
        'OTHER',
      ],
      required: [true, 'Release type is required'],
      default: 'FEATURE',
      index: true,
    },
    environment: {
      type: String,
      enum: ['DEVELOPMENT', 'STAGING', 'PRODUCTION'],
      required: [true, 'Environment is required'],
      default: 'PRODUCTION',
      index: true,
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
      index: true,
    },
    releaseTime: {
      type: String,
      required: [true, 'Release time is required (e.g. 03:45 PM)'],
      default: '12:00 PM',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'IN_PROGRESS', 'LIVE', 'ROLLED_BACK', 'CANCELLED'],
      required: [true, 'Release status is required'],
      default: 'LIVE',
      index: true,
    },
    releasedBy: {
      type: Schema.Types.Mixed,
      default: 'QA Team',
    },
    deployedBy: {
      type: String,
      default: 'DevOps Team',
    },
    version: {
      type: String,
      default: 'v1.0.0',
    },
    bugTickets: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BugTicket',
      },
    ],
    sanityReports: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SanityReport',
      },
    ],
    leads: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lead',
      },
    ],
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, default: 0 },
        mimeType: { type: String, default: 'application/pdf' },
      },
    ],
    rolledBackAt: {
      type: Date,
    },
    rollbackReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast querying and matrix generation
ReleaseSchema.index({ university: 1, feature: 1, environment: 1, status: 1 });
ReleaseSchema.index({ releaseDate: -1, status: 1 });

export const Release = mongoose.model<IRelease>('Release', ReleaseSchema);
