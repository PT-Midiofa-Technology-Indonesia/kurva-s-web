'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetPaymentRequestsParams } from '../api/get-payment-requests';
import { getPaymentRequests } from '../api/get-payment-requests';

export const PAYMENT_REQUEST_QUERY_KEYS = {
  all: ['payment-requests'] as const,
  lists: () => [...PAYMENT_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PAYMENT_REQUEST_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PAYMENT_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PAYMENT_REQUEST_QUERY_KEYS.details(), id] as const,
  prePayChecks: () => [...PAYMENT_REQUEST_QUERY_KEYS.all, 'pre-pay-check'] as const,
  prePayCheck: (id: string) => [...PAYMENT_REQUEST_QUERY_KEYS.prePayChecks(), id] as const,
};

export function usePaymentRequests(params?: GetPaymentRequestsParams) {
  return useQuery({
    queryKey: PAYMENT_REQUEST_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getPaymentRequests(params),
    enabled: !!params?.companyId,
  });
}
