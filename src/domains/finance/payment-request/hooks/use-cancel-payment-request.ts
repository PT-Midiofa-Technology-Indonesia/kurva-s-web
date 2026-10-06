'use client';

import { useMutation } from '@tanstack/react-query';
import { cancelPaymentRequest } from '../api/cancel-payment-request';

export function useCancelPaymentRequest(paymentRequestId: string) {
  return useMutation({
    mutationFn: () => cancelPaymentRequest(paymentRequestId),
  });
}
