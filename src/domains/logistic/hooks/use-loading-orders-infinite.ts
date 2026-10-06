'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import {
  type GetLoadingOrdersParams,
  getLoadingOrders,
  type LoadingOrderListItem,
} from '../api/get-loading-orders';

export interface UseLoadingOrdersInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  companyId?: string;
}

export function useLoadingOrdersInfinite(options?: UseLoadingOrdersInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['loading-orders-infinite', perPage, search, options?.companyId],
    queryFn: ({ pageParam }) =>
      getLoadingOrders({
        page: pageParam,
        perPage,
        search: search || undefined,
        companyId: options?.companyId,
      } as GetLoadingOrdersParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const loOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((lo: LoadingOrderListItem) => ({
        value: lo.id,
        label: lo.code,
        description: `${lo.sourceWarehouse?.name ?? '-'} → ${lo.destinationWarehouse?.name ?? '-'}`,
      }))
    );
  }, [data?.pages]);

  const items: LoadingOrderListItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  return {
    options: loOptions,
    items,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
