'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import type { UpdatePaymentTypePayload } from '../api/update-payment-type';
import { updatePaymentType } from '../api/update-payment-type';
import { PAYMENT_TYPE_QUERY_KEYS } from './use-payment-types';

export function useUpdatePaymentType(paymentTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePaymentTypePayload) => updatePaymentType(paymentTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_QUERY_KEYS.detail(paymentTypeId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.PAYMENT_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
