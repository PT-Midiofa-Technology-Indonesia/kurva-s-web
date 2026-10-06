'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getPositions } from '../api/get-positions';
import { POSITION_QUERY_KEYS } from './use-positions';

export interface UsePositionsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  load?: string;
  projectId?: string;
}

export function usePositionsInfinite(options?: UsePositionsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';
  const load = options?.load;

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...POSITION_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        load,
        options?.projectId,
      ],
      queryFn: ({ pageParam }) =>
        getPositions({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          load,
          projectId: options?.projectId,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const positionOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((p) => ({
        value: p.id,
        label: `${p.code} - ${p.name}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: positionOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
