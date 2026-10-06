'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getHierarchyManagements } from '../api/get-hierarchy-managements';
import { HIERARCHY_MANAGEMENT_QUERY_KEYS } from './use-hierarchy-managements';

export interface UseHierarchyManagementsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  companyId?: string;
}

export function useHierarchyManagementsInfinite(options?: UseHierarchyManagementsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...HIERARCHY_MANAGEMENT_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        options?.companyId,
      ],
      queryFn: ({ pageParam }) =>
        getHierarchyManagements({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          companyId: options?.companyId,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const hierarchyOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((p) => ({
        value: p.id,
        label: `${p.position?.code ?? '-'} - ${p.position?.name ?? '-'}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: hierarchyOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
