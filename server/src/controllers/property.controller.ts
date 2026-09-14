import type { RequestHandler } from 'express';
import { Property } from '../models/Property.model.js';
import { Ticket } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';
import { updatePropertySchema } from '../validations/property.validation.js';

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
