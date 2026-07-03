import { api } from './api-client';
import type { SLADefinition, SLABreach } from '@/types/workflow';

export const slaService = {
  async createDefinition(data: {
    entity_type: string;
    name: string;
    from_status?: string;
    to_status: string;
    sla_hours: number;
    severity?: string;
  }) {
    return api.post<SLADefinition>('/sla/definitions', data);
  },

  async findAllDefinitions(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: SLADefinition[]; meta: { total: number; page: number; limit: number } }>('/sla/definitions', { params: queryParams });
  },

  async findDefinitionById(id: string) {
    return api.get<SLADefinition>(`/sla/definitions/${id}`);
  },

  async updateDefinition(id: string, data: Partial<SLADefinition>) {
    return api.put<SLADefinition>(`/sla/definitions/${id}`, data);
  },

  async deleteDefinition(id: string) {
    return api.delete<void>(`/sla/definitions/${id}`);
  },

  async checkBreaches() {
    return api.post<SLABreach[]>('/sla/check-breaches');
  },

  async getBreaches(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: SLABreach[]; meta: { total: number; page: number; limit: number } }>('/sla/breaches', { params: queryParams });
  },
};
