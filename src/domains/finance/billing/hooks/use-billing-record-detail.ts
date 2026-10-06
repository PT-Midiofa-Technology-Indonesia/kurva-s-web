import { useQuery } from '@tanstack/react-query';
import {
  type GetBillingRecordDetailParams,
  getBillingRecordDetail,
} from '../api/get-billing-record-detail';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export const BILLING_RECORD_DETAIL_QUERY_KEYS = {
  all: [...BILLINGS_QUERY_KEYS.all, 'record-detail'] as const,
  detail: (billingId: string, companyId?: string) =>
    [...BILLING_RECORD_DETAIL_QUERY_KEYS.all, billingId, companyId] as const,
};

export function useBillingRecordDetail(params: GetBillingRecordDetailParams) {
  return useQuery({
    queryKey: BILLING_RECORD_DETAIL_QUERY_KEYS.detail(params.billingId, params.companyId),
    queryFn: () => getBillingRecordDetail(params),
    enabled: !!params.billingId,
  });
}
