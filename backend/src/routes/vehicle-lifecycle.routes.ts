import { Router } from 'express';
import { vehicleLifecycleController } from '../controllers/vehicle-lifecycle.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  vehicleIdParamsSchema,
  createTimelineEventSchema,
} from '../validators/vehicle-lifecycle';

const router = Router();

router.use(authenticate);

router.get(
  '/:vehicleId/timeline',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleIdParamsSchema),
  vehicleLifecycleController.getTimeline.bind(vehicleLifecycleController)
);

router.post(
  '/:vehicleId/timeline',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleIdParamsSchema),
  validate(createTimelineEventSchema),
  auditLog('CREATE', 'timeline_event'),
  vehicleLifecycleController.addEvent.bind(vehicleLifecycleController)
);

router.get(
  '/:vehicleId/intelligence',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleIdParamsSchema),
  vehicleLifecycleController.getVehicleIntelligence.bind(vehicleLifecycleController)
);

export default router;
