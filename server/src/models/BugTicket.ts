import mongoose, { Document, Schema, Types } from 'mongoose';

export type BugPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';

export interface IBugTicket extends Document {
  ticketId: string;
  title: string;
  description?: string;
  jiraUrl?: string;
  priority: BugPriority;
  status: BugStatus;
  university?: Types.ObjectId;
  release?: Types.ObjectId;
  createdDate: Date;
  resolvedDate?: Date;
  reportedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BugTicketSchema = new Schema<IBugTicket>(
  {
    ticketId: {
      type: String,
      required: [true, 'Ticket ID is required (e.g. UPG-2345)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Bug title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    jiraUrl: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'],
      default: 'RESOLVED',
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: 'University',
    },
    release: {
      type: Schema.Types.ObjectId,
      ref: 'Release',
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    resolvedDate: {
      type: Date,
    },
    reportedBy: {
      type: String,
      default: 'QA Team',
    },
  },
  {
    timestamps: true,
  }
);

export const BugTicket = mongoose.model<IBugTicket>('BugTicket', BugTicketSchema);
