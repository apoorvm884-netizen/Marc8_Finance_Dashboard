import { api } from './api-client';
import type { JournalEntry, CreateJournalEntryDTO, UpdateJournalEntryDTO, JournalMetrics } from '@/types/journal';
import type { PaginatedResponse } from '@/types/api';

export const journalService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: string;
    search?: string;
    vehicle_id?: string;
    ledger_category_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<JournalEntry>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<JournalEntry>>('/journal', { params: queryParams });
  },

  async findById(id: string): Promise<JournalEntry> {
    return api.get<JournalEntry>(`/journal/${id}`);
  },

  async create(data: CreateJournalEntryDTO): Promise<JournalEntry> {
    return api.post<JournalEntry>('/journal', data);
  },

  async update(id: string, data: UpdateJournalEntryDTO): Promise<JournalEntry> {
    return api.put<JournalEntry>(`/journal/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/journal/${id}`);
  },

  async restore(id: string): Promise<JournalEntry> {
    return api.post<JournalEntry>(`/journal/${id}/restore`);
  },

  async duplicate(id: string): Promise<JournalEntry> {
    return api.post<JournalEntry>(`/journal/${id}/duplicate`);
  },

  async getMetrics(): Promise<JournalMetrics> {
    return api.get<JournalMetrics>('/journal/metrics');
  },
};
