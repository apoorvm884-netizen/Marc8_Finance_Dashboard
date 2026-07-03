import { Router } from 'express';
import { approvalController } from '../controllers/approval.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import { createApprovalRequestSchema, approveRejectSchema, approvalRequestIdParamsSchema, approvalQuerySchema } from '../validators/approval';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(approvalQuerySchema),
  approvalController.findAll.bind(approvalController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(approvalRequestIdParamsSchema),
  approvalController.findById.bind(approvalController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createApprovalRequestSchema),
  auditLog('CREATE', 'approval'),
  approvalController.create.bind(approvalController)
);

router.post(
  '/:id/process',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(approvalRequestIdParamsSchema),
  validate(approveRejectSchema),
  auditLog('UPDATE', 'approval'),
  approvalController.processLevel.bind(approvalController)
);

router.get(
  '/pending/:userId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  approvalController.getPendingForUser.bind(approvalController)
);

export default router;
