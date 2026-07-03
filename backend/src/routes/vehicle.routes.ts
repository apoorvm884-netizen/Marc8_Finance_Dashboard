import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamsSchema,
  vehicleQuerySchema,
} from '../validators/vehicle';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(vehicleQuerySchema),
  vehicleController.findAll.bind(vehicleController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleIdParamsSchema),
  vehicleController.findById.bind(vehicleController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createVehicleSchema),
  auditLog('CREATE', 'vehicle'),
  vehicleController.create.bind(vehicleController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleIdParamsSchema),
  validate(updateVehicleSchema),
  auditLog('UPDATE', 'vehicle'),
  vehicleController.update.bind(vehicleController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleIdParamsSchema),
  auditLog('DELETE', 'vehicle'),
  vehicleController.delete.bind(vehicleController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(vehicleIdParamsSchema),
  auditLog('RESTORE', 'vehicle'),
  vehicleController.restore.bind(vehicleController)
);

router.post(
  '/:id/duplicate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleIdParamsSchema),
  auditLog('CREATE', 'vehicle'),
  vehicleController.duplicate.bind(vehicleController)
);

export default router;
