import { Router } from 'express';

import {
  changePassword,
  getCurrentUser,
  login,
  logout,
  registerManager,
  updateProfile,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rate-limit.middleware.js';

const authRouter = Router();

// Public endpoints are rate-limited because they accept passwords.
authRouter.post('/register', authRateLimiter, registerManager);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/logout', logout);

// This endpoint demonstrates the route-protection middleware used across later features.
authRouter.get('/me', requireAuth, getCurrentUser);

// Account settings endpoints for updating profile info and password.
authRouter.patch('/profile', requireAuth, updateProfile);
authRouter.patch('/password', requireAuth, authRateLimiter, changePassword);

export default authRouter;
