'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  type GetPurchaseOrdersParams,
  getPurchaseOrders,
} from '@/domains/procurement/api/get-purchase-orders';
import type { PurchaseOrderItem } from '@/domains/procurement/types/purchase-order';
import type { SelectOption } from '@/shared/components/atoms';

export interface UsePurchaseOrdersInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  companyId?: string;
  status?: string;
}

export function usePurchaseOrdersInfinite(options?: UsePurchaseOrdersInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['purchase-orders-infinite', perPage, search, options?.companyId, options?.status],
    queryFn: ({ pageParam }) =>
      getPurchaseOrders({
        page: pageParam,
        perPage,
        search: search || undefined,
        companyId: options?.companyId,
        status: options?.status,
      } as GetPurchaseOrdersParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const poOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((po: PurchaseOrderItem) => ({
        value: po.id,
        label: po.code,
        description: po.project?.name,
      }))
    );
  }, [data?.pages]);

  const items: PurchaseOrderItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  return {
    options: poOptions,
    items,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
