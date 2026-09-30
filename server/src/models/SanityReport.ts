import mongoose, { Document, Schema, Types } from 'mongoose';

export type SanityStatus = 'NOT_TESTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'PARTIAL';

export interface ISanityReport extends Document {
  title: string;
  release?: Types.ObjectId;
  university?: Types.ObjectId;
  sanityStatus: SanityStatus;
  testedBy: string;
  testDate: Date;
  testTime?: string;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  totalTestCases: number;
  passed: number;
  failed: number;
  blocked: number;
  notes?: string;
  attachments: Array<{
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SanityReportSchema = new Schema<ISanityReport>(
  {
    title: {
      type: String,
      required: [true, 'Sanity report title is required'],
      trim: true,
    },
    release: {
      type: Schema.Types.ObjectId,
      ref: 'Release',
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: 'University',
    },
    sanityStatus: {
      type: String,
      enum: ['NOT_TESTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'PARTIAL'],
      default: 'PASSED',
    },
    testedBy: {
      type: String,
      default: 'QA Team',
      trim: true,
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    testTime: {
      type: String,
      default: '04:00 PM',
    },
    environment: {
      type: String,
      enum: ['DEVELOPMENT', 'STAGING', 'PRODUCTION'],
      default: 'PRODUCTION',
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    blocked: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, default: 0 },
        mimeType: { type: String, default: 'application/pdf' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const SanityReport = mongoose.model<ISanityReport>('SanityReport', SanityReportSchema);
