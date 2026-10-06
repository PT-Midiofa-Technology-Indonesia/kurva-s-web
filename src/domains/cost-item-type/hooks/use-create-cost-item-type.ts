'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import { createCostItemType } from '../api/create-cost-item-type';
import { COST_ITEM_TYPE_QUERY_KEYS } from './use-cost-item-types';

export function useCreateCostItemType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCostItemType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COST_ITEM_TYPE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.COST_ITEM_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
