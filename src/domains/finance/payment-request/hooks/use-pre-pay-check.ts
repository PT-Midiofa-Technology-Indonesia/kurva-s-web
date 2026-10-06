'use client';

import { useQuery } from '@tanstack/react-query';
import { getPrePayCheck } from '../api/get-pre-pay-check';
import { PAYMENT_REQUEST_QUERY_KEYS } from './use-payment-requests';

export interface UsePrePayCheckParams {
  id: string;
  companyId?: string;
}

export function usePrePayCheck({ id, companyId }: UsePrePayCheckParams) {
  return useQuery({
    queryKey: PAYMENT_REQUEST_QUERY_KEYS.prePayCheck(id),
    queryFn: () => getPrePayCheck({ id, companyId }),
    enabled: !!id,
  });
}
