'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetBillingProgressDetailParams, getBillingProgressDetail } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export const BILLING_PROGRESS_DETAIL_QUERY_KEYS = {
  detail: (billingId: string, companyId?: string) =>
    [...BILLINGS_QUERY_KEYS.all, 'progress-detail', billingId, companyId] as const,
};

export function useBillingProgressDetail(params: GetBillingProgressDetailParams) {
  return useQuery({
    queryKey: BILLING_PROGRESS_DETAIL_QUERY_KEYS.detail(params.billingId, params.companyId),
    queryFn: () => getBillingProgressDetail(params),
    enabled: !!params.billingId,
  });
}
