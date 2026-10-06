import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { getPurchaseOrderRating } from '../get-purchase-order-rating';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('getPurchaseOrderRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the purchase order rating envelope without company params or headers', async () => {
    const response = {
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
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
          rating: {
            id: 'rating-1',
            purchaseOrderId: 'po-1',
            vendorId: 'vendor-1',
            ratedAt: '2026-07-16',
            overallScore: 4.5,
            overallNote: 'Pengiriman tepat waktu.',
            scores: [
              {
                categoryId: 'cat-1',
                categoryCode: 'capability',
                categoryName: 'Capability',
                score: 5,
                note: 'Baik',
              },
            ],
          },
        },
      },
    } as const;

    mockedApi.get.mockResolvedValueOnce(response);

    const result = await getPurchaseOrderRating('po-1');

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/purchase-orders/po-1/rating');
    expect(result).toEqual(response.data.data);
  });
});
