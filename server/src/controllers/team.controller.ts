import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';

import { User } from '../models/User.model.js';
import { createTeamMemberSchema } from '../validations/team.validation.js';

// Returns safe account fields for tables; password hashes never leave the server.
const toPublicTeamMember = (user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  unitNumber?: string;
  specialization?: string;
  isActive: boolean;
}) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  unitNumber: user.unitNumber,
  specialization: user.specialization,
  isActive: user.isActive,
});

// Creates a tenant or technician inside the current manager's property.
export const createTeamMember: RequestHandler = async (request, response) => {
  const result = createTeamMemberSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({
      message: 'Please correct the team member details.',
      errors: result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
  }

  const data = result.data;
  const email = data.email.toLowerCase();
  const existingUser = await User.exists({ email });

  if (existingUser) {
    return response.status(409).json({ message: 'An account already uses this email address.' });
  }

  // Hashes the temporary password before storing the new account in MongoDB.
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    email,
    passwordHash,
    role: data.role,
    property: request.user!.propertyId,
    unitNumber: data.role === 'tenant' ? data.unitNumber : undefined,
    specialization: data.role === 'technician' ? data.specialization : undefined,
  });

  return response.status(201).json({
    message: `${data.role === 'tenant' ? 'Resident' : 'Technician'} account created successfully.`,
    user: toPublicTeamMember(user),
  });
};

// Lists only residents and technicians from the current manager's property.
export const listTeamMembers: RequestHandler = async (request, response) => {
  const members = await User.find({
    property: request.user!.propertyId,
    role: { $in: ['tenant', 'technician'] },
  }).sort({ role: 1, name: 1 });

  return response.status(200).json({ users: members.map(toPublicTeamMember) });
};
