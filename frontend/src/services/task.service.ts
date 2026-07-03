import { api } from './api-client';
import type { Task, TaskComment, TaskSummary } from '@/types/workflow';

export const taskService = {
  async create(data: {
    entity_type?: string;
    entity_id?: string;
    title: string;
    description?: string;
    assigned_to?: string;
    priority?: string;
    due_at?: string;
    metadata?: Record<string, unknown>;
  }) {
    return api.post<Task>('/tasks', data);
  },

  async findAll(params?: Record<string, string | undefined>) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams[key] = value;
      });
    }
    return api.get<{ data: Task[]; meta: { total: number; page: number; limit: number } }>('/tasks', { params: queryParams });
  },

  async findById(id: string) {
    return api.get<Task>(`/tasks/${id}`);
  },

  async update(id: string, data: Partial<{
    title: string;
    description: string;
    assigned_to: string | null;
    priority: string;
    status: string;
    due_at: string | null;
    metadata: Record<string, unknown>;
  }>) {
    return api.put<Task>(`/tasks/${id}`, data);
  },

  async delete(id: string) {
    return api.delete<void>(`/tasks/${id}`);
  },

  async addComment(taskId: string, data: { comment: string }) {
    return api.post<TaskComment>(`/tasks/${taskId}/comments`, data);
  },

  async getComments(taskId: string) {
    return api.get<TaskComment[]>(`/tasks/${taskId}/comments`);
  },

  async getSummary() {
    return api.get<TaskSummary>('/tasks/summary');
  },
};
