import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  VENDOR_RATING_SUMMARY_QUERY_KEYS,
  VENDOR_RATINGS_QUERY_KEYS,
} from '@/domains/vendor-catalog';
import { savePurchaseOrderRating } from '../api/save-purchase-order-rating';
import type { PurchaseOrderRatingPayload } from '../types/purchase-order-rating';
import { PURCHASE_ORDER_RATING_QUERY_KEYS } from './use-purchase-order-rating';

export function useSavePurchaseOrderRating(purchaseOrderId: string, vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchaseOrderRatingPayload) =>
      savePurchaseOrderRating({ purchaseOrderId, payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_RATING_QUERY_KEYS.detail(purchaseOrderId),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: VENDOR_RATING_SUMMARY_QUERY_KEYS.detail(vendorId, false),
        }),
        queryClient.invalidateQueries({
          queryKey: VENDOR_RATING_SUMMARY_QUERY_KEYS.detail(vendorId, true),
        }),
        queryClient.invalidateQueries({
          queryKey: VENDOR_RATINGS_QUERY_KEYS.list({ vendorId }),
        }),
      ]);
    },
  });
}
