'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getWarehouses } from '@/domains/warehouse/api/get-warehouses';
import { WAREHOUSE_QUERY_KEYS } from '@/domains/warehouse/hooks/use-warehouses';
import type { SelectOption } from '@/shared/components/atoms';

interface UseWarehouseInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  companyId?: string;
}

export function useWarehouseInfinite(options?: UseWarehouseInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...WAREHOUSE_QUERY_KEYS.all,
        'infinite',
        perPage,
        search,
        options?.isActive,
        options?.companyId,
      ],
      queryFn: ({ pageParam }) =>
        getWarehouses({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive ?? true,
          companyId: options?.companyId,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta?.currentPage < lastPage.meta?.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const warehouseOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((w) => ({
        value: w.id,
        label: `${w.code} - ${w.name}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: warehouseOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
