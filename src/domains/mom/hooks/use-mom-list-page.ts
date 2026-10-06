import { useCallback } from 'react';
import type { MomStatus } from '../types';
import { useMeetings } from './use-meetings';

export interface MomListParams {
  page: number;
  perPage: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  status?: MomStatus;
  companyId: string;
}

export interface UseMomListPageOptions {
  params: MomListParams;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

const SORTABLE_FIELDS = new Set(['title', 'startAt', 'endAt', 'location']);

export function useMomListPage({ params, onSetQueryParams }: UseMomListPageOptions) {
  const sortBy = params.sortBy && SORTABLE_FIELDS.has(params.sortBy) ? params.sortBy : undefined;

  const { data, isLoading } = useMeetings({
    companyId: params.companyId,
    search: params.search,
    status: params.status,
    sortBy: sortBy as 'title' | 'startAt' | 'endAt' | 'location' | undefined,
    sortOrder: params.sortOrder,
    page: params.page,
    perPage: params.perPage,
  });

  const handleStatusChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const status = Array.isArray(value) ? value[0] : value;
      onSetQueryParams?.({ status: status || undefined, page: 1 });
    },
    [onSetQueryParams]
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      onSetQueryParams?.({ search: value, page: 1 });
    },
    [onSetQueryParams]
  );

  const handleSort = useCallback(
    (nextSortBy: string, nextSortOrder: 'asc' | 'desc') => {
      onSetQueryParams?.({ sortBy: nextSortBy, sortOrder: nextSortOrder });
    },
    [onSetQueryParams]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      onSetQueryParams?.({ page, perPage });
    },
    [onSetQueryParams]
  );

  return {
    rows: data?.rows ?? [],
    totalItems: data?.meta.total ?? 0,
    totalPages: data?.meta.lastPage ?? 1,
    isLoading,
    handleStatusChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
