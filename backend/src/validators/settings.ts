import { z } from 'zod';

export const updateCompanyProfileSchema = z.object({
  company_name: z.string().max(255, 'Company name must not exceed 255 characters').optional().nullable(),
  logo_url: z.string().max(500, 'Logo URL must not exceed 500 characters').optional().nullable(),
  address: z.string().max(5000, 'Address must not exceed 5000 characters').optional().nullable(),
  phone: z.string().max(50, 'Phone must not exceed 50 characters').optional().nullable(),
  email: z.string().email('Invalid email').max(255, 'Email must not exceed 255 characters').optional().nullable(),
  gst_number: z.string().max(50, 'GST number must not exceed 50 characters').optional().nullable(),
  currency: z.string().max(10, 'Currency must not exceed 10 characters').optional(),
  timezone: z.string().max(100, 'Timezone must not exceed 100 characters').optional(),
  date_format: z.string().max(20, 'Date format must not exceed 20 characters').optional(),
  financial_year_start: z.string().max(10, 'Financial year start must not exceed 10 characters').optional(),
});

export const updateDashboardSettingsSchema = z.object({
  default_dashboard: z.string().max(50).optional(),
  default_date_range: z.string().max(50).optional(),
  default_charts: z.record(z.unknown()).optional(),
  widget_visibility: z.record(z.unknown()).optional(),
  dashboard_layout: z.record(z.unknown()).optional(),
});

export const updateFinancialSettingsSchema = z.object({
  default_currency: z.string().max(10).optional(),
  currency_symbol: z.string().max(10).optional(),
  decimal_precision: z.number().int().min(0).max(10).optional(),
  tax_percentage: z.number().min(0).max(100).optional(),
  invoice_prefix: z.string().max(20).optional(),
  booking_prefix: z.string().max(20).optional(),
  journal_prefix: z.string().max(20).optional(),
  expense_prefix: z.string().max(20).optional(),
});

export const updateNotificationSettingsSchema = z.object({
  email_notifications: z.boolean().optional(),
  browser_notifications: z.boolean().optional(),
  reminder_settings: z.boolean().optional(),
  daily_summary: z.boolean().optional(),
  weekly_summary: z.boolean().optional(),
  monthly_summary: z.boolean().optional(),
});

export const updateUserPreferencesSchema = z.object({
  theme: z.string().max(20).optional(),
  sidebar_state: z.string().max(20).optional(),
  language: z.string().max(10).optional(),
  table_density: z.string().max(20).optional(),
  default_page_size: z.number().int().min(5).max(100).optional(),
});

export const updateSecuritySettingsSchema = z.object({
  password_policy: z.record(z.unknown()).optional(),
  session_timeout_minutes: z.number().int().min(1).max(1440).optional(),
  two_factor_enabled: z.boolean().optional(),
  max_login_attempts: z.number().int().min(1).max(100).optional(),
});
