import { api } from './api-client';
import type { CombinedAnalytics } from '@/types/analytics';

interface FilterParams {
  date_from?: string;
  date_to?: string;
  vehicle_id?: string;
  platform_id?: string;
  expense_category_id?: string;
  payment_mode_id?: string;
}

export const analyticsService = {
  async getCombined(filters?: FilterParams) {
    const params: Record<string, string | undefined> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    const query = Object.keys(params).length > 0 ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<CombinedAnalytics>(`/analytics/combined${query}`);
  },
};
