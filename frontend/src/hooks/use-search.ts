import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './use-debounce';
import { appConfig } from '@/config';

interface UseSearchReturn {
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
}

export function useSearch(
  paramKey: string = 'search',
  debounceDelay: number = appConfig.debounceDelay
): UseSearchReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get(paramKey) || '';
  const debouncedSearch = useDebounce(search, debounceDelay);

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(paramKey, value);
        else next.delete(paramKey);
        next.delete('page');
        return next;
      });
    },
    [setSearchParams, paramKey]
  );

  const clearSearch = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(paramKey);
      next.delete('page');
      return next;
    });
  }, [setSearchParams, paramKey]);

  return useMemo(
    () => ({ search, debouncedSearch, setSearch, clearSearch }),
    [search, debouncedSearch, setSearch, clearSearch]
  );
}
