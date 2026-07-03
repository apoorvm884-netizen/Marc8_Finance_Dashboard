import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get(
  '/combined',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  analyticsController.getCombinedAnalytics.bind(analyticsController)
);

router.get(
  '/revenue',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  analyticsController.getRevenueAnalytics.bind(analyticsController)
);

router.get(
  '/expense',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  analyticsController.getExpenseAnalytics.bind(analyticsController)
);

router.get(
  '/profit',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  analyticsController.getProfitAnalytics.bind(analyticsController)
);

router.get(
  '/vehicles',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  analyticsController.getVehiclePerformance.bind(analyticsController)
);

router.get(
  '/platforms',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  analyticsController.getPlatformComparison.bind(analyticsController)
);

router.get(
  '/expense-categories',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  analyticsController.getExpenseCategoryBreakdown.bind(analyticsController)
);

export default router;
