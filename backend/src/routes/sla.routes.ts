import { Router } from 'express';
import { slaController } from '../controllers/sla.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { UserRole } from '../types';
import { createSLADefinitionSchema, updateSLADefinitionSchema, slaIdParamsSchema, slaQuerySchema } from '../validators/sla';

const router = Router();
router.use(authenticate);

router.get(
  '/definitions',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateQuery(slaQuerySchema),
  slaController.findAllDefinitions.bind(slaController)
);

router.get(
  '/definitions/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(slaIdParamsSchema),
  slaController.findDefinitionById.bind(slaController)
);

router.post(
  '/definitions',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(createSLADefinitionSchema),
  slaController.createDefinition.bind(slaController)
);

router.put(
  '/definitions/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(slaIdParamsSchema),
  validate(updateSLADefinitionSchema),
  slaController.updateDefinition.bind(slaController)
);

router.delete(
  '/definitions/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(slaIdParamsSchema),
  slaController.deleteDefinition.bind(slaController)
);

router.post(
  '/check-breaches',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  slaController.checkBreaches.bind(slaController)
);

router.get(
  '/breaches',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  slaController.getBreaches.bind(slaController)
);

export default router;
