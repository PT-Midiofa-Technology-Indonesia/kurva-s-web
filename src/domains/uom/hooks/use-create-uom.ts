'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createUom } from '../api/create-uom';
import { UOM_QUERY_KEYS } from './use-uoms';

export function useCreateUom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Satuan Ukuran') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
