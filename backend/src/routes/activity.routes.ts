import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateQuery, validateParams } from '../middleware/validate';
import { UserRole } from '../types';
import { activityQuerySchema, activityEntityParamsSchema } from '../validators/activity';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(activityQuerySchema),
  activityController.findAll.bind(activityController)
);

router.get(
  '/:entityType/:entityId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(activityEntityParamsSchema),
  activityController.findByEntity.bind(activityController)
);

export default router;
