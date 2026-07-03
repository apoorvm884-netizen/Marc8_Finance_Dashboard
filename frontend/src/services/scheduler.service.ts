import { api } from './api-client';
import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type { ServiceSchedule, CreateScheduleDTO, UpdateScheduleDTO, UpcomingServicesResult } from '@/types/scheduler';

export const schedulerService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    vehicle_id?: string;
    status?: string;
  }): Promise<PaginatedResponse<ServiceSchedule>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<ServiceSchedule>>('/service-schedules', { params: queryParams });
  },

  async findById(id: string): Promise<SingleResponse<ServiceSchedule>> {
    return api.get<SingleResponse<ServiceSchedule>>(`/service-schedules/${id}`);
  },

  async create(data: CreateScheduleDTO): Promise<SingleResponse<ServiceSchedule>> {
    return api.post<SingleResponse<ServiceSchedule>>('/service-schedules', data);
  },

  async update(id: string, data: UpdateScheduleDTO): Promise<SingleResponse<ServiceSchedule>> {
    return api.put<SingleResponse<ServiceSchedule>>(`/service-schedules/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/service-schedules/${id}`);
  },

  async getUpcomingServices(): Promise<SingleResponse<UpcomingServicesResult>> {
    return api.get<SingleResponse<UpcomingServicesResult>>('/service-schedules/upcoming');
  },
};
