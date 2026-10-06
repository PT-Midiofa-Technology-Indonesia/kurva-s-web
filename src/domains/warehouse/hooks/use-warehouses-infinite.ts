'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getWarehouses } from '../api/get-warehouses';
import type { WarehouseListItem } from '../types';
import { WAREHOUSE_QUERY_KEYS } from './use-warehouses';

export interface UseWarehousesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  companyId?: string;
  includeCompanyIdParam?: boolean;
}

export function useWarehousesInfinite(options?: UseWarehousesInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';
  const companyId = options?.companyId;
  const includeCompanyIdParam = options?.includeCompanyIdParam ?? false;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [
      ...WAREHOUSE_QUERY_KEYS.lists(),
      'infinite',
      perPage,
      search,
      companyId,
      includeCompanyIdParam,
    ],
    queryFn: ({ pageParam }) =>
      getWarehouses({
        page: pageParam,
        perPage,
        search: search || undefined,
        isActive: options?.isActive ?? true,
        companyId,
        includeCompanyIdParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const warehouses: WarehouseListItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  const warehouseOptions: SelectOption[] = useMemo(
    () => warehouses.map((w) => ({ value: w.id, label: `${w.code} - ${w.name}` })),
    [warehouses]
  );

  return {
    options: warehouseOptions,
    warehouses,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
