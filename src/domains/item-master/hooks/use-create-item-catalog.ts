'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateItemCatalogPayload } from '../api/create-item-catalog';
import { createItemCatalog } from '../api/create-item-catalog';
import { ITEM_CATALOG_QUERY_KEYS } from './use-item-catalogs';

export function useCreateItemCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateItemCatalogPayload) => createItemCatalog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.infinite() });
    },
  });
}
