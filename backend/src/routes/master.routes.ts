import { Router } from 'express';
import { masterController } from '../controllers/master.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  masterTypeParamSchema,
  masterValueIdParamsSchema,
  createMasterValueSchema,
  updateMasterValueSchema,
  masterValueQuerySchema,
} from '../validators/master';

const router = Router();

router.use(authenticate);

router.get(
  '/types',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  masterController.getTypes.bind(masterController)
);

router.get(
  '/:type',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateParams(masterTypeParamSchema),
  validateQuery(masterValueQuerySchema),
  masterController.getValues.bind(masterController)
);

router.get(
  '/:type/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER),
  validateParams(masterValueIdParamsSchema),
  masterController.getValueById.bind(masterController)
);

router.post(
  '/:type',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(masterTypeParamSchema),
  validate(createMasterValueSchema),
  auditLog('CREATE', 'master_value'),
  masterController.createValue.bind(masterController)
);

router.put(
  '/:type/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(masterValueIdParamsSchema),
  validate(updateMasterValueSchema),
  auditLog('UPDATE', 'master_value'),
  masterController.updateValue.bind(masterController)
);

router.delete(
  '/:type/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(masterValueIdParamsSchema),
  auditLog('DELETE', 'master_value'),
  masterController.deleteValue.bind(masterController)
);

router.post(
  '/:type/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(masterValueIdParamsSchema),
  auditLog('RESTORE', 'master_value'),
  masterController.restoreValue.bind(masterController)
);

export default router;
