'use client';

import { useQuery } from '@tanstack/react-query';

import { getPaymentType } from '../api/get-payment-type';
import { PAYMENT_TYPE_QUERY_KEYS } from './use-payment-types';

export function usePaymentType(paymentTypeId: string) {
  return useQuery({
    queryKey: PAYMENT_TYPE_QUERY_KEYS.detail(paymentTypeId),
    queryFn: () => getPaymentType(paymentTypeId),
    enabled: !!paymentTypeId,
    select: (data) => (data ? data.data : null),
  });
}
