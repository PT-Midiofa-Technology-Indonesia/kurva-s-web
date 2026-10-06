'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { CancelPoParams } from '../api/cancel-purchase-order';
import { cancelPurchaseOrder } from '../api/cancel-purchase-order';
import { PURCHASE_ORDER_QUERY_KEYS } from './use-purchase-orders';

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelPoParams) => cancelPurchaseOrder(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_QUERY_KEYS.all });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.PURCHASE_ORDER),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
