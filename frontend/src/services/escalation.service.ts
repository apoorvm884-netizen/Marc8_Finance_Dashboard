import { api } from './api-client';
import type { EscalationRule } from '@/types/workflow';

export const escalationService = {
  async createRule(data: {
    sla_definition_id?: string;
    entity_type: string;
    name: string;
    trigger_after_minutes: number;
    escalate_to_role?: string;
    escalate_to_user?: string;
    notify?: boolean;
  }) {
    return api.post<EscalationRule>('/escalations/rules', data);
  },

  async findAllRules(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: EscalationRule[]; meta: { total: number; page: number; limit: number } }>('/escalations/rules', { params: queryParams });
  },

  async findRuleById(id: string) {
    return api.get<EscalationRule>(`/escalations/rules/${id}`);
  },

  async updateRule(id: string, data: Partial<EscalationRule>) {
    return api.put<EscalationRule>(`/escalations/rules/${id}`, data);
  },

  async deleteRule(id: string) {
    return api.delete<void>(`/escalations/rules/${id}`);
  },

  async triggerEscalation(breachId: string) {
    return api.post<void>(`/escalations/trigger/${breachId}`);
  },
};
