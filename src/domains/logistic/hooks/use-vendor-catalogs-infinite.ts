'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  type GetVendorCatalogsParams,
  getVendorCatalogs,
} from '@/domains/vendor-catalog/api/get-vendor-catalogs';
import type { VendorCatalogListItem } from '@/domains/vendor-catalog/types';
import type { SelectOption } from '@/shared/components/atoms';

export interface UseVendorCatalogsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useVendorCatalogsInfinite(options?: UseVendorCatalogsInfiniteOptions) {
  const perPage = options?.perPage ?? 20;
  const search = options?.search ?? '';

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['vendor-catalogs-infinite', perPage, search, options?.isActive],
    queryFn: ({ pageParam }) =>
      getVendorCatalogs({
        page: pageParam,
        perPage,
        search: search || undefined,
        isActive: options?.isActive,
      } as GetVendorCatalogsParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });

  const vendorOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((v: VendorCatalogListItem) => ({
        value: v.id,
        label: v.code ? `${v.code} - ${v.name}` : v.name,
      }))
    );
  }, [data?.pages]);

  const items: VendorCatalogListItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  return {
    options: vendorOptions,
    items,
    isLoading,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
