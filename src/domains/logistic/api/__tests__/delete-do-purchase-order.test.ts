import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteDoPurchaseOrder } from '../delete-do-purchase-order';

vi.mock('@/shared/lib/axios', () => ({
  default: { delete: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('deleteDoPurchaseOrder API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.delete).mockReset();
  });

  it('sends DELETE with correct path and X-Company-Id header', async () => {
    vi.mocked(mockAxios.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Purchase order berhasil dihapus.' },
    });

    await deleteDoPurchaseOrder('do-1', 'po-1', 'comp-001');

    expect(mockAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/logistic/delivery-orders/do-1/purchase-orders/po-1'),
      { headers: { 'X-Company-Id': 'comp-001' } }
    );
  });

  it('sends DELETE without X-Company-Id when companyId omitted', async () => {
    vi.mocked(mockAxios.delete).mockResolvedValueOnce({
      data: { success: true, message: 'OK' },
    });

    await deleteDoPurchaseOrder('do-1', 'po-1');

    expect(mockAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/logistic/delivery-orders/do-1/purchase-orders/po-1'),
      { headers: {} }
    );
  });
});
