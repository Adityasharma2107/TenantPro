import { Router } from 'express';
import {
  createProperty,
  getProperty,
  listProperties,
  switchProperty,
  updateProperty,
} from '../controllers/property.controller.js';
import { authorizeRoles, requireAuth } from '../middlewares/auth.middleware.js';

const propertyRouter = Router();

// Any authenticated member can read building info and occupancy metrics.
propertyRouter.get('/', requireAuth, getProperty);

// Managers can view all properties they manage
propertyRouter.get('/all', requireAuth, authorizeRoles('manager'), listProperties);
propertyRouter.get('/list', requireAuth, authorizeRoles('manager'), listProperties);

// Managers can create a new property
propertyRouter.post('/', requireAuth, authorizeRoles('manager'), createProperty);

// Managers can switch their active property
propertyRouter.post('/switch', requireAuth, authorizeRoles('manager'), switchProperty);

// Only managers can edit property details.
propertyRouter.patch('/', requireAuth, authorizeRoles('manager'), updateProperty);

export default propertyRouter;
