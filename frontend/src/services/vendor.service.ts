import { api } from './api-client';
import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type { Vendor, CreateVendorDTO, UpdateVendorDTO } from '@/types/vendor';

export const vendorService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    vendor_type_id?: string;
    is_active?: string;
  }): Promise<PaginatedResponse<Vendor>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<Vendor>>('/vendors', { params: queryParams });
  },

  async findById(id: string): Promise<SingleResponse<Vendor>> {
    return api.get<SingleResponse<Vendor>>(`/vendors/${id}`);
  },

  async create(data: CreateVendorDTO): Promise<SingleResponse<Vendor>> {
    return api.post<SingleResponse<Vendor>>('/vendors', data);
  },

  async update(id: string, data: UpdateVendorDTO): Promise<SingleResponse<Vendor>> {
    return api.put<SingleResponse<Vendor>>(`/vendors/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/vendors/${id}`);
  },

  async restore(id: string): Promise<SingleResponse<Vendor>> {
    return api.post<SingleResponse<Vendor>>(`/vendors/${id}/restore`);
  },
};
