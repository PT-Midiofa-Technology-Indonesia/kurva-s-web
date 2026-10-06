'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetBillingsParams } from '../api';
import { getBillings } from '../api';

export const BILLINGS_QUERY_KEYS = {
  all: ['billings'] as const,
  list: (params?: GetBillingsParams) => [...BILLINGS_QUERY_KEYS.all, { params }] as const,
  detail: (id: string) => [...BILLINGS_QUERY_KEYS.all, 'detail', id] as const,
  progress: (id: string, companyId?: string) =>
    [...BILLINGS_QUERY_KEYS.all, 'progress', id, companyId] as const,
  documents: (billingId: string, companyId?: string) =>
    [...BILLINGS_QUERY_KEYS.all, 'documents', billingId, companyId] as const,
};

export function useBillings(params?: GetBillingsParams) {
  return useQuery({
    queryKey: BILLINGS_QUERY_KEYS.list(params),
    queryFn: () => getBillings(params ?? {}),
    enabled: Boolean(params?.companyId || params?.projectId),
  });
}
