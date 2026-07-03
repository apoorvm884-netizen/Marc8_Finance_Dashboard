import { api } from './api-client';
import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type { PlatformAssignment, CreateAssignmentDTO, EndAssignmentDTO } from '@/types/platform-assignment';

export const platformAssignmentService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    vehicle_id?: string;
    platform_id?: string;
    status?: string;
  }): Promise<PaginatedResponse<PlatformAssignment>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<PlatformAssignment>>('/platform-assignments', { params: queryParams });
  },

  async findById(id: string): Promise<SingleResponse<PlatformAssignment>> {
    return api.get<SingleResponse<PlatformAssignment>>(`/platform-assignments/${id}`);
  },

  async create(data: CreateAssignmentDTO): Promise<SingleResponse<PlatformAssignment>> {
    return api.post<SingleResponse<PlatformAssignment>>('/platform-assignments', data);
  },

  async endAssignment(id: string, data: EndAssignmentDTO): Promise<SingleResponse<PlatformAssignment>> {
    return api.put<SingleResponse<PlatformAssignment>>(`/platform-assignments/${id}/end`, data);
  },

  async getVehicleAssignmentHistory(vehicleId: string): Promise<SingleResponse<PlatformAssignment[]>> {
    return api.get<SingleResponse<PlatformAssignment[]>>(`/platform-assignments/vehicle/${vehicleId}`);
  },
};
