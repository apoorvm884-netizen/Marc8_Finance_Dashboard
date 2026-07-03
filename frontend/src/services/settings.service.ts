import { api } from './api-client';
import type { AllSettings, CompanyProfile, DashboardSettings, FinancialSettings, NotificationSettings, UserPreferences, SecuritySettings } from '@/types/settings';

export const settingsService = {
  async getAll(): Promise<AllSettings> {
    return api.get<AllSettings>('/settings');
  },

  async getCompany(): Promise<CompanyProfile> {
    return api.get<CompanyProfile>('/settings/company');
  },

  async updateCompany(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    return api.put<CompanyProfile>('/settings/company', data);
  },

  async getDashboard(): Promise<DashboardSettings> {
    return api.get<DashboardSettings>('/settings/dashboard');
  },

  async updateDashboard(data: Partial<DashboardSettings>): Promise<DashboardSettings> {
    return api.put<DashboardSettings>('/settings/dashboard', data);
  },

  async getFinancial(): Promise<FinancialSettings> {
    return api.get<FinancialSettings>('/settings/financial');
  },

  async updateFinancial(data: Partial<FinancialSettings>): Promise<FinancialSettings> {
    return api.put<FinancialSettings>('/settings/financial', data);
  },

  async getNotifications(): Promise<NotificationSettings> {
    return api.get<NotificationSettings>('/settings/notifications');
  },

  async updateNotifications(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    return api.put<NotificationSettings>('/settings/notifications', data);
  },

  async getPreferences(): Promise<UserPreferences> {
    return api.get<UserPreferences>('/settings/preferences');
  },

  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    return api.put<UserPreferences>('/settings/preferences', data);
  },

  async getSecurity(): Promise<SecuritySettings> {
    return api.get<SecuritySettings>('/settings/security');
  },

  async updateSecurity(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
    return api.put<SecuritySettings>('/settings/security', data);
  },
};
