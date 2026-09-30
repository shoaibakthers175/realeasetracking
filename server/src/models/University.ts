import mongoose, { Document, Schema } from 'mongoose';

export type UniversityType = 'STANDALONE' | 'MULTI_TENANT';
export type UniversityStatus = 'ACTIVE' | 'INACTIVE';
export type UniversityEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export interface IUniversity extends Document {
  name: string;
  code: string;
  type: UniversityType;
  productionUrl?: string;
  stagingUrl?: string;
  developmentUrl?: string;
  tenantId?: string;
  status: UniversityStatus;
  primaryEnvironment: UniversityEnvironment;
  logoUrl?: string;
  location?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    name: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'University code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['STANDALONE', 'MULTI_TENANT'],
      required: [true, 'University type is required'],
      default: 'MULTI_TENANT',
    },
    productionUrl: {
      type: String,
      trim: true,
      default: '',
    },
    stagingUrl: {
      type: String,
      trim: true,
      default: '',
    },
    developmentUrl: {
      type: String,
      trim: true,
      default: '',
    },
    tenantId: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    primaryEnvironment: {
      type: String,
      enum: ['DEVELOPMENT', 'STAGING', 'PRODUCTION'],
      default: 'PRODUCTION',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const University = mongoose.model<IUniversity>('University', UniversitySchema);
