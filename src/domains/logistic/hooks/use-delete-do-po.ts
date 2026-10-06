'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { deleteDoPurchaseOrder } from '../api/delete-do-purchase-order';
import { DELIVERY_ORDER_QUERY_KEYS } from './use-delivery-orders';

export function useDeleteDoPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doId, poId, companyId }: { doId: string; poId: string; companyId?: string }) =>
      deleteDoPurchaseOrder(doId, poId, companyId),
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
