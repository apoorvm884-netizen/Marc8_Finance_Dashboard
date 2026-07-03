import { api } from './api-client';
import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type {
  Settlement, CreateSettlementDTO, UpdateSettlementDTO, SettlementQueryParams,
  SettlementPayment, CreateSettlementPaymentDTO, SettlementDocument,
  SettlementDashboardMetrics, RunPipelineDTO, UpdateStatusDTO,
} from '@/types/settlement';

export const settlementService = {
  async findAll(params?: SettlementQueryParams): Promise<PaginatedResponse<Settlement>> {
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = String(value);
        }
      });
    }
    return api.get<PaginatedResponse<Settlement>>('/settlements', { params: queryParams });
  },

  async findById(id: string): Promise<SingleResponse<Settlement>> {
    return api.get<SingleResponse<Settlement>>(`/settlements/${id}`);
  },

  async create(data: CreateSettlementDTO): Promise<SingleResponse<Settlement>> {
    return api.post<SingleResponse<Settlement>>('/settlements', data);
  },

  async update(id: string, data: UpdateSettlementDTO): Promise<SingleResponse<Settlement>> {
    return api.put<SingleResponse<Settlement>>(`/settlements/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/settlements/${id}`);
  },

  async restore(id: string): Promise<SingleResponse<Settlement>> {
    return api.post<SingleResponse<Settlement>>(`/settlements/${id}/restore`);
  },

  async runPipeline(data: RunPipelineDTO): Promise<SingleResponse<Settlement>> {
    return api.post<SingleResponse<Settlement>>('/settlements/pipeline/run', data);
  },

  async updateStatus(id: string, data: UpdateStatusDTO): Promise<SingleResponse<Settlement>> {
    return api.post<SingleResponse<Settlement>>(`/settlements/${id}/status`, data);
  },

  async getPayments(settlementId: string): Promise<SingleResponse<SettlementPayment[]>> {
    return api.get<SingleResponse<SettlementPayment[]>>(`/settlements/${settlementId}/payments`);
  },

  async createPayment(settlementId: string, data: CreateSettlementPaymentDTO): Promise<SingleResponse<SettlementPayment>> {
    return api.post<SingleResponse<SettlementPayment>>(`/settlements/${settlementId}/payments`, data);
  },

  async deletePayment(settlementId: string, paymentId: string): Promise<void> {
    return api.delete<void>(`/settlements/${settlementId}/payments/${paymentId}`);
  },

  async getDocuments(settlementId: string): Promise<SingleResponse<SettlementDocument[]>> {
    return api.get<SingleResponse<SettlementDocument[]>>(`/settlements/${settlementId}/documents`);
  },

  async addDocument(settlementId: string, data: { document_name: string; file_url?: string; document_type?: string; notes?: string }): Promise<SingleResponse<SettlementDocument>> {
    return api.post<SingleResponse<SettlementDocument>>(`/settlements/${settlementId}/documents`, data);
  },

  async deleteDocument(settlementId: string, documentId: string): Promise<void> {
    return api.delete<void>(`/settlements/${settlementId}/documents/${documentId}`);
  },

  async getDashboardMetrics(): Promise<SingleResponse<SettlementDashboardMetrics>> {
    return api.get<SingleResponse<SettlementDashboardMetrics>>('/settlements/dashboard/metrics');
  },
};
