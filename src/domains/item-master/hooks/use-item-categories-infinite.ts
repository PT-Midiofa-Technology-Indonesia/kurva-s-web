'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getItemCategories } from '../api/get-item-categories';
import { ITEM_CATEGORY_QUERY_KEYS } from './use-item-categories';

export interface UseItemCategoriesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  itemTypeId?: string;
}

export function useItemCategoriesInfinite(options?: UseItemCategoriesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...ITEM_CATEGORY_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        options?.itemTypeId,
      ],
      queryFn: ({ pageParam }) =>
        getItemCategories({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          itemTypeId: options?.itemTypeId,
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

  const itemCategoryOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((c) => ({
        value: c.id,
        label: c.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: itemCategoryOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
