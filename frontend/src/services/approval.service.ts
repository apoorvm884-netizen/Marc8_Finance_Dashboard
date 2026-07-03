import { api } from './api-client';
import type { ApprovalRequest } from '@/types/workflow';

export const approvalService = {
  async create(data: {
    entity_type: string;
    entity_id: string;
    request_type: string;
    levels: { level_number: number; required_roles?: string[]; required_users?: string[] }[];
    metadata?: Record<string, unknown>;
  }) {
    return api.post<ApprovalRequest>('/approvals', data);
  },

  async findAll(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: ApprovalRequest[]; meta: { total: number; page: number; limit: number } }>('/approvals', { params: queryParams });
  },

  async findById(id: string) {
    return api.get<ApprovalRequest>(`/approvals/${id}`);
  },

  async processLevel(id: string, data: { action: 'approved' | 'rejected'; comment?: string }) {
    return api.post<ApprovalRequest>(`/approvals/${id}/process`, data);
  },

  async getPendingForUser(userId: string) {
    return api.get<ApprovalRequest[]>(`/approvals/pending/${userId}`);
  },
};
