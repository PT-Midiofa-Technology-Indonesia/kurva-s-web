'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getEmployees } from '../api/get-employees';

export interface UseEmployeesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  companyId?: string | null;
}

export function useEmployeesInfinite(options?: UseEmployeesInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';
  const companyId = options?.companyId ?? undefined;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['employees', 'infinite', perPage, search, companyId, options?.isActive],
    queryFn: ({ pageParam }) =>
      getEmployees({
        page: pageParam,
        perPage,
        search: search || undefined,
        isActive: options?.isActive ?? true,
        companyId: companyId || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const employeeOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((employee) => ({
        value: employee.id,
        label: employee.fullName,
      }))
    );
  }, [data?.pages]);

  return {
    options: employeeOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
