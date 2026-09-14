import { Router } from 'express';
import { getProperty, updateProperty } from '../controllers/property.controller.js';
import { authorizeRoles, requireAuth } from '../middlewares/auth.middleware.js';

const propertyRouter = Router();

// Any authenticated member can read building info and occupancy metrics.
propertyRouter.get('/', requireAuth, getProperty);

// Only managers can edit property details.
propertyRouter.patch('/', requireAuth, authorizeRoles('manager'), updateProperty);

export default propertyRouter;
