import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GetVendorRatingsResponse } from '@/domains/vendor-catalog/api/get-vendor-ratings';
import * as vendorRatingsApi from '@/domains/vendor-catalog/api/get-vendor-ratings';
import { useVendorRatings, VENDOR_RATINGS_QUERY_KEYS } from '../use-vendor-ratings';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useVendorRatings', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(vendorRatingsApi, 'getVendorRatings').mockReset();
  });

  it('fetches rating history with filters and uses a dedicated history query key', async () => {
    const params: {
      vendorId: string;
      sourceType: string;
      dateFrom: string;
      dateTo: string;
      page: number;
      perPage: number;
    } = {
      vendorId: 'vendor-1',
      sourceType: 'purchase_order',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-16',
      page: 1,
      perPage: 10,
    };

    const historyResponse: GetVendorRatingsResponse = {
      success: true,
      message: 'Data berhasil diambil.',
      data: [],
      meta: { currentPage: 1, perPage: 10, total: 0, lastPage: 1, from: null, to: null },
      links: { first: '', last: '', prev: null, next: null },
    };

    vi.spyOn(vendorRatingsApi, 'getVendorRatings').mockResolvedValue(historyResponse);

    const { result } = renderHook(() => useVendorRatings(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(vendorRatingsApi.getVendorRatings).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(historyResponse);
    expect(queryClient.getQueryData(VENDOR_RATINGS_QUERY_KEYS.list(params))).toBe(
      result.current.data
    );
  });

  it('does not fetch when vendorId is missing', () => {
    renderHook(() => useVendorRatings({ vendorId: undefined, page: 1, perPage: 10 }), { wrapper });

    expect(vendorRatingsApi.getVendorRatings).not.toHaveBeenCalled();
  });
});
