import { Router } from 'express';
import { automationController } from '../controllers/automation.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { UserRole } from '../types';
import { createAutomationRuleSchema, updateAutomationRuleSchema, automationRuleIdParamsSchema, automationQuerySchema } from '../validators/automation';

const router = Router();
router.use(authenticate);

router.get(
  '/summary',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  automationController.getSummary.bind(automationController)
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateQuery(automationQuerySchema),
  automationController.findAllRules.bind(automationController)
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(automationRuleIdParamsSchema),
  automationController.findRuleById.bind(automationController)
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(createAutomationRuleSchema),
  automationController.createRule.bind(automationController)
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(automationRuleIdParamsSchema),
  validate(updateAutomationRuleSchema),
  automationController.updateRule.bind(automationController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(automationRuleIdParamsSchema),
  automationController.deleteRule.bind(automationController)
);

router.post(
  '/:id/execute',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(automationRuleIdParamsSchema),
  automationController.executeRule.bind(automationController)
);

router.get(
  '/:id/executions',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(automationRuleIdParamsSchema),
  automationController.getExecutions.bind(automationController)
);

router.post(
  '/events/process',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  automationController.processEvent.bind(automationController)
);

export default router;
