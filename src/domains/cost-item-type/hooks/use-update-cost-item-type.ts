'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import type { UpdateCostItemTypePayload } from '../api/update-cost-item-type';
import { updateCostItemType } from '../api/update-cost-item-type';
import { COST_ITEM_TYPE_QUERY_KEYS } from './use-cost-item-types';

export function useUpdateCostItemType(costItemTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCostItemTypePayload) => updateCostItemType(costItemTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COST_ITEM_TYPE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COST_ITEM_TYPE_QUERY_KEYS.detail(costItemTypeId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.COST_ITEM_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
