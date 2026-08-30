import { model, Schema, Types } from 'mongoose';

export const userRoles = ['tenant', 'manager', 'technician'] as const;
export type UserRole = (typeof userRoles)[number];

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  property: Types.ObjectId;
  unitNumber?: string;
  specialization?: string;
  isActive: boolean;
}

// Stores each tenant, manager, or technician and links them to one property.
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // The real password is never stored; this field holds its bcrypt hash.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: userRoles, required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    // A unit is required by the team-management API for tenant accounts.
    unitNumber: { type: String, trim: true, maxlength: 30 },
    // Technicians can be tagged with a skill such as plumbing or electrical work.
    specialization: { type: String, trim: true, maxlength: 80 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
