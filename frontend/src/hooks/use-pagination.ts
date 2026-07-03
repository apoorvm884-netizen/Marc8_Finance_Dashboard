import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGINATION } from '@/config/constants';

interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  from: number;
  to: number;
}

export function usePagination(
  initialTotal: number = 0,
  initialPage: number = PAGINATION.DEFAULT_PAGE,
  initialLimit: number = PAGINATION.DEFAULT_PAGE_SIZE
): UsePaginationReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || initialPage;
  const limit = Number(searchParams.get('limit')) || initialLimit;
  const total = initialTotal;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(p, totalPages));
      updateParams({ page: clamped > 1 ? String(clamped) : '' });
    },
    [updateParams, totalPages]
  );

  const setLimit = useCallback(
    (l: number) => {
      updateParams({ limit: l !== PAGINATION.DEFAULT_PAGE_SIZE ? String(l) : '', page: '' });
    },
    [updateParams]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(page + 1);
  }, [hasNextPage, page, setPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage(page - 1);
  }, [hasPrevPage, page, setPage]);

  const goToPage = useCallback((p: number) => setPage(p), [setPage]);

  return useMemo(
    () => ({
      page,
      limit,
      total,
      totalPages,
      setPage,
      setLimit,
      setTotal: () => {},
      nextPage,
      prevPage,
      goToPage,
      hasNextPage,
      hasPrevPage,
      from,
      to,
    }),
    [page, limit, total, totalPages, setPage, setLimit, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage, from, to]
  );
}
