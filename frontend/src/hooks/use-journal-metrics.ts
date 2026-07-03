import { useState, useEffect, useCallback } from 'react';
import { journalService } from '@/services/journal.service';
import type { JournalMetrics } from '@/types/journal';

interface UseJournalMetricsReturn {
  metrics: JournalMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useJournalMetrics(): UseJournalMetricsReturn {
  const [metrics, setMetrics] = useState<JournalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await journalService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refresh: fetchMetrics };
}
