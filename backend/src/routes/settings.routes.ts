import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  updateCompanyProfileSchema,
  updateDashboardSettingsSchema,
  updateFinancialSettingsSchema,
  updateNotificationSettingsSchema,
  updateUserPreferencesSchema,
  updateSecuritySettingsSchema,
} from '../validators/settings';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settingsController.getAll.bind(settingsController)
);

router.get(
  '/company',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settingsController.getCompany.bind(settingsController)
);

router.put(
  '/company',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateCompanyProfileSchema),
  auditLog('UPDATE', 'settings_company'),
  settingsController.updateCompany.bind(settingsController)
);

router.get(
  '/dashboard',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settingsController.getDashboard.bind(settingsController)
);

router.put(
  '/dashboard',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateDashboardSettingsSchema),
  auditLog('UPDATE', 'settings_dashboard'),
  settingsController.updateDashboard.bind(settingsController)
);

router.get(
  '/financial',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settingsController.getFinancial.bind(settingsController)
);

router.put(
  '/financial',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateFinancialSettingsSchema),
  auditLog('UPDATE', 'settings_financial'),
  settingsController.updateFinancial.bind(settingsController)
);

router.get(
  '/notifications',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settingsController.getNotifications.bind(settingsController)
);

router.put(
  '/notifications',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateNotificationSettingsSchema),
  auditLog('UPDATE', 'settings_notifications'),
  settingsController.updateNotifications.bind(settingsController)
);

router.get(
  '/preferences',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settingsController.getPreferences.bind(settingsController)
);

router.put(
  '/preferences',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateUserPreferencesSchema),
  auditLog('UPDATE', 'settings_preferences'),
  settingsController.updatePreferences.bind(settingsController)
);

router.get(
  '/security',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  settingsController.getSecurity.bind(settingsController)
);

router.put(
  '/security',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateSecuritySettingsSchema),
  auditLog('UPDATE', 'settings_security'),
  settingsController.updateSecurity.bind(settingsController)
);

export default router;
