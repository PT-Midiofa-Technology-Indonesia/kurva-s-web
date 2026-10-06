'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getDocumentTypes } from '../api/get-document-types';
import { DOCUMENT_TYPE_QUERY_KEYS } from './use-document-types';

export interface UseDocumentTypesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useDocumentTypesInfinite(options?: UseDocumentTypesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [...DOCUMENT_TYPE_QUERY_KEYS.infinite(), perPage, search, options?.isActive],
    queryFn: ({ pageParam }) =>
      getDocumentTypes({
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

  const documentTypeOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((dt) => ({
        value: dt.id,
        label: `${dt.code} - ${dt.name}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: documentTypeOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
