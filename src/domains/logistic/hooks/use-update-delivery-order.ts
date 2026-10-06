'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { updateDeliveryOrder } from '../api/update-delivery-order';
import type { CreateDeliveryOrderPayload } from '../types/delivery-order-form';
import { DELIVERY_ORDER_QUERY_KEYS } from './use-delivery-orders';

export function useUpdateDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      companyId,
    }: {
      id: string;
      payload: Partial<CreateDeliveryOrderPayload>;
      companyId?: string;
    }) => updateDeliveryOrder(id, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DELIVERY_ORDER_QUERY_KEYS.all,
      });
      toast.success({ title: 'Status berhasil diperbarui.' });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      const fieldErrors = getFieldErrors(error);
      const description = fieldErrors ? Object.values(fieldErrors).flat().join('\n') : undefined;
      toast.error({ title: message, description });
    },
  });
}
