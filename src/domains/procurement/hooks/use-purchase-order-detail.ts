'use client';

import { useQuery } from '@tanstack/react-query';
import { getPurchaseOrderDetail } from '../api/get-purchase-order-detail';
import { PURCHASE_ORDER_QUERY_KEYS } from './use-purchase-orders';

export function usePurchaseOrderDetail(id: string, companyId?: string) {
  return useQuery({
    queryKey: PURCHASE_ORDER_QUERY_KEYS.detail(id, companyId),
    queryFn: () => getPurchaseOrderDetail(id, companyId),
  });
}
