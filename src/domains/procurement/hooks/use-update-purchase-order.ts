'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { UpdatePoParams } from '../api/update-purchase-order';
import { updatePurchaseOrder } from '../api/update-purchase-order';
import type { PurchaseOrderDetail } from '../types/purchase-order-detail';
import { PURCHASE_ORDER_QUERY_KEYS } from './use-purchase-orders';

export function useUpdatePurchaseOrder(id?: string, companyId?: string) {
  const queryClient = useQueryClient();
  const detailKey = id ? PURCHASE_ORDER_QUERY_KEYS.detail(id, companyId) : null;

  return useMutation({
    mutationFn: (params: UpdatePoParams) => updatePurchaseOrder(params),
    onMutate: async (params) => {
      if (!detailKey) return;
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<PurchaseOrderDetail>(detailKey);
      queryClient.setQueryData<PurchaseOrderDetail>(detailKey, (old) => {
        if (!old) return old;
        const itemMap = new Map(params.payload.items.map((i) => [i.id, i]));
        return {
          ...old,
          items: old.items.map((item) => {
            const patch = itemMap.get(item.id);
            if (!patch) return item;
            return {
              ...item,
              quantity: patch.quantity,
              remarks: patch.remarks ?? item.remarks,
              amount: patch.quantity * item.unitPrice,
            };
          }),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_QUERY_KEYS.lists() });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.PURCHASE_ORDER),
      });
    },
    onError: (error, _params, context) => {
      if (detailKey && context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
    onSettled: () => {
      if (detailKey) {
        queryClient.invalidateQueries({ queryKey: detailKey });
      }
    },
  });
}
