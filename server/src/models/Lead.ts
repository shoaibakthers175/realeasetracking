import mongoose, { Document, Schema, Types } from 'mongoose';

export type LeadSource = 'Website' | 'Campaign' | 'Portal' | 'API' | 'Social' | 'Direct' | 'Offline';
export type IntegrationStatus = 'CREATED' | 'NOT_CREATED' | 'PENDING' | 'ERROR';
export type VerificationStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface ILead extends Document {
  leadId: string;
  university: Types.ObjectId;
  release?: Types.ObjectId;
  program: string;
  form?: string;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  generatedAt: Date;
  source: LeadSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  lsqStatus: IntegrationStatus;
  opportunityStatus: IntegrationStatus;
  erpStatus: IntegrationStatus;
  verificationStatus: VerificationStatus;
  leadEmail?: string;
  leadPhone?: string;
  notes?: string;
  rawPayload?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    leadId: {
      type: String,
      required: [true, 'Lead ID is required (e.g. LID-90876)'],
      unique: true,
      trim: true,
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
    },
    release: {
      type: Schema.Types.ObjectId,
      ref: 'Release',
    },
    program: {
      type: String,
      default: 'B.Tech',
      trim: true,
    },
    form: {
      type: String,
      default: 'Lead Enquiry Form',
      trim: true,
    },
    environment: {
      type: String,
      enum: ['DEVELOPMENT', 'STAGING', 'PRODUCTION'],
      default: 'PRODUCTION',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: 'Website',
      trim: true,
    },
    utmSource: {
      type: String,
      default: 'google',
    },
    utmMedium: {
      type: String,
      default: 'cpc',
    },
    utmCampaign: {
      type: String,
      default: 'fall_admissions_2026',
    },
    lsqStatus: {
      type: String,
      enum: ['CREATED', 'NOT_CREATED', 'PENDING', 'ERROR'],
      default: 'CREATED',
    },
    opportunityStatus: {
      type: String,
      enum: ['CREATED', 'NOT_CREATED', 'PENDING', 'ERROR'],
      default: 'CREATED',
    },
    erpStatus: {
      type: String,
      enum: ['CREATED', 'NOT_CREATED', 'PENDING', 'ERROR'],
      default: 'CREATED',
    },
    verificationStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },
    leadEmail: {
      type: String,
      default: '',
    },
    leadPhone: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
