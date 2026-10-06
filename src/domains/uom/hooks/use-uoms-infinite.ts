'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getUoms } from '../api/get-uoms';
import { UOM_QUERY_KEYS } from './use-uoms';

export interface UseUomsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  group?: string;
  groupType?: string;
}

export function useUomsInfinite(options?: UseUomsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...UOM_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        options?.group,
        options?.groupType,
      ],
      queryFn: ({ pageParam }) =>
        getUoms({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          group: options?.group,
          groupType: options?.groupType,
          sortBy: 'name',
          sortOrder: 'asc',
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: any) =>
        typeof lastPage.meta.currentPage === 'number' &&
        typeof lastPage.meta.lastPage === 'number' &&
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const uomOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((u) => ({
        value: u.id,
        label: u.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: uomOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
