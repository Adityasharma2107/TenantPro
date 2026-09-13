import { Router } from 'express';

import { getAnalytics } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const analyticsRouter = Router();

analyticsRouter.get('/', requireAuth, getAnalytics);

export default analyticsRouter;
