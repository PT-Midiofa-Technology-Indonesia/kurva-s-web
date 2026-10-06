'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteCostItemType } from '../api/delete-cost-item-type';
import { COST_ITEM_TYPE_QUERY_KEYS } from './use-cost-item-types';

export function useDeleteCostItemType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCostItemType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COST_ITEM_TYPE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.COST_ITEM_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
