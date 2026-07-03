import { api } from './api-client';
import type { ScheduledJob, ScheduledJobExecution } from '@/types/automation';

export const jobSchedulerService = {
  async create(data: {
    name: string;
    automation_rule_id?: string;
    job_type: string;
    schedule_type: string;
    cron_expression?: string;
    schedule_config?: Record<string, unknown>;
    is_active?: boolean;
    retry_on_failure?: boolean;
    max_retries?: number;
  }) {
    return api.post<ScheduledJob>('/scheduler', data);
  },

  async findAll(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: ScheduledJob[]; meta: { total: number; page: number; limit: number } }>('/scheduler', { params: queryParams });
  },

  async findById(id: string) {
    return api.get<ScheduledJob>(`/scheduler/${id}`);
  },

  async update(id: string, data: Partial<ScheduledJob>) {
    return api.put<ScheduledJob>(`/scheduler/${id}`, data);
  },

  async delete(id: string) {
    return api.delete<void>(`/scheduler/${id}`);
  },

  async execute(id: string) {
    return api.post<ScheduledJobExecution>(`/scheduler/${id}/execute`);
  },

  async getDueJobs() {
    return api.get<ScheduledJob[]>('/scheduler/due');
  },

  async getExecutions(id: string, params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: ScheduledJobExecution[]; meta: { total: number; page: number; limit: number } }>(`/scheduler/${id}/executions`, { params: queryParams });
  },
};
