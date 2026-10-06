'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getAssetCategories } from '../api/get-asset-categories';
import { ASSET_CATEGORY_QUERY_KEYS } from './use-asset-categories';

export interface UseAssetCategoriesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  depreciationMethod?: string;
}

export function useAssetCategoriesInfinite(options?: UseAssetCategoriesInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...ASSET_CATEGORY_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        options?.depreciationMethod,
      ],
      queryFn: ({ pageParam }) =>
        getAssetCategories({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          depreciationMethod: options?.depreciationMethod,
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

  const categoryOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((category) => ({
        value: category.id,
        label: `${category.code} - ${category.name}`,
      }))
    );
  }, [data?.pages]);

  const categories = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  return {
    options: categoryOptions,
    items: categories,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
