import { Router } from 'express';
import { intelligenceController } from '../controllers/intelligence.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateParams, validateQuery } from '../middleware/validate';
import { UserRole } from '../types';
import { intelligenceQuerySchema, alertIdParamsSchema, recommendationIdParamsSchema } from '../validators/intelligence';

const router = Router();
router.use(authenticate);

router.post(
  '/generate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  intelligenceController.generateInsights.bind(intelligenceController)
);

router.get(
  '/alerts',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(intelligenceQuerySchema),
  intelligenceController.findAllAlerts.bind(intelligenceController)
);

router.post(
  '/alerts',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  intelligenceController.createAlert.bind(intelligenceController)
);

router.post(
  '/alerts/:id/dismiss',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(alertIdParamsSchema),
  intelligenceController.dismissAlert.bind(intelligenceController)
);

router.get(
  '/recommendations',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(intelligenceQuerySchema),
  intelligenceController.findAllRecommendations.bind(intelligenceController)
);

router.post(
  '/recommendations',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  intelligenceController.createRecommendation.bind(intelligenceController)
);

router.post(
  '/recommendations/:id/action',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(recommendationIdParamsSchema),
  intelligenceController.actionRecommendation.bind(intelligenceController)
);

router.post(
  '/recommendations/:id/dismiss',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(recommendationIdParamsSchema),
  intelligenceController.dismissRecommendation.bind(intelligenceController)
);

export default router;
