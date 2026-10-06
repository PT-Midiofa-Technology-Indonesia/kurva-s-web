'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getJobItemTypes } from '../api/get-job-item-types';
import { JOB_ITEM_TYPE_QUERY_KEYS } from './use-job-item-types';

export interface UseJobItemTypesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useJobItemTypesInfinite(options?: UseJobItemTypesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...JOB_ITEM_TYPE_QUERY_KEYS.infinite(), perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getJobItemTypes({
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

  const options_: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((j) => ({
        value: j.id,
        label: j.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: options_,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
