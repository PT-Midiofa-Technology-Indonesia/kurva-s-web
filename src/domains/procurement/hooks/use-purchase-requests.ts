'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetPurchaseRequestsParams } from '../api/get-purchase-requests';
import { getPurchaseRequests } from '../api/get-purchase-requests';

export const PROCUREMENT_QUERY_KEYS = {
  all: ['procurement', 'purchase-requests'] as const,
  lists: () => [...PROCUREMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PROCUREMENT_QUERY_KEYS.lists(), { filters }] as const,
  costRows: (boqItemId: string) => [...PROCUREMENT_QUERY_KEYS.all, 'cost-rows', boqItemId] as const,
};

export function usePurchaseRequests(params?: GetPurchaseRequestsParams) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getPurchaseRequests(params),
  });
}
