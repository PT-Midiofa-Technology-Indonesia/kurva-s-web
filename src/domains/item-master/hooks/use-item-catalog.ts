'use client';

import { useQuery } from '@tanstack/react-query';
import { getItemCatalog } from '../api/get-item-catalog';
import { ITEM_CATALOG_QUERY_KEYS } from './use-item-catalogs';

export function useItemCatalog(id: string) {
  return useQuery({
    queryKey: ITEM_CATALOG_QUERY_KEYS.detail(id),
    queryFn: () => getItemCatalog(id),
    enabled: !!id,
  });
}
