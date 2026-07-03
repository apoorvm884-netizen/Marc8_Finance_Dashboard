import { api } from './api-client';
import type { Expense, CreateExpenseDTO, UpdateExpenseDTO } from '@/types/expense';
import type { PaginatedResponse } from '@/types/api';

export const expenseService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: string;
    search?: string;
    vehicle_id?: string;
    expense_category_id?: string;
    payment_mode_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Expense>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<Expense>>('/expenses', { params: queryParams });
  },

  async findById(id: string): Promise<Expense> {
    return api.get<Expense>(`/expenses/${id}`);
  },

  async create(data: CreateExpenseDTO): Promise<Expense> {
    return api.post<Expense>('/expenses', data);
  },

  async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    return api.put<Expense>(`/expenses/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/expenses/${id}`);
  },

  async restore(id: string): Promise<Expense> {
    return api.post<Expense>(`/expenses/${id}/restore`);
  },

  async duplicate(id: string): Promise<Expense> {
    return api.post<Expense>(`/expenses/${id}/duplicate`);
  },
};
