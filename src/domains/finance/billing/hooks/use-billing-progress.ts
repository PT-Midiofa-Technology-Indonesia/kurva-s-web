'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetBillingProgressParams, getBillingProgress } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export const BILLING_PROGRESS_QUERY_KEYS = {
  progress: (billingId: string, companyId?: string) =>
    BILLINGS_QUERY_KEYS.progress(billingId, companyId),
};

export function useBillingProgress(params: GetBillingProgressParams) {
  return useQuery({
    queryKey: BILLING_PROGRESS_QUERY_KEYS.progress(params.billingId, params.companyId),
    queryFn: () => getBillingProgress(params),
    enabled: !!params.billingId,
  });
}
