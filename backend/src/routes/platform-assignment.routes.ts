import { Router } from 'express';
import { platformAssignmentController } from '../controllers/platform-assignment.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createAssignmentSchema,
  endAssignmentSchema,
  assignmentIdParamsSchema,
  assignmentQuerySchema,
} from '../validators/platform-assignment';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(assignmentQuerySchema),
  platformAssignmentController.findAll.bind(platformAssignmentController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(assignmentIdParamsSchema),
  platformAssignmentController.findById.bind(platformAssignmentController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createAssignmentSchema),
  auditLog('CREATE', 'platform_assignment'),
  platformAssignmentController.create.bind(platformAssignmentController)
);

router.put(
  '/:id/end',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(assignmentIdParamsSchema),
  validate(endAssignmentSchema),
  auditLog('UPDATE', 'platform_assignment'),
  platformAssignmentController.endAssignment.bind(platformAssignmentController)
);

router.get(
  '/vehicle/:vehicleId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  platformAssignmentController.getVehicleAssignmentHistory.bind(platformAssignmentController)
);

export default router;
