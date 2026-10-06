'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { deleteDoItem } from '../api/delete-do-items';
import { DELIVERY_ORDER_QUERY_KEYS } from './use-delivery-orders';

export function useDeleteDoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doId,
      itemId,
      companyId,
    }: {
      doId: string;
      itemId: string;
      companyId?: string;
    }) => deleteDoItem(doId, itemId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DELIVERY_ORDER_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      const fieldErrors = getFieldErrors(error);
      const description = fieldErrors ? Object.values(fieldErrors).flat().join('\n') : undefined;
      toast.error({ title: message, description });
    },
  });
}
