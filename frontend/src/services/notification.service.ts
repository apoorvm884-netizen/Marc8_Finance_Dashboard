import { api } from './api-client';
import type { Notification, Reminder, NotificationTemplate, NotificationPreferences } from '@/types/notification';
import type { PaginatedResponse } from '@/types/api';

export const notificationService = {
  async findAll(params?: {
    page?: number; limit?: number; is_read?: string; type?: string; search?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<PaginatedResponse<Notification>>('/notifications', { params: queryParams });
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return api.get<{ count: number }>('/notifications/unread');
  },

  async markAsRead(id: string): Promise<Notification> {
    return api.put<Notification>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<{ count: number }> {
    return api.put<{ count: number }>('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/notifications/${id}`);
  },

  async getTemplates(): Promise<NotificationTemplate[]> {
    return api.get<NotificationTemplate[]>('/notifications/templates');
  },

  async updateTemplate(id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    return api.put<NotificationTemplate>(`/notifications/templates/${id}`, data);
  },

  async getHistory(): Promise<unknown[]> {
    return api.get<unknown[]>('/notifications/history');
  },

  async getPreferences(): Promise<NotificationPreferences> {
    return api.get<NotificationPreferences>('/notifications/preferences');
  },

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return api.put<NotificationPreferences>('/notifications/preferences', data);
  },

  async getReminders(params?: {
    page?: number; limit?: number; status?: string; reminder_type?: string;
    search?: string; vehicle_id?: string; due_date_from?: string; due_date_to?: string;
  }): Promise<PaginatedResponse<Reminder>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<PaginatedResponse<Reminder>>('/reminders', { params: queryParams });
  },

  async createReminder(data: {
    reminder_type: string; title: string; due_date: string;
    vehicle_id?: string | null; description?: string | null;
    remind_before_days?: number; is_recurring?: boolean; recurring_interval_days?: number | null;
  }): Promise<Reminder> {
    return api.post<Reminder>('/reminders', data);
  },

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder> {
    return api.put<Reminder>(`/reminders/${id}`, data);
  },

  async deleteReminder(id: string): Promise<void> {
    return api.delete<void>(`/reminders/${id}`);
  },

  async restoreReminder(id: string): Promise<Reminder> {
    return api.post<Reminder>(`/reminders/${id}/restore`);
  },

  async getUpcomingReminders(days?: number): Promise<Reminder[]> {
    return api.get<Reminder[]>('/reminders/upcoming', { params: { days: days ?? 30 } });
  },

  async getDueTodayReminders(): Promise<Reminder[]> {
    return api.get<Reminder[]>('/reminders/due-today');
  },
};
