'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssetCategory } from '../api/get-asset-category';
import { ASSET_CATEGORY_QUERY_KEYS } from './use-asset-categories';

export function useAssetCategory(id: string) {
  return useQuery({
    queryKey: ASSET_CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => getAssetCategory(id),
    enabled: !!id,
  });
}
