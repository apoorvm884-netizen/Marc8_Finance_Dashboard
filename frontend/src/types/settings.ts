export interface CompanyProfile {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  gst_number: string | null;
  currency: string;
  timezone: string;
  date_format: string;
  financial_year_start: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardSettings {
  id: string;
  default_dashboard: string;
  default_date_range: string;
  default_charts: Record<string, unknown>;
  widget_visibility: Record<string, unknown>;
  dashboard_layout: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FinancialSettings {
  id: string;
  default_currency: string;
  currency_symbol: string;
  decimal_precision: number;
  tax_percentage: number;
  invoice_prefix: string;
  booking_prefix: string;
  journal_prefix: string;
  expense_prefix: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  reminder_settings: boolean;
  daily_summary: boolean;
  weekly_summary: boolean;
  monthly_summary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  theme: string;
  sidebar_state: string;
  language: string;
  table_density: string;
  default_page_size: number;
  created_at: string;
  updated_at: string;
}

export interface SecuritySettings {
  id: string;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
  };
  session_timeout_minutes: number;
  two_factor_enabled: boolean;
  max_login_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface AllSettings {
  company: CompanyProfile;
  dashboard: DashboardSettings;
  financial: FinancialSettings;
  notifications: NotificationSettings;
  preferences: UserPreferences;
  security: SecuritySettings;
}
