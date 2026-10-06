'use client';

import { useQuery } from '@tanstack/react-query';
import { getBillingDocuments } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useBillingDocuments(params: { billingId: string; companyId?: string }) {
  return useQuery({
    queryKey: BILLINGS_QUERY_KEYS.documents(params.billingId, params.companyId),
    queryFn: () => getBillingDocuments(params),
    enabled: !!params.billingId,
  });
}
