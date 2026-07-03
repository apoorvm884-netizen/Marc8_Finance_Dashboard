import { api } from './api-client';
import type { Outstanding, CreateOutstandingDTO, UpdateOutstandingDTO, MarkAsPaidDTO, PaymentPlannerData, CashRequirementForecast, VehicleFinancialIntelligence, PlatformAnalyticsData } from '@/types/outstanding';
import type { PaginatedResponse } from '@/types/api';

export const outstandingService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: string;
    priority?: string;
    search?: string;
    vehicle_id?: string;
    platform_id?: string;
    outstanding_category_id?: string;
    due_date_from?: string;
    due_date_to?: string;
  }): Promise<PaginatedResponse<Outstanding>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<Outstanding>>('/outstandings', { params: queryParams });
  },

  async findById(id: string): Promise<Outstanding> {
    return api.get<Outstanding>(`/outstandings/${id}`);
  },

  async create(data: CreateOutstandingDTO): Promise<Outstanding> {
    return api.post<Outstanding>('/outstandings', data);
  },

  async update(id: string, data: UpdateOutstandingDTO): Promise<Outstanding> {
    return api.put<Outstanding>(`/outstandings/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/outstandings/${id}`);
  },

  async restore(id: string): Promise<Outstanding> {
    return api.post<Outstanding>(`/outstandings/${id}/restore`);
  },

  async markAsPaid(id: string, data: MarkAsPaidDTO): Promise<Outstanding> {
    return api.post<Outstanding>(`/outstandings/${id}/mark-as-paid`, data);
  },

  async getPaymentPlanner(params?: {
    date_from?: string;
    date_to?: string;
    vehicle_id?: string;
  }): Promise<PaymentPlannerData> {
    const queryParams: Record<string, string | undefined> = {};
    if (params) {
      if (params.date_from) queryParams.date_from = params.date_from;
      if (params.date_to) queryParams.date_to = params.date_to;
      if (params.vehicle_id) queryParams.vehicle_id = params.vehicle_id;
    }
    return api.get<PaymentPlannerData>('/outstandings/payment-planner', { params: queryParams });
  },

  async getCashRequirementForecast(): Promise<CashRequirementForecast> {
    return api.get<CashRequirementForecast>('/outstandings/cash-requirement');
  },

  async getVehicleFinancialIntelligence(vehicleId: string): Promise<VehicleFinancialIntelligence> {
    return api.get<VehicleFinancialIntelligence>(`/outstandings/vehicle/${vehicleId}/financials`);
  },

  async getPlatformAnalytics(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<PlatformAnalyticsData> {
    const queryParams: Record<string, string | undefined> = {};
    if (params) {
      if (params.date_from) queryParams.date_from = params.date_from;
      if (params.date_to) queryParams.date_to = params.date_to;
    }
    return api.get<PlatformAnalyticsData>('/outstandings/platform-analytics', { params: queryParams });
  },
};
