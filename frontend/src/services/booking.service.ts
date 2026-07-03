import { api } from './api-client';
import type { Booking, CreateBookingDTO, UpdateBookingDTO, BookingDashboardMetrics } from '@/types/booking';
import type { PaginatedResponse } from '@/types/api';

export const bookingService = {
  async findAll(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: string;
    payment_status?: string;
    search?: string;
    vehicle_id?: string;
    platform_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }
    return api.get<PaginatedResponse<Booking>>('/bookings', { params: queryParams });
  },

  async findById(id: string): Promise<Booking> {
    return api.get<Booking>(`/bookings/${id}`);
  },

  async create(data: CreateBookingDTO): Promise<Booking> {
    return api.post<Booking>('/bookings', data);
  },

  async update(id: string, data: UpdateBookingDTO): Promise<Booking> {
    return api.put<Booking>(`/bookings/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/bookings/${id}`);
  },

  async restore(id: string): Promise<Booking> {
    return api.post<Booking>(`/bookings/${id}/restore`);
  },

  async duplicate(id: string): Promise<Booking> {
    return api.post<Booking>(`/bookings/${id}/duplicate`);
  },

  async getDashboardMetrics(): Promise<BookingDashboardMetrics> {
    return api.get<BookingDashboardMetrics>('/bookings/metrics');
  },
};
