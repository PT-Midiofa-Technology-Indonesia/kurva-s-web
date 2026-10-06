'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { DeletePurchaseRequestParams } from '../api/delete-purchase-request';
import { deletePurchaseRequest } from '../api/delete-purchase-request';
import { PROCUREMENT_QUERY_KEYS } from './use-purchase-requests';

export function useDeletePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeletePurchaseRequestParams) => deletePurchaseRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.lists() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.PURCHASE_REQUEST) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
