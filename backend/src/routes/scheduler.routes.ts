import { Router } from 'express';
import { schedulerController } from '../controllers/scheduler.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleIdParamsSchema,
  scheduleQuerySchema,
} from '../validators/scheduler';

const router = Router();

router.use(authenticate);

router.get(
  '/upcoming',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  schedulerController.getUpcomingServices.bind(schedulerController)
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(scheduleQuerySchema),
  schedulerController.findAll.bind(schedulerController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(scheduleIdParamsSchema),
  schedulerController.findById.bind(schedulerController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createScheduleSchema),
  auditLog('CREATE', 'service_schedule'),
  schedulerController.create.bind(schedulerController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(scheduleIdParamsSchema),
  validate(updateScheduleSchema),
  auditLog('UPDATE', 'service_schedule'),
  schedulerController.update.bind(schedulerController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(scheduleIdParamsSchema),
  auditLog('DELETE', 'service_schedule'),
  schedulerController.delete.bind(schedulerController)
);

export default router;
