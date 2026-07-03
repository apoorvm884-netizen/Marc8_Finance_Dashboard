import { api } from './api-client';
import type { ActivityLogEntry } from '@/types/workflow';

export const activityService = {
  async findAll(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: ActivityLogEntry[]; meta: { total: number; page: number; limit: number } }>('/activity', { params: queryParams });
  },

  async findByEntity(entityType: string, entityId: string, params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: ActivityLogEntry[]; meta: { total: number; page: number; limit: number } }>(`/activity/${entityType}/${entityId}`, { params: queryParams });
  },
};
