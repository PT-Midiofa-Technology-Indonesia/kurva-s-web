import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as purchaseOrderRatingApi from '@/domains/procurement/api/get-purchase-order-rating';
import {
  PURCHASE_ORDER_RATING_QUERY_KEYS,
  usePurchaseOrderRating,
} from '../use-purchase-order-rating';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePurchaseOrderRating', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(purchaseOrderRatingApi, 'getPurchaseOrderRating').mockReset();
  });

  it('fetches the purchase order rating envelope with a dedicated detail query key', async () => {
    const envelope = {
      vendor: { id: 'vendor-1', name: 'Vendor Makasar' },
      activeCategories: [
        {
          id: 'cat-1',
          code: 'capability',
          name: 'Capability',
          description: 'Kemampuan vendor',
          sortOrder: 1,
          isActive: true,
        },
      ],
      rating: null,
    };

    vi.spyOn(purchaseOrderRatingApi, 'getPurchaseOrderRating').mockResolvedValue(envelope);

    const { result } = renderHook(() => usePurchaseOrderRating('po-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(purchaseOrderRatingApi.getPurchaseOrderRating).toHaveBeenCalledWith('po-1');
    expect(result.current.data).toEqual(envelope);
    expect(queryClient.getQueryData(PURCHASE_ORDER_RATING_QUERY_KEYS.detail('po-1'))).toBe(
      result.current.data
    );
  });

  it('does not fetch when purchaseOrderId is missing', () => {
    renderHook(() => usePurchaseOrderRating(''), { wrapper });

    expect(purchaseOrderRatingApi.getPurchaseOrderRating).not.toHaveBeenCalled();
  });
});
