import { model, Schema, Types } from 'mongoose';

export interface IComment {
  ticket: Types.ObjectId;
  author: Types.ObjectId;
  message: string;
}

// Stores a conversation message attached to one maintenance ticket.
const commentSchema = new Schema<IComment>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, minlength: 1, maxlength: 1_000 },
  },
  { timestamps: true },
);

// Lets the ticket-details page load comments in time order efficiently.
commentSchema.index({ ticket: 1, createdAt: 1 });

export const Comment = model<IComment>('Comment', commentSchema);
