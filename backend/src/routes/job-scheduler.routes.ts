import { Router } from 'express';
import { jobSchedulerController } from '../controllers/job-scheduler.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { UserRole } from '../types';
import { createScheduledJobSchema, updateScheduledJobSchema, scheduledJobIdParamsSchema, scheduledJobQuerySchema } from '../validators/job-scheduler';

const router = Router();
router.use(authenticate);

router.get(
  '/due',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  jobSchedulerController.getDueJobs.bind(jobSchedulerController)
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateQuery(scheduledJobQuerySchema),
  jobSchedulerController.findAll.bind(jobSchedulerController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(scheduledJobIdParamsSchema),
  jobSchedulerController.findById.bind(jobSchedulerController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(createScheduledJobSchema),
  jobSchedulerController.create.bind(jobSchedulerController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(scheduledJobIdParamsSchema),
  validate(updateScheduledJobSchema),
  jobSchedulerController.update.bind(jobSchedulerController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(scheduledJobIdParamsSchema),
  jobSchedulerController.delete.bind(jobSchedulerController)
);

router.post(
  '/:id/execute',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(scheduledJobIdParamsSchema),
  jobSchedulerController.execute.bind(jobSchedulerController)
);

router.get(
  '/:id/executions',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(scheduledJobIdParamsSchema),
  jobSchedulerController.getExecutions.bind(jobSchedulerController)
);

export default router;
