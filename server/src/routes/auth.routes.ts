import { Router } from 'express';

import { getCurrentUser, login, logout, registerManager } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rate-limit.middleware.js';

const authRouter = Router();

// Public endpoints are rate-limited because they accept passwords.
authRouter.post('/register', authRateLimiter, registerManager);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/logout', logout);

// This endpoint demonstrates the route-protection middleware used across later features.
authRouter.get('/me', requireAuth, getCurrentUser);

export default authRouter;
