import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../config/auth.js';
import { Property } from '../models/Property.model.js';
import { Ticket } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';
import { createAccessToken } from '../utils/auth-token.js';
import {
  createPropertySchema,
  switchPropertySchema,
  updatePropertySchema,
} from '../validations/property.validation.js';

// Returns details and operational metrics for the current user's property.
export const getProperty: RequestHandler = async (request, response) => {
  const propertyId = request.user?.propertyId;

  if (!propertyId) {
    return response.status(400).json({ message: 'User is not associated with a property.' });
  }

  const property = await Property.findById(propertyId).populate('manager', 'name email');

  if (!property) {
    return response.status(404).json({ message: 'Property not found.' });
  }

  const [occupiedUnits, technicianCount, activeTicketsCount] = await Promise.all([
    User.countDocuments({ property: propertyId, role: 'tenant', isActive: true }),
    User.countDocuments({ property: propertyId, role: 'technician', isActive: true }),
    Ticket.countDocuments({
      property: propertyId,
      status: { $in: ['open', 'assigned', 'in_progress'] },
    }),
  ]);

  const totalUnits = property.unitCount;
  const vacantUnits = Math.max(0, totalUnits - occupiedUnits);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return response.status(200).json({
    property: {
      id: property._id.toString(),
      name: property.name,
      address: property.address,
      unitCount: property.unitCount,
      contactEmail: property.contactEmail,
      manager: property.manager,
      createdAt: (property as any).createdAt,
      updatedAt: (property as any).updatedAt,
    },
    stats: {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
      technicianCount,
      activeTicketsCount,
    },
  });
};

// Allows a property manager to update building name, address, units, or contact email.
export const updateProperty: RequestHandler = async (request, response) => {
  const propertyId = request.user?.propertyId;

  if (!propertyId) {
    return response.status(400).json({ message: 'User is not associated with a property.' });
  }

  const result = updatePropertySchema.safeParse(request.body);
  if (!result.success) {
    return response.status(400).json({
      message: 'Please correct the property details.',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return response.status(404).json({ message: 'Property not found.' });
  }

  const { name, address, unitCount, contactEmail } = result.data;
  if (name !== undefined) property.name = name;
  if (address !== undefined) {
    property.address = {
      line1: address.line1 ?? property.address.line1,
      city: address.city ?? property.address.city,
      state: address.state ?? property.address.state,
      postalCode: address.postalCode ?? property.address.postalCode,
    };
  }
  if (unitCount !== undefined) property.unitCount = unitCount;
  if (contactEmail !== undefined) property.contactEmail = contactEmail;

  await property.save();
  await property.populate('manager', 'name email');

  return response.status(200).json({
    message: 'Property details updated successfully.',
    property: {
      id: property._id.toString(),
      name: property.name,
      address: property.address,
      unitCount: property.unitCount,
      contactEmail: property.contactEmail,
      manager: property.manager,
      createdAt: (property as any).createdAt,
      updatedAt: (property as any).updatedAt,
    },
  });
};

// Lists all properties managed by or accessible to the current manager
export const listProperties: RequestHandler = async (request, response) => {
  const userId = request.user!.userId;
  const activePropertyId = request.user!.propertyId;

  const properties = await Property.find({
    $or: [{ manager: userId }, { _id: activePropertyId }],
  }).sort({ createdAt: -1 });

  const propertiesWithStats = await Promise.all(
    properties.map(async (prop) => {
      const [occupiedUnits, activeTicketsCount] = await Promise.all([
        User.countDocuments({ property: prop._id, role: 'tenant', isActive: true }),
        Ticket.countDocuments({
          property: prop._id,
          status: { $in: ['open', 'assigned', 'in_progress'] },
        }),
      ]);

      return {
        id: prop._id.toString(),
        name: prop.name,
        address: prop.address,
        unitCount: prop.unitCount,
        contactEmail: prop.contactEmail,
        occupiedUnits,
        activeTicketsCount,
        isActive: prop._id.toString() === activePropertyId,
      };
    }),
  );

  return response.status(200).json({
    properties: propertiesWithStats,
  });
};

// Allows a manager to create a new property
export const createProperty: RequestHandler = async (request, response) => {
  const result = createPropertySchema.safeParse(request.body);
  if (!result.success) {
    return response.status(400).json({
      message: 'Please correct the property details.',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { name, address, unitCount, contactEmail } = result.data;
  const property = await Property.create({
    name,
    address,
    unitCount,
    contactEmail,
    manager: request.user!.userId,
  });

  return response.status(201).json({
    message: 'Property created successfully.',
    property: {
      id: property._id.toString(),
      name: property.name,
      address: property.address,
      unitCount: property.unitCount,
      contactEmail: property.contactEmail,
    },
  });
};

// Allows a manager to switch active property in session
export const switchProperty: RequestHandler = async (request, response) => {
  const result = switchPropertySchema.safeParse(request.body);
  if (!result.success) {
    return response.status(400).json({ message: 'Invalid property selected.' });
  }

  const { propertyId } = result.data;
  const userId = request.user!.userId;

  const property = await Property.findOne({
    _id: propertyId,
    $or: [{ manager: userId }, { _id: request.user!.propertyId }],
  });

  if (!property) {
    return response.status(404).json({ message: 'Property not found or access denied.' });
  }

  // Update user's active property reference
  await User.findByIdAndUpdate(userId, { property: property._id });

  // Issue updated JWT cookie with new propertyId
  const token = createAccessToken({
    _id: new Types.ObjectId(userId),
    role: request.user!.role,
    property: property._id,
  });

  response.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

  return response.status(200).json({
    message: `Switched active property to ${property.name}.`,
    property: {
      id: property._id.toString(),
      name: property.name,
      address: property.address,
      unitCount: property.unitCount,
      contactEmail: property.contactEmail,
    },
  });
};
