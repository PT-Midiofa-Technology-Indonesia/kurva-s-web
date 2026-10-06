'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetBillingDetailParams, getBillingDetail } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export const BILLING_PROJECT_DETAIL_QUERY_KEYS = {
  detail: (billingId: string, companyId?: string) =>
    [...BILLINGS_QUERY_KEYS.all, 'record-detail', billingId, companyId] as const,
};

export function useBillingDetail(params: GetBillingDetailParams) {
  return useQuery({
    queryKey: BILLING_PROJECT_DETAIL_QUERY_KEYS.detail(params.billingId, params.companyId),
    queryFn: () => getBillingDetail(params),
    enabled: !!params.billingId,
  });
}
