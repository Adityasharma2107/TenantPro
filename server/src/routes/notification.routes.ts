import { Router } from 'express';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notification.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', listNotifications);
notificationRouter.patch('/:id/read', markNotificationRead);
notificationRouter.post('/mark-all-read', markAllNotificationsRead);

export default notificationRouter;
