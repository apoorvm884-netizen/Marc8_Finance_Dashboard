import { api } from './api-client';
import type { BusinessAlert, Recommendation } from '@/types/automation';

export const intelligenceService = {
  async generateInsights() {
    return api.post<{ alerts_created: number; recommendations_created: number }>('/intelligence/generate');
  },

  async findAllAlerts(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: BusinessAlert[]; meta: { total: number; page: number; limit: number } }>('/intelligence/alerts', { params: queryParams });
  },

  async createAlert(data: {
    alert_type: string;
    title: string;
    description?: string;
    severity?: string;
    entity_type?: string;
    entity_id?: string;
  }) {
    return api.post<BusinessAlert>('/intelligence/alerts', data);
  },

  async dismissAlert(id: string) {
    return api.post<BusinessAlert>(`/intelligence/alerts/${id}/dismiss`);
  },

  async findAllRecommendations(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: Recommendation[]; meta: { total: number; page: number; limit: number } }>('/intelligence/recommendations', { params: queryParams });
  },

  async createRecommendation(data: {
    recommendation_type: string;
    title: string;
    description?: string;
    priority?: string;
    entity_type?: string;
    entity_id?: string;
    supporting_data?: Record<string, unknown>;
  }) {
    return api.post<Recommendation>('/intelligence/recommendations', data);
  },

  async actionRecommendation(id: string) {
    return api.post<Recommendation>(`/intelligence/recommendations/${id}/action`);
  },

  async dismissRecommendation(id: string) {
    return api.post<Recommendation>(`/intelligence/recommendations/${id}/dismiss`);
  },
};
