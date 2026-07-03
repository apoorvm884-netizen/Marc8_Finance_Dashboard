import { api } from './api-client';
import type { MasterType, MasterValue, CreateMasterValueDTO, UpdateMasterValueDTO } from '@/types/master';
import type { PaginatedResponse } from '@/types/api';

export const masterService = {
  async getTypes(): Promise<MasterType[]> {
    return api.get<MasterType[]>('/masters/types');
  },

  async getValues(
    type: string,
    params?: {
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
      search?: string;
      is_active?: string;
      include_deleted?: string;
    }
  ): Promise<PaginatedResponse<MasterValue>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<MasterValue>>(`/masters/${type}`, { params: queryParams });
  },

  async getValueById(type: string, id: string): Promise<MasterValue> {
    return api.get<MasterValue>(`/masters/${type}/${id}`);
  },

  async create(type: string, data: CreateMasterValueDTO): Promise<MasterValue> {
    return api.post<MasterValue>(`/masters/${type}`, data);
  },

  async update(type: string, id: string, data: UpdateMasterValueDTO): Promise<MasterValue> {
    return api.put<MasterValue>(`/masters/${type}/${id}`, data);
  },

  async delete(type: string, id: string): Promise<void> {
    return api.delete<void>(`/masters/${type}/${id}`);
  },

  async restore(type: string, id: string): Promise<MasterValue> {
    return api.post<MasterValue>(`/masters/${type}/${id}/restore`);
  },
};
