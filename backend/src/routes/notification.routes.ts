import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { UserRole } from '../types';
import {
  createReminderSchema,
  updateReminderSchema,
  reminderIdParamsSchema,
  reminderQuerySchema,
  notificationIdParamsSchema,
  notificationQuerySchema,
  updateNotificationTemplateSchema,
  templateIdParamsSchema,
  updateNotificationPreferencesSchema,
} from '../validators/notification';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(notificationQuerySchema),
  notificationController.getNotifications.bind(notificationController)
);

router.get(
  '/unread',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  notificationController.getUnreadCount.bind(notificationController)
);

router.put(
  '/read-all',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  auditLog('UPDATE', 'notifications'),
  notificationController.markAllAsRead.bind(notificationController)
);

router.put(
  '/:id/read',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validateParams(notificationIdParamsSchema),
  auditLog('UPDATE', 'notification'),
  notificationController.markAsRead.bind(notificationController)
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(notificationIdParamsSchema),
  auditLog('DELETE', 'notification'),
  notificationController.deleteNotification.bind(notificationController)
);

router.get(
  '/templates',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  notificationController.getTemplates.bind(notificationController)
);

router.put(
  '/templates/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(templateIdParamsSchema),
  validate(updateNotificationTemplateSchema),
  auditLog('UPDATE', 'notification_template'),
  notificationController.updateTemplate.bind(notificationController)
);

router.get(
  '/history',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  notificationController.getNotificationHistory.bind(notificationController)
);

router.get(
  '/preferences',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  notificationController.getNotificationPreferences.bind(notificationController)
);

router.put(
  '/preferences',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validate(updateNotificationPreferencesSchema),
  auditLog('UPDATE', 'notification_preferences'),
  notificationController.updateNotificationPreferences.bind(notificationController)
);

const reminderRouter = Router();

reminderRouter.use(authenticate);

reminderRouter.get(
  '/upcoming',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  notificationController.getUpcomingReminders.bind(notificationController)
);

reminderRouter.get(
  '/due-today',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  notificationController.getDueTodayReminders.bind(notificationController)
);

reminderRouter.post(
  '/process',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  auditLog('PROCESS', 'reminders'),
  notificationController.processReminders.bind(notificationController)
);

reminderRouter.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER),
  validateQuery(reminderQuerySchema),
  notificationController.getReminders.bind(notificationController)
);

reminderRouter.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR),
  validate(createReminderSchema),
  auditLog('CREATE', 'reminder'),
  notificationController.createReminder.bind(notificationController)
);

reminderRouter.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(reminderIdParamsSchema),
  validate(updateReminderSchema),
  auditLog('UPDATE', 'reminder'),
  notificationController.updateReminder.bind(notificationController)
);

reminderRouter.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateParams(reminderIdParamsSchema),
  auditLog('DELETE', 'reminder'),
  notificationController.deleteReminder.bind(notificationController)
);

reminderRouter.post(
  '/:id/restore',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(reminderIdParamsSchema),
  auditLog('RESTORE', 'reminder'),
  notificationController.restoreReminder.bind(notificationController)
);

export { router as notificationRoutes, reminderRouter as reminderRoutes };
