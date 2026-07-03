import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { notificationService } from '../services/notification.service';
import { reminderService } from '../services/reminder.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await notificationService.findAll(query, req.user?.userId);
      sendPaginated(res, result.data, result.meta, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user?.userId);
      sendSuccess(res, { count }, 'Unread count retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const notification = await notificationService.markAsRead(id);
      await notificationService.logHistory({ notification_id: id, user_id: req.user?.userId, action: 'read' });
      sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.markAllAsRead(req.user?.userId);
      await notificationService.logHistory({ user_id: req.user?.userId, action: 'read_all' });
      sendSuccess(res, { count }, `All ${count} notifications marked as read`);
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await notificationService.delete(id, req.user?.userId);
      await notificationService.logHistory({ notification_id: id, user_id: req.user?.userId, action: 'deleted' });
      sendSuccess(res, null, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }

  async getTemplates(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const templates = await notificationService.getTemplates();
      sendSuccess(res, templates, 'Templates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const template = await notificationService.updateTemplate(id, req.body);
      sendSuccess(res, template, 'Template updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getReminders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await reminderService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Reminders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createReminder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reminder = await reminderService.create(req.body, req.user?.userId);
      sendSuccess(res, reminder, 'Reminder created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateReminder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const reminder = await reminderService.update(id, req.body, req.user?.userId);
      sendSuccess(res, reminder, 'Reminder updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteReminder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await reminderService.delete(id);
      sendSuccess(res, null, 'Reminder deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreReminder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const reminder = await reminderService.restore(id, req.user?.userId);
      sendSuccess(res, reminder, 'Reminder restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingReminders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = Number(req.query.days) || 30;
      const reminders = await reminderService.getUpcoming(days);
      sendSuccess(res, reminders, 'Upcoming reminders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDueTodayReminders(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reminders = await reminderService.getDueToday();
      sendSuccess(res, reminders, 'Due today reminders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async processReminders(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await reminderService.processDueReminders();
      sendSuccess(res, { notifications_created: count }, `Processed ${count} due reminders`);
    } catch (error) {
      next(error);
    }
  }

  async getNotificationHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const history = await notificationService.getHistory(req.user?.userId);
      sendSuccess(res, history, 'Notification history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getNotificationPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationService.getPreferencesByUser(req.user!.userId);
      sendSuccess(res, prefs, 'Preferences retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateNotificationPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationService.updatePreferences(req.user!.userId, req.body);
      sendSuccess(res, prefs, 'Preferences updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
