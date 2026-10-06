'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import {
  type GetAssetCategoriesParams,
  type GetAssetCategoriesResponse,
  getAssetCategories,
} from '../api/get-asset-categories';

export const ASSET_CATEGORY_QUERY_KEYS = {
  all: ['asset-categories'] as const,
  lists: () => [...ASSET_CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ASSET_CATEGORY_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ASSET_CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ASSET_CATEGORY_QUERY_KEYS.details(), id] as const,
  infinite: () => ['asset-categories-infinite'] as const,
};

export function useAssetCategories(
  params?: GetAssetCategoriesParams,
  options?: Omit<
    UseQueryOptions<GetAssetCategoriesResponse, Error, GetAssetCategoriesResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: [...ASSET_CATEGORY_QUERY_KEYS.all, params],
    queryFn: () => getAssetCategories(params),
    ...options,
  });
}
