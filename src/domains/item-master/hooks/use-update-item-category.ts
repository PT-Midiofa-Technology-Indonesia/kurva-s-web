'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import type { UpdateItemCategoryPayload } from '../api/update-item-category';
import { updateItemCategory } from '../api/update-item-category';
import { ITEM_CATEGORY_QUERY_KEYS } from './use-item-categories';

export function useUpdateItemCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateItemCategoryPayload) => updateItemCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ITEM_CATEGORY_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ITEM_CATEGORY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.ITEM_CATEGORY) });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
