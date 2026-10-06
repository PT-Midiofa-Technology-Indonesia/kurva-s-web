'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getProjectTypes } from '../api/get-project-types';
import { PROJECT_TYPE_QUERY_KEYS } from './use-project-types';

export interface UseProjectTypesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useProjectTypesInfinite(options?: UseProjectTypesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...PROJECT_TYPE_QUERY_KEYS.all, 'infinite', perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getProjectTypes({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const projectTypeOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((t) => ({
        value: t.id,
        label: t.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: projectTypeOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
