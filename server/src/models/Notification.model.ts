import { model, Schema, Types } from 'mongoose';

export interface INotification {
  recipient: Types.ObjectId;
  actor?: Types.ObjectId;
  ticket?: Types.ObjectId;
  type: 'ticket_created' | 'ticket_assigned' | 'status_changed' | 'comment_added' | 'expense_updated';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    type: {
      type: String,
      enum: ['ticket_created', 'ticket_assigned', 'status_changed', 'comment_added', 'expense_updated'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
