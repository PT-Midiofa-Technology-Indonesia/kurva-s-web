'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetBillingPaymentDetailParams, getBillingPaymentDetail } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export const BILLING_PAYMENT_DETAIL_QUERY_KEYS = {
  detail: (billingId: string, companyId?: string) =>
    [...BILLINGS_QUERY_KEYS.all, 'payment-detail', billingId, companyId] as const,
};

export function useBillingPaymentDetail(params: GetBillingPaymentDetailParams) {
  return useQuery({
    queryKey: BILLING_PAYMENT_DETAIL_QUERY_KEYS.detail(params.billingId, params.companyId),
    queryFn: () => getBillingPaymentDetail(params),
    enabled: !!params.billingId,
  });
}
