import { model, Schema, Types } from 'mongoose';

export interface IComment {
  ticket: Types.ObjectId;
  author: Types.ObjectId;
  message: string;
}

const commentSchema = new Schema<IComment>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, minlength: 1, maxlength: 1_000 },
  },
  { timestamps: true },
);

commentSchema.index({ ticket: 1, createdAt: 1 });

export const Comment = model<IComment>('Comment', commentSchema);
