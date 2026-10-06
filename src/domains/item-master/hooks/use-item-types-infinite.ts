'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getItemTypes } from '../api/get-item-types';
import { ITEM_TYPE_QUERY_KEYS } from './use-item-types';

export interface UseItemTypesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useItemTypesInfinite(options?: UseItemTypesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...ITEM_TYPE_QUERY_KEYS.infinite(), perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getItemTypes({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          sortBy: 'name',
          sortOrder: 'asc',
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const itemTypeOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((t) => ({
        value: t.id,
        label: t.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: itemTypeOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
