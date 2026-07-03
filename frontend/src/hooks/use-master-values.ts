import { useState, useEffect, useCallback } from 'react';
import { masterService } from '@/services/master.service';
import type { MasterValue } from '@/types/master';

interface UseMasterValuesReturn {
  values: MasterValue[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  getByCode: (code: string) => MasterValue | undefined;
  getSelectOptions: () => { label: string; value: string }[];
}

export function useMasterValues(masterType: string | null): UseMasterValuesReturn {
  const [values, setValues] = useState<MasterValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValues = useCallback(async () => {
    if (!masterType) {
      setValues([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await masterService.getValues(masterType, { limit: 100, sort_by: 'display_order', sort_order: 'asc' });
      const data = result.data ?? [];
      setValues(data.filter((v: MasterValue) => v.is_active && !v.deleted_at));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load values';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [masterType]);

  useEffect(() => {
    fetchValues();
  }, [fetchValues]);

  const getByCode = useCallback(
    (code: string) => values.find((v) => v.code === code),
    [values]
  );

  const getSelectOptions = useCallback(
    () =>
      values.map((v) => ({
        label: v.name,
        value: v.code,
      })),
    [values]
  );

  return { values, loading, error, refresh: fetchValues, getByCode, getSelectOptions };
}
