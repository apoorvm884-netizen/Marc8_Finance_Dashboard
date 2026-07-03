import { Router } from 'express';
import { outstandingController } from '../controllers/outstanding.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createOutstandingSchema,
  updateOutstandingSchema,
  markAsPaidSchema,
  outstandingIdParamsSchema,
  outstandingQuerySchema,
} from '../validators/outstanding';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(outstandingQuerySchema),
  outstandingController.findAll.bind(outstandingController)
);

router.get(
  '/payment-planner',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  outstandingController.getPaymentPlanner.bind(outstandingController)
);

router.get(
  '/cash-requirement',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  outstandingController.getCashRequirementForecast.bind(outstandingController)
);

router.get(
  '/platform-analytics',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  outstandingController.getPlatformAnalytics.bind(outstandingController)
);

router.get(
  '/vehicle/:id/financials',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(outstandingIdParamsSchema),
  outstandingController.getVehicleFinancialIntelligence.bind(outstandingController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(outstandingIdParamsSchema),
  outstandingController.findById.bind(outstandingController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validate(createOutstandingSchema),
  auditLog('CREATE', 'outstanding'),
  outstandingController.create.bind(outstandingController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(outstandingIdParamsSchema),
  validate(updateOutstandingSchema),
  auditLog('UPDATE', 'outstanding'),
  outstandingController.update.bind(outstandingController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(outstandingIdParamsSchema),
  auditLog('DELETE', 'outstanding'),
  outstandingController.delete.bind(outstandingController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(outstandingIdParamsSchema),
  auditLog('RESTORE', 'outstanding'),
  outstandingController.restore.bind(outstandingController)
);

router.post(
  '/:id/mark-as-paid',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(outstandingIdParamsSchema),
  validate(markAsPaidSchema),
  auditLog('CREATE', 'expense'),
  outstandingController.markAsPaid.bind(outstandingController)
);

export default router;
