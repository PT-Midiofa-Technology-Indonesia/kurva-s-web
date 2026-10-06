'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetBillingParams, getBilling } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export const BILLING_DETAIL_QUERY_KEYS = {
  detail: (projectId: string, companyId?: string) =>
    [...BILLINGS_QUERY_KEYS.all, 'detail', projectId, companyId] as const,
};

export function useBilling(params: GetBillingParams) {
  return useQuery({
    queryKey: BILLING_DETAIL_QUERY_KEYS.detail(params.billingId, params.companyId),
    queryFn: () => getBilling(params),
    enabled: !!params.billingId,
  });
}
