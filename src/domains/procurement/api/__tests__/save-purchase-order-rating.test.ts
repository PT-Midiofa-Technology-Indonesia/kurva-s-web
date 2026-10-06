import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { savePurchaseOrderRating } from '../save-purchase-order-rating';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('savePurchaseOrderRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts the purchase order rating payload without company params or headers', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Rating berhasil disimpan.',
        data: {
          id: 'rating-1',
        },
      },
    });

    const payload = {
      ratedAt: '2026-07-16',
      overallNote: 'Catatan overall',
      categoryScores: [
        { categoryId: 'cat-1', score: 5, note: 'Baik' },
        { categoryId: 'cat-2', score: 4, note: null },
      ],
    };

    await savePurchaseOrderRating({
      purchaseOrderId: 'po-1',
      payload,
    });

    expect(mockedApi.post).toHaveBeenCalledWith('/v1/purchase-orders/po-1/rating', payload);
  });
});
