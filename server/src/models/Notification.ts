import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType = 'RELEASE' | 'BUG' | 'SANITY' | 'SYSTEM' | 'ALERT';

export interface INotification extends Document {
  title: string;
  message: string;
  type: NotificationType;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  link?: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['RELEASE', 'BUG', 'SANITY', 'SYSTEM', 'ALERT'],
      default: 'RELEASE',
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH'],
      default: 'NORMAL',
    },
    link: {
      type: String,
      default: '',
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
