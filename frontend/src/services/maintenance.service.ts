import { api } from './api-client';
import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type { MaintenanceRecord, CreateMaintenanceDTO, UpdateMaintenanceDTO, VehicleMaintenanceSummary, FleetHealth } from '@/types/maintenance';

export const maintenanceService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    vehicle_id?: string;
    vendor_id?: string;
    maintenance_type_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Promise<PaginatedResponse<MaintenanceRecord>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<MaintenanceRecord>>('/maintenance', { params: queryParams });
  },

  async findById(id: string): Promise<SingleResponse<MaintenanceRecord>> {
    return api.get<SingleResponse<MaintenanceRecord>>(`/maintenance/${id}`);
  },

  async create(data: CreateMaintenanceDTO): Promise<SingleResponse<MaintenanceRecord>> {
    return api.post<SingleResponse<MaintenanceRecord>>('/maintenance', data);
  },

  async update(id: string, data: UpdateMaintenanceDTO): Promise<SingleResponse<MaintenanceRecord>> {
    return api.put<SingleResponse<MaintenanceRecord>>(`/maintenance/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/maintenance/${id}`);
  },

  async restore(id: string): Promise<SingleResponse<MaintenanceRecord>> {
    return api.post<SingleResponse<MaintenanceRecord>>(`/maintenance/${id}/restore`);
  },

  async getVehicleMaintenance(vehicleId: string): Promise<SingleResponse<VehicleMaintenanceSummary>> {
    return api.get<SingleResponse<VehicleMaintenanceSummary>>(`/maintenance/vehicle/${vehicleId}`);
  },

  async getFleetHealth(): Promise<SingleResponse<FleetHealth>> {
    return api.get<SingleResponse<FleetHealth>>('/maintenance/health');
  },
};
