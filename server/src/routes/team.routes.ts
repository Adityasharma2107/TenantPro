import { Router } from 'express';

import { createTeamMember, listTeamMembers } from '../controllers/team.controller.js';
import { authorizeRoles, requireAuth } from '../middlewares/auth.middleware.js';

const teamRouter = Router();

// Team administration belongs to property managers only.
teamRouter.use(requireAuth, authorizeRoles('manager'));
teamRouter.get('/', listTeamMembers);
teamRouter.post('/users', createTeamMember);

export default teamRouter;
