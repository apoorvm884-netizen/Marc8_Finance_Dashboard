import { Router } from 'express';
import { vehicleOwnerController } from '../controllers/vehicle-owner.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createVehicleOwnerSchema,
  updateVehicleOwnerSchema,
  vehicleOwnerIdParamsSchema,
  vehicleOwnerQuerySchema,
  vehicleIdParamsSchema,
  createOwnerDocumentSchema,
  updateOwnerDocumentSchema,
  ownerDocumentIdParamsSchema,
  assignOwnerToVehicleSchema,
} from '../validators/vehicle-owner';

const router = Router();

router.use(authenticate);

// Owner CRUD
router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(vehicleOwnerQuerySchema),
  vehicleOwnerController.findAll.bind(vehicleOwnerController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleOwnerIdParamsSchema),
  vehicleOwnerController.findById.bind(vehicleOwnerController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(createVehicleOwnerSchema),
  auditLog('CREATE', 'vehicle_owner'),
  vehicleOwnerController.create.bind(vehicleOwnerController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleOwnerIdParamsSchema),
  validate(updateVehicleOwnerSchema),
  auditLog('UPDATE', 'vehicle_owner'),
  vehicleOwnerController.update.bind(vehicleOwnerController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleOwnerIdParamsSchema),
  auditLog('DELETE', 'vehicle_owner'),
  vehicleOwnerController.delete.bind(vehicleOwnerController)
);

router.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(vehicleOwnerIdParamsSchema),
  auditLog('RESTORE', 'vehicle_owner'),
  vehicleOwnerController.restore.bind(vehicleOwnerController)
);

// Owner → Vehicle assignment
router.post(
  '/:id/assign',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleOwnerIdParamsSchema),
  validate(assignOwnerToVehicleSchema),
  auditLog('CREATE', 'owner_assignment'),
  vehicleOwnerController.assignToVehicle.bind(vehicleOwnerController)
);

router.post(
  '/:id/unassign',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleOwnerIdParamsSchema),
  auditLog('UPDATE', 'owner_assignment'),
  vehicleOwnerController.unassignFromVehicle.bind(vehicleOwnerController)
);

// Owner vehicles
router.get(
  '/:id/vehicles',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleOwnerIdParamsSchema),
  vehicleOwnerController.getOwnerVehicles.bind(vehicleOwnerController)
);

// Vehicle → Current owner lookup
router.get(
  '/by-vehicle/:vehicleId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleIdParamsSchema),
  vehicleOwnerController.getVehicleOwner.bind(vehicleOwnerController)
);

// Ownership history
router.get(
  '/history/:vehicleId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleIdParamsSchema),
  vehicleOwnerController.getOwnershipHistory.bind(vehicleOwnerController)
);

// Documents sub-resource
router.get(
  '/:id/documents',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(vehicleOwnerIdParamsSchema),
  vehicleOwnerController.getDocuments.bind(vehicleOwnerController)
);

router.post(
  '/:id/documents',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(vehicleOwnerIdParamsSchema),
  validate(createOwnerDocumentSchema),
  auditLog('CREATE', 'owner_document'),
  vehicleOwnerController.addDocument.bind(vehicleOwnerController)
);

router.put(
  '/:id/documents/:docId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(updateOwnerDocumentSchema),
  auditLog('UPDATE', 'owner_document'),
  vehicleOwnerController.updateDocument.bind(vehicleOwnerController)
);

router.delete(
  '/:id/documents/:docId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  auditLog('DELETE', 'owner_document'),
  vehicleOwnerController.deleteDocument.bind(vehicleOwnerController)
);

export default router;
