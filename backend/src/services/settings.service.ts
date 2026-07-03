import { getDatabase } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import type {
  CompanyProfile,
  DashboardSettings,
  FinancialSettings,
  NotificationSettings,
  UserPreferences,
  SecuritySettings,
  AllSettings,
  UpdateCompanyProfileDTO,
  UpdateDashboardSettingsDTO,
  UpdateFinancialSettingsDTO,
  UpdateNotificationSettingsDTO,
  UpdateUserPreferencesDTO,
  UpdateSecuritySettingsDTO,
} from '../types';

const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SettingsService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
  }

  private invalidateCache(group: string): void {
    this.cache.delete(`settings:${group}`);
    this.cache.delete('settings:all');
  }

  private async ensureRow(table: string): Promise<string> {
    const db = getDatabase();
    const [existing] = await db(table).select('id').limit(1);
    if (existing) return existing.id;
    const [inserted] = await db(table).insert({}).returning('id');
    return inserted.id;
  }

  async getAll(): Promise<AllSettings> {
    const cached = this.getCached<AllSettings>('settings:all');
    if (cached) return cached;

    const db = getDatabase();
    const [company] = await db('company_profile').limit(1);
    const [dashboard] = await db('dashboard_settings').limit(1);
    const [financial] = await db('financial_settings').limit(1);
    const [notifications] = await db('notification_settings').limit(1);
    const [preferences] = await db('user_preferences').limit(1);
    const [security] = await db('security_settings').limit(1);

    const result: AllSettings = {
      company: company ?? { id: '', company_name: null, logo_url: null, address: null, phone: null, email: null, gst_number: null, currency: 'INR', timezone: 'Asia/Kolkata', date_format: 'DD/MM/YYYY', financial_year_start: '01-04', created_at: '', updated_at: '' },
      dashboard: dashboard ?? { id: '', default_dashboard: 'executive', default_date_range: 'last_30_days', default_charts: {}, widget_visibility: {}, dashboard_layout: {}, created_at: '', updated_at: '' },
      financial: financial ?? { id: '', default_currency: 'INR', currency_symbol: '₹', decimal_precision: 2, tax_percentage: 18, invoice_prefix: 'INV-', booking_prefix: 'BKG-', journal_prefix: 'JRN-', expense_prefix: 'EXP-', created_at: '', updated_at: '' },
      notifications: notifications ?? { id: '', email_notifications: true, browser_notifications: true, reminder_settings: true, daily_summary: false, weekly_summary: false, monthly_summary: false, created_at: '', updated_at: '' },
      preferences: preferences ?? { id: '', theme: 'dark', sidebar_state: 'expanded', language: 'en', table_density: 'comfortable', default_page_size: 10, created_at: '', updated_at: '' },
      security: security ?? { id: '', password_policy: {}, session_timeout_minutes: 60, two_factor_enabled: false, max_login_attempts: 5, created_at: '', updated_at: '' },
    };

    this.setCache('settings:all', result);
    return result;
  }

  async getCompany(): Promise<CompanyProfile> {
    const cached = this.getCached<CompanyProfile>('settings:company');
    if (cached) return cached;
    await this.ensureRow('company_profile');
    const db = getDatabase();
    const [settings] = await db('company_profile').limit(1);
    if (!settings) throw new NotFoundError('Company profile not found');
    this.setCache('settings:company', settings);
    return settings;
  }

  async getDashboard(): Promise<DashboardSettings> {
    const cached = this.getCached<DashboardSettings>('settings:dashboard');
    if (cached) return cached;
    await this.ensureRow('dashboard_settings');
    const db = getDatabase();
    const [settings] = await db('dashboard_settings').limit(1);
    if (!settings) throw new NotFoundError('Dashboard settings not found');
    this.setCache('settings:dashboard', settings);
    return settings;
  }

  async getFinancial(): Promise<FinancialSettings> {
    const cached = this.getCached<FinancialSettings>('settings:financial');
    if (cached) return cached;
    await this.ensureRow('financial_settings');
    const db = getDatabase();
    const [settings] = await db('financial_settings').limit(1);
    if (!settings) throw new NotFoundError('Financial settings not found');
    this.setCache('settings:financial', settings);
    return settings;
  }

  async getNotifications(): Promise<NotificationSettings> {
    const cached = this.getCached<NotificationSettings>('settings:notifications');
    if (cached) return cached;
    await this.ensureRow('notification_settings');
    const db = getDatabase();
    const [settings] = await db('notification_settings').limit(1);
    if (!settings) throw new NotFoundError('Notification settings not found');
    this.setCache('settings:notifications', settings);
    return settings;
  }

  async getPreferences(): Promise<UserPreferences> {
    const cached = this.getCached<UserPreferences>('settings:preferences');
    if (cached) return cached;
    await this.ensureRow('user_preferences');
    const db = getDatabase();
    const [settings] = await db('user_preferences').limit(1);
    if (!settings) throw new NotFoundError('User preferences not found');
    this.setCache('settings:preferences', settings);
    return settings;
  }

  async getSecurity(): Promise<SecuritySettings> {
    const cached = this.getCached<SecuritySettings>('settings:security');
    if (cached) return cached;
    await this.ensureRow('security_settings');
    const db = getDatabase();
    const [settings] = await db('security_settings').limit(1);
    if (!settings) throw new NotFoundError('Security settings not found');
    this.setCache('settings:security', settings);
    return settings;
  }

  async updateCompany(data: UpdateCompanyProfileDTO, updatedBy?: string): Promise<CompanyProfile> {
    const db = getDatabase();
    const id = await this.ensureRow('company_profile');
    const [old] = await db('company_profile').where({ id });
    const [updated] = await db('company_profile').where({ id }).update({ ...data, updated_at: db.fn.now() }).returning('*');
    this.invalidateCache('company');
    logger.info(`Company profile updated by user ${updatedBy}`, { old, new: updated });
    return updated;
  }

  async updateDashboard(data: UpdateDashboardSettingsDTO, updatedBy?: string): Promise<DashboardSettings> {
    const db = getDatabase();
    const id = await this.ensureRow('dashboard_settings');
    const [old] = await db('dashboard_settings').where({ id });
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.default_dashboard !== undefined) updateData.default_dashboard = data.default_dashboard;
    if (data.default_date_range !== undefined) updateData.default_date_range = data.default_date_range;
    if (data.default_charts !== undefined) updateData.default_charts = JSON.stringify(data.default_charts);
    if (data.widget_visibility !== undefined) updateData.widget_visibility = JSON.stringify(data.widget_visibility);
    if (data.dashboard_layout !== undefined) updateData.dashboard_layout = JSON.stringify(data.dashboard_layout);
    const [updated] = await db('dashboard_settings').where({ id }).update(updateData).returning('*');
    this.invalidateCache('dashboard');
    logger.info(`Dashboard settings updated by user ${updatedBy}`, { old, new: updated });
    return updated;
  }

  async updateFinancial(data: UpdateFinancialSettingsDTO, updatedBy?: string): Promise<FinancialSettings> {
    const db = getDatabase();
    const id = await this.ensureRow('financial_settings');
    const [old] = await db('financial_settings').where({ id });
    const [updated] = await db('financial_settings').where({ id }).update({ ...data, updated_at: db.fn.now() }).returning('*');
    this.invalidateCache('financial');
    logger.info(`Financial settings updated by user ${updatedBy}`, { old, new: updated });
    return updated;
  }

  async updateNotifications(data: UpdateNotificationSettingsDTO, updatedBy?: string): Promise<NotificationSettings> {
    const db = getDatabase();
    const id = await this.ensureRow('notification_settings');
    const [old] = await db('notification_settings').where({ id });
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.email_notifications !== undefined) updateData.email_notifications = data.email_notifications;
    if (data.browser_notifications !== undefined) updateData.browser_notifications = data.browser_notifications;
    if (data.reminder_settings !== undefined) updateData.reminder_settings = data.reminder_settings;
    if (data.daily_summary !== undefined) updateData.daily_summary = data.daily_summary;
    if (data.weekly_summary !== undefined) updateData.weekly_summary = data.weekly_summary;
    if (data.monthly_summary !== undefined) updateData.monthly_summary = data.monthly_summary;
    const [updated] = await db('notification_settings').where({ id }).update(updateData).returning('*');
    this.invalidateCache('notifications');
    logger.info(`Notification settings updated by user ${updatedBy}`, { old, new: updated });
    return updated;
  }

  async updatePreferences(data: UpdateUserPreferencesDTO, updatedBy?: string): Promise<UserPreferences> {
    const db = getDatabase();
    const id = await this.ensureRow('user_preferences');
    const [old] = await db('user_preferences').where({ id });
    const [updated] = await db('user_preferences').where({ id }).update({ ...data, updated_at: db.fn.now() }).returning('*');
    this.invalidateCache('preferences');
    logger.info(`User preferences updated by user ${updatedBy}`, { old, new: updated });
    return updated;
  }

  async updateSecurity(data: UpdateSecuritySettingsDTO, updatedBy?: string): Promise<SecuritySettings> {
    const db = getDatabase();
    const id = await this.ensureRow('security_settings');
    const [old] = await db('security_settings').where({ id });
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.password_policy !== undefined) updateData.password_policy = JSON.stringify(data.password_policy);
    if (data.session_timeout_minutes !== undefined) updateData.session_timeout_minutes = data.session_timeout_minutes;
    if (data.two_factor_enabled !== undefined) updateData.two_factor_enabled = data.two_factor_enabled;
    if (data.max_login_attempts !== undefined) updateData.max_login_attempts = data.max_login_attempts;
    const [updated] = await db('security_settings').where({ id }).update(updateData).returning('*');
    this.invalidateCache('security');
    logger.info(`Security settings updated by user ${updatedBy}`, { old, new: updated });
    return updated;
  }
}

export const settingsService = new SettingsService();
