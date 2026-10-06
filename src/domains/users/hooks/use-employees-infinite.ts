'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getEmployees } from '@/domains/manpower/api/get-employees';
import type { EmployeeListItem } from '@/domains/manpower/types';
import type { SelectOption } from '@/shared/components/atoms';
import { USER_QUERY_KEYS } from './use-users';

export interface UseEmployeesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  companyId?: string | null;
}

export function useEmployeesInfinite(options?: UseEmployeesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';
  const companyId = options?.companyId ?? undefined;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [...USER_QUERY_KEYS.infinite(), perPage, search, companyId],
    queryFn: ({ pageParam }) =>
      getEmployees({
        page: pageParam,
        perPage,
        search: search || undefined,
        companyId: companyId || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const allEmployees: EmployeeListItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  const employeeOptions: SelectOption[] = useMemo(
    () => allEmployees.map((e) => ({ value: e.id, label: e.fullName })),
    [allEmployees]
  );

  return {
    options: employeeOptions,
    employees: allEmployees,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
