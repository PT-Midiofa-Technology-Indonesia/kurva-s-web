'use client';

import { useQuery } from '@tanstack/react-query';
import { getItemCategory } from '../api/get-item-category';
import { ITEM_CATEGORY_QUERY_KEYS } from './use-item-categories';

export function useItemCategory(id: string) {
  return useQuery({
    queryKey: ITEM_CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => getItemCategory(id),
    enabled: !!id,
  });
}
