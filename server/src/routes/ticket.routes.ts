import { Router } from 'express';

import {
  addComment,
  assignTechnician,
  createTicket,
  getTicketById,
  listTickets,
  updatePriority,
  updateStatus,
} from '../controllers/ticket.controller.js';
import { authorizeRoles, requireAuth } from '../middlewares/auth.middleware.js';

const ticketRouter = Router();

// Every ticket operation starts by identifying the signed-in user and their property.
ticketRouter.use(requireAuth);
ticketRouter.get('/', listTickets);
ticketRouter.post('/', authorizeRoles('tenant'), createTicket);
ticketRouter.get('/:ticketId', getTicketById);
ticketRouter.patch('/:ticketId/assignment', authorizeRoles('manager'), assignTechnician);
ticketRouter.patch('/:ticketId/priority', authorizeRoles('manager'), updatePriority);
ticketRouter.patch('/:ticketId/status', updateStatus);
ticketRouter.post('/:ticketId/comments', addComment);

export default ticketRouter;
