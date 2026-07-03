import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortConfig } from '@/types';

interface UseSortReturn {
  sort: SortConfig | null;
  setSort: (field: string) => void;
  toggleSort: (field: string) => void;
  clearSort: () => void;
}

export function useSort(defaultField?: string, defaultDirection: 'asc' | 'desc' = 'desc'): UseSortReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = useMemo(() => {
    const sortField = searchParams.get('sort');
    const sortDir = searchParams.get('dir') as 'asc' | 'desc' | null;
    if (sortField) {
      return { field: sortField, direction: sortDir || 'asc' };
    }
    if (defaultField) {
      return { field: defaultField, direction: defaultDirection };
    }
    return null;
  }, [searchParams, defaultField, defaultDirection]);

  const updateSort = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (field) next.set('sort', field);
        else next.delete('sort');
        next.set('dir', direction);
        return next;
      });
    },
    [setSearchParams]
  );

  const setSort = useCallback(
    (field: string) => {
      updateSort(field, 'asc');
    },
    [updateSort]
  );

  const toggleSort = useCallback(
    (field: string) => {
      if (sort && sort.field === field) {
        const newDir = sort.direction === 'asc' ? 'desc' : 'asc';
        updateSort(field, newDir);
      } else {
        updateSort(field, 'asc');
      }
    },
    [sort, updateSort]
  );

  const clearSort = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('sort');
      next.delete('dir');
      return next;
    });
  }, [setSearchParams]);

  return useMemo(
    () => ({ sort, setSort, toggleSort, clearSort }),
    [sort, setSort, toggleSort, clearSort]
  );
}
