import { Router } from 'express';
import { vendorController } from '../controllers/vendor.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createVendorSchema,
  updateVendorSchema,
  vendorIdParamsSchema,
  vendorQuerySchema,
} from '../validators/vendor';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(vendorQuerySchema),
  vendorController.findAll.bind(vendorController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vendorIdParamsSchema),
  vendorController.findById.bind(vendorController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createVendorSchema),
  auditLog('CREATE', 'vendor'),
  vendorController.create.bind(vendorController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vendorIdParamsSchema),
  validate(updateVendorSchema),
  auditLog('UPDATE', 'vendor'),
  vendorController.update.bind(vendorController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vendorIdParamsSchema),
  auditLog('DELETE', 'vendor'),
  vendorController.delete.bind(vendorController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(vendorIdParamsSchema),
  auditLog('RESTORE', 'vendor'),
  vendorController.restore.bind(vendorController)
);

export default router;
