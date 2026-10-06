'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteUom } from '../api/delete-uom';
import { UOM_QUERY_KEYS } from './use-uoms';

export function useDeleteUom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.UOM) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
