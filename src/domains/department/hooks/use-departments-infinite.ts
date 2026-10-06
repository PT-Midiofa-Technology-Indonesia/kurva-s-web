'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getDepartments } from '../api/get-departments';
import { DEPARTMENT_QUERY_KEYS } from './use-departments';

export interface UseDepartmentsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  companyId?: string;
}

export function useDepartmentsInfinite(options?: UseDepartmentsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...DEPARTMENT_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        options?.companyId,
      ],
      queryFn: ({ pageParam }) =>
        getDepartments({
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

  const departmentOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((d) => ({
        value: d.id,
        label: `${d.code} - ${d.name}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: departmentOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
