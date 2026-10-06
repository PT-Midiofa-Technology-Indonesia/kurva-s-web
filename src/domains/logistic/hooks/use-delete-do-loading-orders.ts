'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { deleteDoLoadingOrder } from '../api/delete-do-loading-orders';
import { DELIVERY_ORDER_QUERY_KEYS } from './use-delivery-orders';

export function useDeleteDoLoadingOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doId,
      loadingOrderId,
      companyId,
    }: {
      doId: string;
      loadingOrderId: string;
      companyId?: string;
    }) => deleteDoLoadingOrder(doId, loadingOrderId, companyId),
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
