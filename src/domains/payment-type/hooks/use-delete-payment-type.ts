'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deletePaymentType } from '../api/delete-payment-type';
import { PAYMENT_TYPE_QUERY_KEYS } from './use-payment-types';

export function useDeletePaymentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePaymentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.PAYMENT_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
