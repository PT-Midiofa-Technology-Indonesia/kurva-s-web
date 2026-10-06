'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { GetItemCatalogsParams, GetItemCatalogsResponse } from '../api/get-item-catalogs';
import { getItemCatalogs } from '../api/get-item-catalogs';

export const ITEM_CATALOG_QUERY_KEYS = {
  all: ['item-catalogs'] as const,
  lists: () => [...ITEM_CATALOG_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ITEM_CATALOG_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ITEM_CATALOG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ITEM_CATALOG_QUERY_KEYS.details(), id] as const,
  infinite: () => ['item-catalogs-infinite'] as const,
};

export function useItemCatalogs(
  params?: GetItemCatalogsParams,
  options?: Omit<
    UseQueryOptions<GetItemCatalogsResponse, Error, GetItemCatalogsResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: [...ITEM_CATALOG_QUERY_KEYS.all, params],
    queryFn: () => getItemCatalogs(params),
    ...options,
  });
}
