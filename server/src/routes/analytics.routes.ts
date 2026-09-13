import { Router } from 'express';

import { getAnalytics } from '../controllers/analytics.controller.js';
import { authorizeRoles, requireAuth } from '../middlewares/auth.middleware.js';

const analyticsRouter = Router();

analyticsRouter.get('/', requireAuth, authorizeRoles('manager'), getAnalytics);

export default analyticsRouter;
