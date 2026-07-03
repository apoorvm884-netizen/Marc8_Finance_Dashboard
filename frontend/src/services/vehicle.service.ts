import { api } from './api-client';
import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type { Vehicle, CreateVehicleDTO, UpdateVehicleDTO } from '@/types/vehicle';

export const vehicleService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: string;
    search?: string;
    fuel_type?: string;
    transmission?: string;
    ownership_type?: string;
    is_active?: string;
    include_deleted?: string;
    insurance_expiring_soon?: string;
    fitness_expiring_soon?: string;
    pollution_expiring_soon?: string;
  }): Promise<PaginatedResponse<Vehicle>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<Vehicle>>('/vehicles', { params: queryParams });
  },

  async findById(id: string): Promise<SingleResponse<Vehicle>> {
    return api.get<SingleResponse<Vehicle>>(`/vehicles/${id}`);
  },

  async create(data: CreateVehicleDTO): Promise<SingleResponse<Vehicle>> {
    return api.post<SingleResponse<Vehicle>>('/vehicles', data);
  },

  async update(id: string, data: UpdateVehicleDTO): Promise<SingleResponse<Vehicle>> {
    return api.put<SingleResponse<Vehicle>>(`/vehicles/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/vehicles/${id}`);
  },

  async restore(id: string): Promise<SingleResponse<Vehicle>> {
    return api.post<SingleResponse<Vehicle>>(`/vehicles/${id}/restore`);
  },

  async duplicate(id: string): Promise<SingleResponse<Vehicle>> {
    return api.post<SingleResponse<Vehicle>>(`/vehicles/${id}/duplicate`);
  },
};
