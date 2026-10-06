'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getResourceUnits } from '../api/get-resource-units';
import type { ResourceUnit } from '../types';
import { RESOURCE_UNIT_QUERY_KEYS } from './use-resource-units';

export interface UseResourceUnitsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  companyId?: string;
  warehouseId?: string;
  itemType?: string;
  status?: string;
  isAllocatable?: boolean;
}

export function useResourceUnitsInfinite(options?: UseResourceUnitsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...RESOURCE_UNIT_QUERY_KEYS.all,
        'infinite',
        perPage,
        search,
        options?.companyId,
        options?.warehouseId,
        options?.itemType,
        options?.status,
        options?.isAllocatable,
      ],
      queryFn: ({ pageParam }) =>
        getResourceUnits(
          {
            page: pageParam,
            perPage,
            search: search || undefined,
            warehouseId: options?.warehouseId,
            itemType: options?.itemType,
            status: options?.status,
            isAllocatable: options?.isAllocatable,
          },
          options?.companyId
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const items: ResourceUnit[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  const resourceUnitOptions: SelectOption[] = useMemo(
    () =>
      items.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.itemCatalog?.name ?? ''}`,
      })),
    [items]
  );

  return {
    options: resourceUnitOptions,
    items,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
