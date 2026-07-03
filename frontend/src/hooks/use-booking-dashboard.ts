import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '@/services/booking.service';
import type { BookingDashboardMetrics } from '@/types/booking';

interface UseBookingDashboardReturn {
  metrics: BookingDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBookingDashboard(): UseBookingDashboardReturn {
  const [metrics, setMetrics] = useState<BookingDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard metrics';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refresh: fetchMetrics };
}
