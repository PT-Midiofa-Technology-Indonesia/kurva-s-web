'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getApprovalGroups } from '../api/get-approval-groups';

export interface UseApprovalGroupsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useApprovalGroupsInfinite(options?: UseApprovalGroupsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['approval-groups-infinite', perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getApprovalGroups({
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

  const approvalGroupOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((ag) => ({
        value: ag.id,
        label: ag.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: approvalGroupOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
