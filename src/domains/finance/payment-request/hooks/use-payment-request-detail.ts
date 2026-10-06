'use client';

import { useQuery } from '@tanstack/react-query';
import { getPaymentRequestDetail } from '../api/get-payment-request-detail';
import { PAYMENT_REQUEST_QUERY_KEYS } from './use-payment-requests';

export interface UsePaymentRequestDetailParams {
  id: string;
  companyId?: string;
}

export function usePaymentRequestDetail({ id, companyId }: UsePaymentRequestDetailParams) {
  return useQuery({
    queryKey: PAYMENT_REQUEST_QUERY_KEYS.detail(id),
    queryFn: () => getPaymentRequestDetail({ id, companyId }),
    enabled: !!id,
  });
}
