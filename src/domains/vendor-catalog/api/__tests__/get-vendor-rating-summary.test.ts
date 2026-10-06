import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { getVendorRatingSummary } from '../get-vendor-rating-summary';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('getVendorRatingSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the vendor rating summary with showAll and no company header', async () => {
    const response = {
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: 4.5,
          totalRatings: 2,
          lastRatedAt: '2026-07-16T00:00:00+00:00',
          perCategory: [
            {
              categoryId: 'cat-1',
              categoryCode: 'capability',
              categoryName: 'Capability',
              avgScore: 4.5,
              count: 2,
              isActive: true,
            },
          ],
        },
      },
    } as const;

    mockedApi.get.mockResolvedValueOnce(response);

    const result = await getVendorRatingSummary({
      vendorId: 'vendor-1',
      showAll: true,
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/vendors/vendor-1/ratings/summary', {
      params: {
        showAll: true,
      },
    });
    expect(mockedApi.get.mock.calls[0]?.[1]).not.toHaveProperty('headers');
    expect(result).toEqual(response.data);
  });
});
