import { api } from './api-client';
import type { WorkflowDefinition, WorkflowInstance, WorkflowLog } from '@/types/workflow';

export const workflowService = {
  async createDefinition(data: { entity_type: string; name: string; states: unknown[]; transitions: unknown[] }) {
    return api.post<WorkflowDefinition>('/workflows/definitions', data);
  },

  async findAllDefinitions(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: WorkflowDefinition[]; meta: { total: number; page: number; limit: number } }>('/workflows/definitions', { params: queryParams });
  },

  async findDefinitionById(id: string) {
    return api.get<WorkflowDefinition>(`/workflows/definitions/${id}`);
  },

  async updateDefinition(id: string, data: Partial<{ name: string; states: unknown[]; transitions: unknown[]; is_active: boolean }>) {
    return api.put<WorkflowDefinition>(`/workflows/definitions/${id}`, data);
  },

  async deleteDefinition(id: string) {
    return api.delete<void>(`/workflows/definitions/${id}`);
  },

  async transition(entityType: string, entityId: string, data: { action: string; comment?: string; metadata?: Record<string, unknown> }) {
    return api.post<{ instance: WorkflowInstance; log: WorkflowLog }>(`/workflows/transition/${entityType}/${entityId}`, data);
  },

  async getInstanceHistory(entityType: string, entityId: string) {
    return api.get<WorkflowLog[]>(`/workflows/history/${entityType}/${entityId}`);
  },

  async getActiveInstances(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: WorkflowInstance[]; meta: { total: number; page: number; limit: number } }>('/workflows/instances', { params: queryParams });
  },
};
