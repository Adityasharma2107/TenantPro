import { model, Schema, Types } from 'mongoose';

export const activityTypes = [
  'ticket_created',
  'ticket_updated',
  'ticket_assigned',
  'status_changed',
  'comment_added',
  'ticket_resolved',
  'ticket_closed',
] as const;

export type ActivityType = (typeof activityTypes)[number];

export interface IActivityLog {
  ticket: Types.ObjectId;
  actor: Types.ObjectId;
  type: ActivityType;
  description: string;
}

// Keeps an audit trail of important events, such as ticket assignment or closure.
const activityLogSchema = new Schema<IActivityLog>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: activityTypes, required: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

activityLogSchema.index({ ticket: 1, createdAt: 1 });

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
