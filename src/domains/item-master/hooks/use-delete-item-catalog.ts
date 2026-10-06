'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteItemCatalog } from '../api/delete-item-catalog';
import { ITEM_CATALOG_QUERY_KEYS } from './use-item-catalogs';

export function useDeleteItemCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItemCatalog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.ITEM_CATALOG) });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
