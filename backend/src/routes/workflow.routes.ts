import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { UserRole } from '../types';
import {
  createWorkflowDefinitionSchema, updateWorkflowDefinitionSchema, transitionWorkflowSchema,
  workflowIdParamsSchema, workflowQuerySchema,
} from '../validators/workflow';

const router = Router();
router.use(authenticate);

router.get(
  '/definitions',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateQuery(workflowQuerySchema),
  workflowController.findAllDefinitions.bind(workflowController)
);

router.get(
  '/definitions/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(workflowIdParamsSchema),
  workflowController.findDefinitionById.bind(workflowController)
);

router.post(
  '/definitions',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(createWorkflowDefinitionSchema),
  workflowController.createDefinition.bind(workflowController)
);

router.put(
  '/definitions/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(workflowIdParamsSchema),
  validate(updateWorkflowDefinitionSchema),
  workflowController.updateDefinition.bind(workflowController)
);

router.delete(
  '/definitions/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(workflowIdParamsSchema),
  workflowController.deleteDefinition.bind(workflowController)
);

router.post(
  '/transition/:entityType/:entityId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validate(transitionWorkflowSchema),
  workflowController.transition.bind(workflowController)
);

router.get(
  '/history/:entityType/:entityId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  workflowController.getInstanceHistory.bind(workflowController)
);

router.get(
  '/instances',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateQuery(workflowQuerySchema),
  workflowController.getActiveInstances.bind(workflowController)
);

router.post(
  '/seed',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const { workflowService } = await import('../services/workflow.service');
      await workflowService.seedDefaultDefinitions();
      res.json({ success: true, message: 'Default workflow definitions seeded' });
    } catch (error) { next(error); }
  }
);

export default router;
