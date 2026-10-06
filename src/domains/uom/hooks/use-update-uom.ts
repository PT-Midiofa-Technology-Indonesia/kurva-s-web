'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import type { UpdateUomPayload } from '../api/update-uom';
import { updateUom } from '../api/update-uom';
import { UOM_QUERY_KEYS } from './use-uoms';

export function useUpdateUom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUomPayload }) =>
      updateUom(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Satuan Ukuran') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
