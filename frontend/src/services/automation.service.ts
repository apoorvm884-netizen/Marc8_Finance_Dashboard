import { api } from './api-client';
import type { AutomationRule, AutomationExecution, AutomationSummary } from '@/types/automation';

export const automationService = {
  async createRule(data: {
    name: string;
    description?: string;
    event_type?: string;
    conditions?: unknown[];
    actions: { type: string; config: Record<string, unknown> }[];
    schedule_config?: Record<string, unknown>;
    is_active?: boolean;
    priority?: number;
    cooldown_minutes?: number;
    max_executions?: number;
  }) {
    return api.post<AutomationRule>('/automation', data);
  },

  async findAllRules(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: AutomationRule[]; meta: { total: number; page: number; limit: number } }>('/automation', { params: queryParams });
  },

  async findRuleById(id: string) {
    return api.get<AutomationRule>(`/automation/${id}`);
  },

  async updateRule(id: string, data: Partial<AutomationRule>) {
    return api.put<AutomationRule>(`/automation/${id}`, data);
  },

  async deleteRule(id: string) {
    return api.delete<void>(`/automation/${id}`);
  },

  async executeRule(id: string, context?: { event_type?: string; entity_type?: string; entity_id?: string }) {
    return api.post<AutomationExecution>(`/automation/${id}/execute`, context || {});
  },

  async getExecutions(id: string, params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: AutomationExecution[]; meta: { total: number; page: number; limit: number } }>(`/automation/${id}/executions`, { params: queryParams });
  },

  async getSummary() {
    return api.get<AutomationSummary>('/automation/summary');
  },

  async processEvent(data: { event_type: string; entity_type?: string; entity_id?: string; metadata?: Record<string, unknown> }) {
    return api.post<AutomationExecution[]>('/automation/events/process', data);
  },
};
