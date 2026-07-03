import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceIdParamsSchema,
  maintenanceQuerySchema,
} from '../validators/maintenance';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(maintenanceQuerySchema),
  maintenanceController.findAll.bind(maintenanceController)
);

router.get(
  '/health',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  maintenanceController.getFleetHealth.bind(maintenanceController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(maintenanceIdParamsSchema),
  maintenanceController.findById.bind(maintenanceController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createMaintenanceSchema),
  auditLog('CREATE', 'maintenance'),
  maintenanceController.create.bind(maintenanceController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(maintenanceIdParamsSchema),
  validate(updateMaintenanceSchema),
  auditLog('UPDATE', 'maintenance'),
  maintenanceController.update.bind(maintenanceController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(maintenanceIdParamsSchema),
  auditLog('DELETE', 'maintenance'),
  maintenanceController.delete.bind(maintenanceController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(maintenanceIdParamsSchema),
  auditLog('RESTORE', 'maintenance'),
  maintenanceController.restore.bind(maintenanceController)
);

router.get(
  '/vehicle/:vehicleId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  maintenanceController.getVehicleMaintenance.bind(maintenanceController)
);

export default router;
