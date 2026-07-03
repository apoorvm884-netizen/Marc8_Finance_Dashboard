import { Router } from 'express';
import { escalationController } from '../controllers/escalation.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { UserRole } from '../types';
import { createEscalationRuleSchema, updateEscalationRuleSchema, escalationRuleIdParamsSchema, escalationQuerySchema } from '../validators/escalation';

const router = Router();
router.use(authenticate);

router.get(
  '/rules',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateQuery(escalationQuerySchema),
  escalationController.findAllRules.bind(escalationController)
);

router.get(
  '/rules/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(escalationRuleIdParamsSchema),
  escalationController.findRuleById.bind(escalationController)
);

router.post(
  '/rules',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(createEscalationRuleSchema),
  escalationController.createRule.bind(escalationController)
);

router.put(
  '/rules/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(escalationRuleIdParamsSchema),
  validate(updateEscalationRuleSchema),
  escalationController.updateRule.bind(escalationController)
);

router.delete(
  '/rules/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(escalationRuleIdParamsSchema),
  escalationController.deleteRule.bind(escalationController)
);

router.post(
  '/trigger/:breachId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  escalationController.triggerEscalation.bind(escalationController)
);

export default router;
