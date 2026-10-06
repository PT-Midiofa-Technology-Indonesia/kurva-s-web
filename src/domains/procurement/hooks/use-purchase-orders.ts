'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetPurchaseOrdersParams } from '../api/get-purchase-orders';
import { getPurchaseOrders } from '../api/get-purchase-orders';

export const PURCHASE_ORDER_QUERY_KEYS = {
  all: ['procurement', 'purchase-orders'] as const,
  lists: () => [...PURCHASE_ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PURCHASE_ORDER_QUERY_KEYS.lists(), { filters }] as const,
  detail: (id: string, companyId?: string) =>
    [...PURCHASE_ORDER_QUERY_KEYS.all, 'detail', id, companyId ?? ''] as const,
};

export function usePurchaseOrders(params?: GetPurchaseOrdersParams) {
  return useQuery({
    queryKey: PURCHASE_ORDER_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getPurchaseOrders(params),
  });
}
