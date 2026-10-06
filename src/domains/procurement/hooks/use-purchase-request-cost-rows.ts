'use client';

import { useQuery } from '@tanstack/react-query';
import { getPurchaseRequestCostRows } from '../api/get-purchase-request-cost-rows';
import { PROCUREMENT_QUERY_KEYS } from './use-purchase-requests';

export function usePurchaseRequestCostRows(
  boqItemId: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.costRows(boqItemId ?? ''),
    queryFn: () => getPurchaseRequestCostRows(boqItemId as string),
    enabled: (options?.enabled ?? true) && !!boqItemId,
  });
}
