'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getItemCatalogs } from '../api/get-item-catalogs';
import type { ItemCatalogListItem } from '../types';
import { ITEM_CATALOG_QUERY_KEYS } from './use-item-catalogs';

export interface UseItemCatalogsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  itemTypeId?: string;
  itemCategoryId?: string;
  isAllocatable?: boolean;
}

export function useItemCatalogsInfinite(options?: UseItemCatalogsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...ITEM_CATALOG_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        options?.itemTypeId,
        options?.itemCategoryId,
        options?.isAllocatable,
      ],
      queryFn: ({ pageParam }) =>
        getItemCatalogs({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          itemTypeId: options?.itemTypeId,
          itemCategoryId: options?.itemCategoryId,
          isAllocatable: options?.isAllocatable,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const items: ItemCatalogListItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  const itemCatalogOptions: SelectOption[] = useMemo(
    () =>
      items.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.name}`,
      })),
    [items]
  );

  return {
    options: itemCatalogOptions,
    items,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
