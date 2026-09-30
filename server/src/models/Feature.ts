import mongoose, { Document, Schema } from 'mongoose';

export type FeatureCategory =
  | 'ADMISSION'
  | 'PAYMENTS'
  | 'LEAD_MANAGEMENT'
  | 'COMMUNICATION'
  | 'ANALYTICS'
  | 'CORE'
  | 'INTEGRATION'
  | 'OTHER';

export interface IFeature extends Document {
  name: string;
  code: string;
  category: FeatureCategory;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema = new Schema<IFeature>(
  {
    name: {
      type: String,
      required: [true, 'Feature name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Feature code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'ADMISSION',
        'PAYMENTS',
        'LEAD_MANAGEMENT',
        'COMMUNICATION',
        'ANALYTICS',
        'CORE',
        'INTEGRATION',
        'OTHER',
      ],
      default: 'CORE',
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Feature = mongoose.model<IFeature>('Feature', FeatureSchema);
