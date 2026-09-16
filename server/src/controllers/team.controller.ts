import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { Property } from '../models/Property.model.js';
import { User } from '../models/User.model.js';
import { createTeamMemberSchema } from '../validations/team.validation.js';

// Returns safe account fields for tables; password hashes never leave the server.
const toPublicTeamMember = (user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  property?: any;
  unitNumber?: string;
  specialization?: string;
  avatarUrl?: string;
  isActive: boolean;
}) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  propertyId: user.property?._id ? user.property._id.toString() : user.property ? user.property.toString() : undefined,
  propertyName: user.property?.name,
  unitNumber: user.unitNumber,
  specialization: user.specialization,
  avatarUrl: user.avatarUrl,
  isActive: user.isActive,
});

// Creates a tenant or technician inside the selected or active manager's property.
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

  // Determine property: either explicitly specified and authorized, or active property
  let targetPropertyId = request.user!.propertyId;
  if (data.propertyId) {
    const propertyMatch = await Property.findOne({
      _id: data.propertyId,
      $or: [{ manager: request.user!.userId }, { _id: request.user!.propertyId }],
    });
    if (propertyMatch) {
      targetPropertyId = data.propertyId;
    }
  }

  // Hashes the temporary password before storing the new account in MongoDB.
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    email,
    passwordHash,
    role: data.role,
    property: targetPropertyId,
    unitNumber: data.role === 'tenant' ? data.unitNumber : undefined,
    specialization: data.role === 'technician' ? data.specialization : undefined,
  });

  const populatedUser = await user.populate('property', 'name');

  return response.status(201).json({
    message: `${data.role === 'tenant' ? 'Resident' : 'Technician'} account created successfully.`,
    user: toPublicTeamMember(populatedUser),
  });
};

// Lists residents and technicians across properties managed by this manager.
export const listTeamMembers: RequestHandler = async (request, response) => {
  let propertyFilter: any = request.user!.propertyId;

  if (mongoose.connection.readyState === 1) {
    const managerProperties = await Property.find({ manager: request.user!.userId }).select('_id');
    if (managerProperties.length > 0) {
      const propIds = managerProperties.map((p) => p._id);
      if (!propIds.some((id) => id.toString() === request.user!.propertyId)) {
        propIds.push(new mongoose.Types.ObjectId(request.user!.propertyId));
      }
      propertyFilter = { $in: propIds };
    }
  }

  const members = await User.find({
    property: propertyFilter,
    role: { $in: ['tenant', 'technician'] },
  })
    .populate('property', 'name')
    .sort({ role: 1, name: 1 });

  return response.status(200).json({ users: members.map(toPublicTeamMember) });
};
