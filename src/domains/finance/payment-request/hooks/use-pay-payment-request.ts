'use client';

import { useMutation } from '@tanstack/react-query';
import type { PayPaymentRequestPayload } from '../api/pay-payment-request';
import { payPaymentRequest } from '../api/pay-payment-request';

export function usePayPaymentRequest(paymentRequestId: string) {
  return useMutation({
    mutationFn: (payload: PayPaymentRequestPayload) => payPaymentRequest(paymentRequestId, payload),
  });
}
