import { useQuery } from '@tanstack/react-query';
import { getPurchaseOrderRating } from '../api/get-purchase-order-rating';
import type { PurchaseOrderRatingEnvelope } from '../types/purchase-order-rating';

export const PURCHASE_ORDER_RATING_QUERY_KEYS = {
  all: ['purchase-order-rating'] as const,
  details: () => [...PURCHASE_ORDER_RATING_QUERY_KEYS.all, 'detail'] as const,
  detail: (purchaseOrderId: string) =>
    [...PURCHASE_ORDER_RATING_QUERY_KEYS.details(), purchaseOrderId] as const,
};

export function usePurchaseOrderRating(purchaseOrderId: string) {
  return useQuery<PurchaseOrderRatingEnvelope>({
    queryKey: PURCHASE_ORDER_RATING_QUERY_KEYS.detail(purchaseOrderId),
    queryFn: () => getPurchaseOrderRating(purchaseOrderId),
    enabled: !!purchaseOrderId,
    placeholderData: (previousData) => previousData,
  });
}
