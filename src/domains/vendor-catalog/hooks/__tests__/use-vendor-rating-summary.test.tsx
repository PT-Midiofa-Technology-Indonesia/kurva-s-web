import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GetVendorRatingSummaryResponse } from '@/domains/vendor-catalog/api/get-vendor-rating-summary';
import * as vendorRatingSummaryApi from '@/domains/vendor-catalog/api/get-vendor-rating-summary';
import {
  useVendorRatingSummary,
  VENDOR_RATING_SUMMARY_QUERY_KEYS,
} from '../use-vendor-rating-summary';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useVendorRatingSummary', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(vendorRatingSummaryApi, 'getVendorRatingSummary').mockReset();
  });

  it('fetches summary with showAll and uses a dedicated summary query key', async () => {
    const summaryResponse: GetVendorRatingSummaryResponse = {
      success: true,
      message: 'Data berhasil diambil.',
      data: {
        overallAvg: 4.2,
        totalRatings: 3,
        lastRatedAt: '2026-07-16T00:00:00+00:00',
        perCategory: [
          {
            categoryId: 'cat-1',
            categoryCode: 'capability',
            categoryName: 'Capability',
            avgScore: 4.5,
            count: 3,
            isActive: true,
          },
        ],
      },
    };

    vi.spyOn(vendorRatingSummaryApi, 'getVendorRatingSummary').mockResolvedValue(summaryResponse);

    const { result } = renderHook(
      () =>
        useVendorRatingSummary({
          vendorId: 'vendor-1',
          showAll: true,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(vendorRatingSummaryApi.getVendorRatingSummary).toHaveBeenCalledWith({
      vendorId: 'vendor-1',
      showAll: true,
    });
    expect(result.current.data).toEqual(summaryResponse);
    expect(
      queryClient.getQueryData(VENDOR_RATING_SUMMARY_QUERY_KEYS.detail('vendor-1', true))
    ).toBe(result.current.data);
  });

  it('does not fetch when vendorId is missing', () => {
    renderHook(() => useVendorRatingSummary({ vendorId: undefined, showAll: false }), { wrapper });

    expect(vendorRatingSummaryApi.getVendorRatingSummary).not.toHaveBeenCalled();
  });
});
