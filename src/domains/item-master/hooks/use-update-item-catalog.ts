'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateItemCatalogPayload } from '../api/update-item-catalog';
import { updateItemCatalog } from '../api/update-item-catalog';
import { ITEM_CATALOG_QUERY_KEYS } from './use-item-catalogs';

export function useUpdateItemCatalog(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateItemCatalogPayload) => updateItemCatalog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.infinite() });
    },
  });
}
