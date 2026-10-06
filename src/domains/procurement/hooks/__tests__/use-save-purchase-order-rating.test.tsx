import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as savePurchaseOrderRatingApi from '@/domains/procurement/api/save-purchase-order-rating';
import {
  VENDOR_RATING_SUMMARY_QUERY_KEYS,
  VENDOR_RATINGS_QUERY_KEYS,
} from '@/domains/vendor-catalog';
import { PURCHASE_ORDER_RATING_QUERY_KEYS } from '../use-purchase-order-rating';
import { useSavePurchaseOrderRating } from '../use-save-purchase-order-rating';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useSavePurchaseOrderRating', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(savePurchaseOrderRatingApi, 'savePurchaseOrderRating').mockReset();
  });

  it('saves the rating and invalidates the purchase-order and vendor rating caches', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.spyOn(savePurchaseOrderRatingApi, 'savePurchaseOrderRating').mockResolvedValue({
      id: 'rating-1',
      ratedAt: '2026-07-17T00:00:00+00:00',
      overallScore: 5,
      note: null,
      ratedBy: { id: 'emp-1', name: 'Employee 1' },
      source: {
        type: 'purchase_order',
        id: 'po-1',
        label: 'PO-1',
        deleted: false,
      },
      scores: [],
    });

    const payload = {
      ratedAt: '2026-07-17',
      overallNote: null,
      categoryScores: [{ categoryId: 'cat-1', score: 5, note: null }],
    };

    const { result } = renderHook(() => useSavePurchaseOrderRating('po-1', 'vendor-1'), {
      wrapper,
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(savePurchaseOrderRatingApi.savePurchaseOrderRating).toHaveBeenCalledWith({
      purchaseOrderId: 'po-1',
      payload,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: PURCHASE_ORDER_RATING_QUERY_KEYS.detail('po-1'),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: VENDOR_RATING_SUMMARY_QUERY_KEYS.detail('vendor-1', false),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: VENDOR_RATING_SUMMARY_QUERY_KEYS.detail('vendor-1', true),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: VENDOR_RATINGS_QUERY_KEYS.list({ vendorId: 'vendor-1' }),
    });
  });
});
