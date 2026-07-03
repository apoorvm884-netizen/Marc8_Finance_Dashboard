export type NotificationType = 'system' | 'success' | 'warning' | 'error' | 'info';

export type ReminderType =
  | 'insurance_renewal' | 'vehicle_service_due' | 'road_tax_due' | 'permit_expiry'
  | 'fastag_low_balance' | 'pending_journal_entries' | 'pending_expenses'
  | 'pending_bookings' | 'high_expense_alert' | 'negative_profit_alert'
  | 'inactive_vehicles' | 'vehicles_without_bookings';

export type ReminderStatus = 'PENDING' | 'COMPLETED' | 'DISMISSED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  is_archived: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title_template: string;
  message_template: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  reminder_type: ReminderType;
  vehicle_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  remind_before_days: number;
  is_recurring: boolean;
  recurring_interval_days: number | null;
  last_triggered_at: string | null;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  vehicle_number?: string;
  vehicle_name?: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  reminder_days_before: number;
  daily_summary: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  insurance_renewal: 'Insurance Renewal',
  vehicle_service_due: 'Vehicle Service Due',
  road_tax_due: 'Road Tax Due',
  permit_expiry: 'Permit Expiry',
  fastag_low_balance: 'Fastag Low Balance',
  pending_journal_entries: 'Pending Journal Entries',
  pending_expenses: 'Pending Expenses',
  pending_bookings: 'Pending Bookings',
  high_expense_alert: 'High Expense Alert',
  negative_profit_alert: 'Negative Profit Alert',
  inactive_vehicles: 'Inactive Vehicles',
  vehicles_without_bookings: 'Vehicles Without Bookings',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  system: 'Settings',
  success: 'CheckCircle',
  warning: 'AlertTriangle',
  error: 'XCircle',
  info: 'Info',
};
