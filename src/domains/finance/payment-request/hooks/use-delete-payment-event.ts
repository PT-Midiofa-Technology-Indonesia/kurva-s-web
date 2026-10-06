'use client';

import { useMutation } from '@tanstack/react-query';
import { deletePaymentEvent } from '../api/delete-payment-event';

export function useDeletePaymentEvent(paymentRequestId: string) {
  return useMutation({
    mutationFn: (eventId: string) => deletePaymentEvent(paymentRequestId, eventId),
  });
}
