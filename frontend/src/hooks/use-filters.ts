import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Filter } from '@/types';

interface UseFiltersReturn {
  filters: Filter[];
  addFilter: (filter: Filter) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  getFilter: (field: string) => Filter | undefined;
}

export function useFilters(): UseFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result: Filter[] = [];
    const filterParam = searchParams.get('filters');
    if (filterParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(filterParam)) as Filter[];
        result.push(...parsed);
      } catch {
        // ignore invalid filter string
      }
    }
    return result;
  }, [searchParams]);

  const persistFilters = useCallback(
    (newFilters: Filter[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newFilters.length > 0) {
          next.set('filters', encodeURIComponent(JSON.stringify(newFilters)));
        } else {
          next.delete('filters');
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams]
  );

  const addFilter = useCallback(
    (filter: Filter) => {
      const updated = filters.filter((f) => f.field !== filter.field);
      updated.push(filter);
      persistFilters(updated);
    },
    [filters, persistFilters]
  );

  const removeFilter = useCallback(
    (field: string) => {
      const updated = filters.filter((f) => f.field !== field);
      persistFilters(updated);
    },
    [filters, persistFilters]
  );

  const clearFilters = useCallback(() => {
    persistFilters([]);
  }, [persistFilters]);

  const getFilter = useCallback(
    (field: string) => filters.find((f) => f.field === field),
    [filters]
  );

  const hasFilters = filters.length > 0;

  return useMemo(
    () => ({ filters, addFilter, removeFilter, clearFilters, hasFilters, getFilter }),
    [filters, addFilter, removeFilter, clearFilters, hasFilters, getFilter]
  );
}
