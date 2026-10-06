'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { IssuePoParams } from '../api/issue-purchase-order';
import { issuePurchaseOrder } from '../api/issue-purchase-order';
import { PURCHASE_ORDER_QUERY_KEYS } from './use-purchase-orders';

export function useIssuePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IssuePoParams) => issuePurchaseOrder(params),
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
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
