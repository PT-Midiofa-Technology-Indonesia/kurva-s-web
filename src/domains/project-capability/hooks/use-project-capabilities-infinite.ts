'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getProjectCapabilities } from '../api/get-project-capabilities';
import { PROJECT_CAPABILITY_QUERY_KEYS } from './use-project-capabilities';

export interface UseProjectCapabilitiesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useProjectCapabilitiesInfinite(options?: UseProjectCapabilitiesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...PROJECT_CAPABILITY_QUERY_KEYS.infinite(), perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getProjectCapabilities({
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

  const projectCapabilityOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((c) => ({
        value: c.id,
        label: c.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: projectCapabilityOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
