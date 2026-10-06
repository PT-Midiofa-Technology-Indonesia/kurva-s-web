import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDeliveryOrderDetail, getDeliveryOrders } from '../get-delivery-orders';

vi.mock('@/shared/lib/axios', () => ({
  default: { get: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('getDeliveryOrders API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.get).mockReset();
  });

  it('sends GET with correct params and X-Company-Id header', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [{ id: 'do-1', code: 'DO/GEN/2026/0001' }],
        meta: { currentPage: 1, perPage: 10, total: 1, lastPage: 1, from: 1, to: 1 },
        links: { first: '', last: '', prev: null, next: null },
      },
    });

    const result = await getDeliveryOrders({
      type: 'do',
      companyId: 'comp-001',
      page: 1,
      perPage: 10,
    });

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/logistic/delivery-orders'),
      {
        params: { type: 'do', page: 1, perPage: 10 },
        headers: { 'X-Company-Id': 'comp-001' },
      }
    );
    expect(result.data).toHaveLength(1);
  });

  it('sends GET without X-Company-Id when companyId omitted', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [],
        meta: { currentPage: 1, perPage: 10, total: 0, lastPage: 0, from: 0, to: 0 },
        links: { first: '', last: '', prev: null, next: null },
      },
    });

    await getDeliveryOrders({ type: 'inbound', page: 1, perPage: 10 });

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/logistic/delivery-orders'),
      {
        params: { type: 'inbound', page: 1, perPage: 10 },
        headers: undefined,
      }
    );
  });
});

describe('getDeliveryOrderDetail API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.get).mockReset();
  });

  it('sends GET with correct path and X-Company-Id header', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 'do-1', code: 'DO/GEN/2026/0001' },
      },
    });

    const result = await getDeliveryOrderDetail('do-1', 'comp-001');

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/logistic/delivery-orders/do-1'),
      { headers: { 'X-Company-Id': 'comp-001' } }
    );
    expect(result.id).toBe('do-1');
  });

  it('sends GET without X-Company-Id when companyId omitted', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 'do-2', code: 'DO/GEN/2026/0002' },
      },
    });

    const result = await getDeliveryOrderDetail('do-2');

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/logistic/delivery-orders/do-2'),
      { headers: undefined }
    );
    expect(result.id).toBe('do-2');
  });
});
