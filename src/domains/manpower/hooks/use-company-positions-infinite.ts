'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getHierarchyManagements } from '@/domains/hierarchy-management/api/get-hierarchy-managements';
import type { SelectOption } from '@/shared/components/atoms';

export const COMPANY_POSITIONS_QUERY_KEYS = {
  infinite: () => ['company-positions-infinite'] as const,
};

export interface UseCompanyPositionsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  isActive?: boolean;
  companyId?: string;
}

export function useCompanyPositionsInfinite(options?: UseCompanyPositionsInfiniteOptions) {
  const perPage = options?.perPage ?? 50;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [
      ...COMPANY_POSITIONS_QUERY_KEYS.infinite(),
      perPage,
      options?.isActive,
      options?.companyId,
    ],
    queryFn: ({ pageParam }) =>
      getHierarchyManagements({
        page: pageParam,
        perPage,
        isActive: options?.isActive,
        companyId: options?.companyId,
      } as any),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false && !!options?.companyId,
  });

  const positionOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data
        .filter((item) => item.position)
        .map((item) => ({
          value: item.id,
          label: `${item.position!.code} - ${item.position!.name}`,
        }))
    );
  }, [data?.pages]);

  return {
    positionOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
