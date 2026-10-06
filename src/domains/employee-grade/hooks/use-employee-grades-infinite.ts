'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getEmployeeGrades } from '../api/get-employee-grades';
import { EMPLOYEE_GRADE_QUERY_KEYS } from './use-employee-grades';

export interface UseEmployeeGradesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  isActive?: boolean;
  search?: string;
}

export function useEmployeeGradesInfinite(options?: UseEmployeeGradesInfiniteOptions) {
  const perPage = options?.perPage ?? 50;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [
      ...EMPLOYEE_GRADE_QUERY_KEYS.infinite(),
      perPage,
      options?.isActive,
      options?.search,
    ],
    queryFn: ({ pageParam }) =>
      getEmployeeGrades({
        page: pageParam,
        perPage,
        isActive: options?.isActive,
        search: options?.search,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const gradeOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.name}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: gradeOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
