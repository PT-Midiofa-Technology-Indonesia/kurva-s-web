'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { SavePurchaseOrderInvoiceParams } from '../api/save-purchase-order-invoice';
import { savePurchaseOrderInvoice } from '../api/save-purchase-order-invoice';
import { PURCHASE_ORDER_QUERY_KEYS } from './use-purchase-orders';

export function useSavePurchaseOrderInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SavePurchaseOrderInvoiceParams) => savePurchaseOrderInvoice(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.PURCHASE_ORDER),
      });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
