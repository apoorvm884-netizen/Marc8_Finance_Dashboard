import { useState, useEffect, useCallback } from 'react';
import { outstandingService } from '@/services/outstanding.service';
import type { PaymentPlannerData, CashRequirementForecast, PlatformAnalyticsData } from '@/types/outstanding';

export function usePaymentPlanner(params?: {
  date_from?: string;
  date_to?: string;
  vehicle_id?: string;
}) {
  const [data, setData] = useState<PaymentPlannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await outstandingService.getPaymentPlanner(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params?.date_from, params?.date_to, params?.vehicle_id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useCashRequirementForecast() {
  const [data, setData] = useState<CashRequirementForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await outstandingService.getCashRequirementForecast();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function usePlatformAnalytics(params?: {
  date_from?: string;
  date_to?: string;
}) {
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await outstandingService.getPlatformAnalytics(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params?.date_from, params?.date_to]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
