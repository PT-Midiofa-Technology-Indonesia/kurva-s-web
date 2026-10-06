'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getProjects } from '../api/get-projects';

export interface UseProjectsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  companyId?: string | null;
}

export function useProjectsInfinite(options?: UseProjectsInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';
  const companyId = options?.companyId ?? undefined;

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['projects', 'infinite', perPage, search, companyId],
      queryFn: ({ pageParam }) =>
        getProjects({
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

  const projectOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((p) => ({
        value: p.id,
        label: (p as any).name ?? p.projectName,
      }))
    );
  }, [data?.pages]);

  return {
    options: projectOptions,
    isLoading,
    isFetching,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
