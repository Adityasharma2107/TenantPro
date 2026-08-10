import { model, Schema, Types } from 'mongoose';

export const userRoles = ['tenant', 'manager', 'technician'] as const;
export type UserRole = (typeof userRoles)[number];

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  property: Types.ObjectId;
  isActive: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: userRoles, required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
