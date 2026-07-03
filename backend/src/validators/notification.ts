import { z } from 'zod';

const notificationTypes = ['system', 'success', 'warning', 'error', 'info'] as const;
const reminderTypes = [
  'insurance_renewal', 'vehicle_service_due', 'road_tax_due', 'permit_expiry',
  'fastag_low_balance', 'pending_journal_entries', 'pending_expenses',
  'pending_bookings', 'high_expense_alert', 'negative_profit_alert',
  'inactive_vehicles', 'vehicles_without_bookings',
] as const;
const reminderStatuses = ['PENDING', 'COMPLETED', 'DISMISSED'] as const;

export const createNotificationSchema = z.object({
  type: z.enum(notificationTypes),
  title: z.string().min(1, 'Title is required').max(255, 'Title must not exceed 255 characters'),
  message: z.string().max(5000).optional().nullable(),
  entity_type: z.string().max(50).optional().nullable(),
  entity_id: z.string().uuid().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
});

export const notificationIdParamsSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export const notificationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  is_read: z.string().optional(),
  type: z.enum(notificationTypes).optional(),
  search: z.string().optional(),
});

export const createReminderSchema = z.object({
  reminder_type: z.enum(reminderTypes),
  vehicle_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  due_date: z.string().min(1, 'Due date is required'),
  remind_before_days: z.number().int().min(0).max(365).optional().default(7),
  is_recurring: z.boolean().optional().default(false),
  recurring_interval_days: z.number().int().min(1).optional().nullable(),
  status: z.enum(reminderStatuses).optional().default('PENDING'),
});

export const updateReminderSchema = z.object({
  reminder_type: z.enum(reminderTypes).optional(),
  vehicle_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  due_date: z.string().optional(),
  remind_before_days: z.number().int().min(0).max(365).optional(),
  is_recurring: z.boolean().optional(),
  recurring_interval_days: z.number().int().min(1).optional().nullable(),
  status: z.enum(reminderStatuses).optional(),
});

export const reminderIdParamsSchema = z.object({
  id: z.string().uuid('Invalid reminder ID'),
});

export const reminderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(reminderStatuses).optional(),
  reminder_type: z.enum(reminderTypes).optional(),
  search: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
  due_date_from: z.string().optional(),
  due_date_to: z.string().optional(),
});

export const updateNotificationTemplateSchema = z.object({
  name: z.string().max(100).optional(),
  type: z.enum(notificationTypes).optional(),
  title_template: z.string().max(255).optional(),
  message_template: z.string().max(5000).optional().nullable(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export const templateIdParamsSchema = z.object({
  id: z.string().uuid('Invalid template ID'),
});

export const updateNotificationPreferencesSchema = z.object({
  in_app_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  reminder_days_before: z.number().int().min(0).max(90).optional(),
  daily_summary: z.boolean().optional(),
  weekly_summary: z.boolean().optional(),
});
