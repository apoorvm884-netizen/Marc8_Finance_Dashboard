import { api } from './api-client';
import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type { VehicleOwner, CreateVehicleOwnerDTO, UpdateVehicleOwnerDTO, VehicleOwnerQueryParams, OwnerDocument, CreateOwnerDocumentDTO, OwnershipHistory, AssignOwnerDTO } from '@/types/vehicle-owner';

export const vehicleOwnerService = {
  async findAll(params?: VehicleOwnerQueryParams): Promise<PaginatedResponse<VehicleOwner>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<VehicleOwner>>('/vehicle-owners', { params: queryParams });
  },

  async findById(id: string): Promise<SingleResponse<VehicleOwner>> {
    return api.get<SingleResponse<VehicleOwner>>(`/vehicle-owners/${id}`);
  },

  async create(data: CreateVehicleOwnerDTO): Promise<SingleResponse<VehicleOwner>> {
    return api.post<SingleResponse<VehicleOwner>>('/vehicle-owners', data);
  },

  async update(id: string, data: UpdateVehicleOwnerDTO): Promise<SingleResponse<VehicleOwner>> {
    return api.put<SingleResponse<VehicleOwner>>(`/vehicle-owners/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/vehicle-owners/${id}`);
  },

  async restore(id: string): Promise<SingleResponse<VehicleOwner>> {
    return api.post<SingleResponse<VehicleOwner>>(`/vehicle-owners/${id}/restore`);
  },

  async assignToVehicle(ownerId: string, data: AssignOwnerDTO): Promise<SingleResponse<VehicleOwner>> {
    return api.post<SingleResponse<VehicleOwner>>(`/vehicle-owners/${ownerId}/assign`, data);
  },

  async unassignFromVehicle(ownerId: string, data: { vehicle_id: string; notes?: string | null }): Promise<SingleResponse<VehicleOwner>> {
    return api.post<SingleResponse<VehicleOwner>>(`/vehicle-owners/${ownerId}/unassign`, data);
  },

  async getOwnerVehicles(ownerId: string): Promise<SingleResponse<{ id: string; vehicle_number: string; vehicle_name: string; status: string }[]>> {
    return api.get<SingleResponse<{ id: string; vehicle_number: string; vehicle_name: string; status: string }[]>>(`/vehicle-owners/${ownerId}/vehicles`);
  },

  async getVehicleOwner(vehicleId: string): Promise<SingleResponse<VehicleOwner | null>> {
    return api.get<SingleResponse<VehicleOwner | null>>(`/vehicle-owners/by-vehicle/${vehicleId}`);
  },

  async getOwnershipHistory(vehicleId: string): Promise<SingleResponse<OwnershipHistory[]>> {
    return api.get<SingleResponse<OwnershipHistory[]>>(`/vehicle-owners/history/${vehicleId}`);
  },

  async getDocuments(ownerId: string): Promise<SingleResponse<OwnerDocument[]>> {
    return api.get<SingleResponse<OwnerDocument[]>>(`/vehicle-owners/${ownerId}/documents`);
  },

  async addDocument(ownerId: string, data: CreateOwnerDocumentDTO): Promise<SingleResponse<OwnerDocument>> {
    return api.post<SingleResponse<OwnerDocument>>(`/vehicle-owners/${ownerId}/documents`, data);
  },

  async updateDocument(ownerId: string, docId: string, data: Partial<CreateOwnerDocumentDTO>): Promise<SingleResponse<OwnerDocument>> {
    return api.put<SingleResponse<OwnerDocument>>(`/vehicle-owners/${ownerId}/documents/${docId}`, data);
  },

  async deleteDocument(ownerId: string, docId: string): Promise<void> {
    return api.delete<void>(`/vehicle-owners/${ownerId}/documents/${docId}`);
  },
};
