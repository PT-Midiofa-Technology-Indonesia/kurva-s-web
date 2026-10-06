'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDeliveryOrder } from '../api/create-delivery-order';
import type { CreateDeliveryOrderPayload } from '../types/delivery-order-form';
import { DELIVERY_ORDER_QUERY_KEYS } from './use-delivery-orders';

export function useCreateDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      companyId,
    }: {
      payload: CreateDeliveryOrderPayload;
      companyId?: string;
    }) => createDeliveryOrder(payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DELIVERY_ORDER_QUERY_KEYS.all,
      });
    },
  });
}
