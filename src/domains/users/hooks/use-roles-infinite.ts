'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRoles } from '@/domains/role-permissions/api/get-roles';
import { ROLE_QUERY_KEYS } from '@/domains/role-permissions/hooks/use-roles';
import type { SelectOption } from '@/shared/components/atoms';

export interface UseRolesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
}

export function useRolesInfinite(options?: UseRolesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...ROLE_QUERY_KEYS.infinite(), perPage, search],
      queryFn: ({ pageParam }) =>
        getRoles({ page: pageParam, perPage, search: search || undefined }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const rolesOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((role) => ({
        value: String(role.id),
        label: role.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: rolesOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
