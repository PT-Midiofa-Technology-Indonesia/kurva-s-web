'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getOffices } from '../api/get-offices';
import { OFFICE_QUERY_KEYS } from './use-offices';

export interface UseOfficesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  companyId?: string;
}

export function useOfficesInfinite(options?: UseOfficesInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';
  const companyId = options?.companyId;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [...OFFICE_QUERY_KEYS.lists(), 'infinite', perPage, search, companyId],
    queryFn: ({ pageParam }) =>
      getOffices({
        page: pageParam,
        perPage,
        search: search || undefined,
        isActive: options?.isActive ?? true,
        companyId,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const officeOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((o) => ({
        value: o.id,
        label: `${o.code} - ${o.name}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: officeOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
