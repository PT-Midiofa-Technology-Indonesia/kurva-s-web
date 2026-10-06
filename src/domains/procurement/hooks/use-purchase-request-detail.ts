'use client';

import { useQuery } from '@tanstack/react-query';
import { getPurchaseRequestDetail } from '../api/get-purchase-request-detail';
import { PROCUREMENT_QUERY_KEYS } from './use-purchase-requests';

export function usePurchaseRequestDetail(id: string, companyId?: string) {
  return useQuery({
    queryKey: [...PROCUREMENT_QUERY_KEYS.all, 'detail', id, companyId],
    queryFn: () => getPurchaseRequestDetail(id, companyId),
    enabled: !!id,
  });
}
